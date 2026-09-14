import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useItems } from '@/lib/items-context';
import { colors, fontSize, radius, spacing } from '@/lib/theme';

export function ItemPicker() {
  const { items, currentItem, selectItem, addItem } = useItems();
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');

  function handleAdd() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    addItem(trimmed);
    setNewName('');
    setOpen(false);
  }

  function handleSelect(id: number) {
    selectItem(id);
    setOpen(false);
  }

  return (
    <>
      <Pressable style={styles.trigger} onPress={() => setOpen(true)}>
        <Text style={styles.triggerText} numberOfLines={1}>
          {currentItem?.name ?? 'Choose an item'}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>

      <Modal visible={open} animationType="fade" transparent onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>Switch item</Text>
            <FlatList
              data={items}
              keyExtractor={(item) => `${item.id}`}
              style={styles.list}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.row, item.id === currentItem?.id && styles.rowActive]}
                  onPress={() => handleSelect(item.id)}
                >
                  <Text style={[styles.rowText, item.id === currentItem?.id && styles.rowTextActive]}>
                    {item.name}
                  </Text>
                  {item.id === currentItem?.id && <Text style={styles.check}>✓</Text>}
                </Pressable>
              )}
            />
            <View style={styles.addRow}>
              <TextInput
                style={styles.addInput}
                value={newName}
                onChangeText={setNewName}
                placeholder="Add new item"
                placeholderTextColor={colors.muted}
                returnKeyType="done"
                onSubmitEditing={handleAdd}
              />
              <Pressable style={styles.addButton} onPress={handleAdd}>
                <Text style={styles.addButtonText}>+</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  triggerText: { flex: 1, fontSize: fontSize.md, fontWeight: '600', color: colors.ink },
  chevron: { color: colors.muted, fontSize: fontSize.md, marginLeft: spacing.xs },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 30, 26, 0.4)',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    maxHeight: '70%',
  },
  sheetTitle: { fontSize: fontSize.sm, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm },
  list: { flexGrow: 0 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  rowActive: { backgroundColor: colors.accentSoft },
  rowText: { fontSize: fontSize.md, color: colors.ink },
  rowTextActive: { fontWeight: '700' },
  check: { color: colors.accent, fontWeight: '700' },
  addRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  addInput: {
    flex: 1,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    color: colors.ink,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: { color: colors.surface, fontSize: fontSize.lg, fontWeight: '700' },
});
