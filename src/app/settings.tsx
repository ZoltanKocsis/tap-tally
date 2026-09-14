import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, router } from 'expo-router';

import { Header } from '@/components/Header';
import { getEarliestEntryDate, getEntryCount, resetItemEntries } from '@/lib/db';
import { formatShortDate } from '@/lib/format';
import { useItems } from '@/lib/items-context';
import { colors, fontSize, radius, spacing } from '@/lib/theme';

export default function Settings() {
  const { items, currentItem, onboarded, renameItem, deleteItem, addItem, resetEverything } = useItems();
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [newItemName, setNewItemName] = useState('');
  const [dataVersion, setDataVersion] = useState(0);

  const earliest = useMemo(
    () => (currentItem ? getEarliestEntryDate(currentItem.id) : null),
    [currentItem, dataVersion],
  );
  const entryCount = useMemo(
    () => (currentItem ? getEntryCount(currentItem.id) : 0),
    [currentItem, dataVersion],
  );

  if (!onboarded || !currentItem) {
    return <Redirect href="/onboarding" />;
  }

  function commitRename(id: number, fallback: string) {
    const draft = drafts[id];
    if (draft !== undefined && draft.trim() && draft.trim() !== fallback) {
      renameItem(id, draft.trim());
    }
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function handleAddItem() {
    const trimmed = newItemName.trim();
    if (!trimmed) return;
    addItem(trimmed);
    setNewItemName('');
  }

  function confirmDeleteItem(id: number, name: string) {
    Alert.alert('Delete this item?', `"${name}" and all of its logged entries will be permanently deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteItem(id) },
    ]);
  }

  function confirmResetCurrent() {
    Alert.alert('Reset this item?', `This deletes every logged entry for "${currentItem!.name}". This can't be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          resetItemEntries(currentItem!.id);
          setDataVersion((v) => v + 1);
        },
      },
    ]);
  }

  function confirmDeleteEverything() {
    Alert.alert('Delete everything?', 'This deletes all items and all logged entries. This can\'t be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete everything',
        style: 'destructive',
        onPress: () => {
          resetEverything();
          router.replace('/onboarding');
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
      <Header showBack />

      <View style={styles.section}>
        <Text style={styles.label}>Items</Text>
        {items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <TextInput
              style={styles.itemInput}
              value={drafts[item.id] ?? item.name}
              onChangeText={(text) => setDrafts((prev) => ({ ...prev, [item.id]: text }))}
              onBlur={() => commitRename(item.id, item.name)}
              returnKeyType="done"
            />
            <Pressable
              style={styles.trashButton}
              onPress={() => confirmDeleteItem(item.id, item.name)}
              hitSlop={8}
              disabled={items.length === 1}
            >
              <Text style={[styles.trashText, items.length === 1 && styles.trashTextDisabled]}>🗑</Text>
            </Pressable>
          </View>
        ))}

        <View style={styles.addRow}>
          <TextInput
            style={styles.itemInput}
            value={newItemName}
            onChangeText={setNewItemName}
            placeholder="Add another item"
            placeholderTextColor={colors.muted}
            returnKeyType="done"
            onSubmitEditing={handleAddItem}
          />
          <Pressable style={styles.addButton} onPress={handleAddItem}>
            <Text style={styles.addButtonText}>+</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Data</Text>
        <Text style={styles.info}>
          "{currentItem.name}": {entryCount} entries{earliest ? ` · tracking since ${formatShortDate(earliest)}` : ''}
        </Text>
        <Pressable style={styles.dangerButton} onPress={confirmResetCurrent}>
          <Text style={styles.dangerButtonText}>Reset &quot;{currentItem.name}&quot;</Text>
        </Pressable>
        <Pressable style={styles.dangerButton} onPress={confirmDeleteEverything}>
          <Text style={styles.dangerButtonText}>Delete everything</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.muted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  info: { fontSize: fontSize.sm, color: colors.muted },
  itemRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  addRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', marginTop: spacing.xs },
  itemInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    color: colors.ink,
  },
  trashButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trashText: { fontSize: fontSize.lg },
  trashTextDisabled: { opacity: 0.3 },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: { color: colors.surface, fontSize: fontSize.lg, fontWeight: '700' },
  dangerButton: {
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  dangerButtonText: { color: colors.danger, fontSize: fontSize.md, fontWeight: '700' },
});
