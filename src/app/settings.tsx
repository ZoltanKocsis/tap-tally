import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { exportCsv, exportXlsx } from '@/lib/export';
import { getAllEntries, getEarliestEntryDate, getItemName, resetAllEntries, setItemName } from '@/lib/db';
import { formatShortDate } from '@/lib/format';
import { colors, fontSize, radius, spacing } from '@/lib/theme';

export default function Settings() {
  const [name, setName] = useState(getItemName);
  const [busy, setBusy] = useState<'csv' | 'xlsx' | null>(null);
  const earliest = useMemo(getEarliestEntryDate, []);
  const totalCount = useMemo(() => getAllEntries().length, []);

  function saveName() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setItemName(trimmed);
    Alert.alert('Saved', `Now tracking "${trimmed}".`);
  }

  function confirmStartOver() {
    Alert.alert(
      'Start over?',
      `This deletes all logged ${getItemName()} entries. This can't be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete everything', style: 'destructive', onPress: () => resetAllEntries() },
      ],
    );
  }

  async function handleExport(kind: 'csv' | 'xlsx') {
    setBusy(kind);
    try {
      if (kind === 'csv') await exportCsv(name);
      else await exportXlsx(name);
    } catch {
      Alert.alert('Export failed', 'Something went wrong while creating the file.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
      <View style={styles.section}>
        <Text style={styles.label}>What are you counting?</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Push-ups"
          placeholderTextColor={colors.muted}
        />
        <Pressable style={styles.primaryButton} onPress={saveName}>
          <Text style={styles.primaryButtonText}>Save name</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Data</Text>
        <Text style={styles.info}>
          {totalCount} entries{earliest ? ` · tracking since ${formatShortDate(earliest)}` : ''}
        </Text>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => handleExport('csv')}
          disabled={busy !== null}
        >
          <Text style={styles.secondaryButtonText}>{busy === 'csv' ? 'Exporting…' : 'Export as CSV'}</Text>
        </Pressable>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => handleExport('xlsx')}
          disabled={busy !== null}
        >
          <Text style={styles.secondaryButtonText}>{busy === 'xlsx' ? 'Exporting…' : 'Export as Excel (.xlsx)'}</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Pressable style={styles.dangerButton} onPress={confirmStartOver}>
          <Text style={styles.dangerButtonText}>Start over (delete all data)</Text>
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
  label: { fontSize: fontSize.sm, color: colors.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  info: { fontSize: fontSize.sm, color: colors.muted },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    color: colors.ink,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  primaryButtonText: { color: colors.surface, fontSize: fontSize.md, fontWeight: '700' },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  secondaryButtonText: { color: colors.ink, fontSize: fontSize.md, fontWeight: '600' },
  dangerButton: {
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  dangerButtonText: { color: colors.danger, fontSize: fontSize.md, fontWeight: '700' },
});
