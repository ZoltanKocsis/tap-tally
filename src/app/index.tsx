import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, router, useFocusEffect } from 'expo-router';

import { Header } from '@/components/Header';
import { PERIOD_TITLES, type Period } from '@/lib/aggregate';
import { addEntry, deleteEntry, deleteMostRecentEntry, type Entry, getTodayEntries } from '@/lib/db';
import { formatDayHeader, formatTime } from '@/lib/format';
import { useItems } from '@/lib/items-context';
import { colors, fontSize, radius, spacing } from '@/lib/theme';

const HISTORY_PERIODS: Period[] = ['week', 'month', 'year', 'all'];

export default function Home() {
  const { onboarded, currentItem } = useItems();
  const [entries, setEntries] = useState<Entry[]>([]);

  const refresh = useCallback(() => {
    if (currentItem) setEntries(getTodayEntries(currentItem.id));
  }, [currentItem]);

  useFocusEffect(refresh);

  if (!onboarded || !currentItem) {
    return <Redirect href="/onboarding" />;
  }

  function handleAdd() {
    if (!currentItem) return;
    addEntry(currentItem.id);
    refresh();
  }

  function handleCancel() {
    if (!currentItem) return;
    if (deleteMostRecentEntry(currentItem.id)) refresh();
  }

  function handleDelete(id: number) {
    deleteEntry(id);
    refresh();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
      <Header />

      <View style={styles.summary}>
        <Text style={styles.day}>{formatDayHeader(new Date())}</Text>
        <Text style={styles.total}>
          <Text style={styles.totalNumber}>{entries.length}</Text> {currentItem.name} today
        </Text>
      </View>

      <View style={styles.actionsRow}>
        <Pressable style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>+1 {currentItem.name}</Text>
        </Pressable>
        <Pressable
          style={[styles.cancelButton, entries.length === 0 && styles.buttonDisabled]}
          onPress={handleCancel}
          disabled={entries.length === 0}
        >
          <Text style={styles.cancelButtonText}>Cancel +1</Text>
        </Pressable>
      </View>

      <FlatList
        style={styles.log}
        contentContainerStyle={styles.logContent}
        data={entries}
        keyExtractor={(item) => `${item.id}`}
        ListEmptyComponent={<Text style={styles.emptyLog}>Nothing logged yet today.</Text>}
        renderItem={({ item }) => (
          <View style={styles.logRow}>
            <Text style={styles.logTime}>{formatTime(new Date(item.ts))}</Text>
            <Pressable onPress={() => handleDelete(item.id)} hitSlop={10}>
              <Text style={styles.logDelete}>✕</Text>
            </Pressable>
          </View>
        )}
      />

      <View style={styles.navRow}>
        {HISTORY_PERIODS.map((period) => (
          <Pressable key={period} style={styles.navButton} onPress={() => router.push(`/history/${period}`)}>
            <Text style={styles.navButtonText}>{PERIOD_TITLES[period]}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  summary: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  day: { fontSize: fontSize.md, color: colors.muted },
  total: { fontSize: fontSize.lg, color: colors.ink, marginTop: spacing.xs },
  totalNumber: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.accent },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  addButton: {
    flex: 3,
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: { color: colors.surface, fontSize: fontSize.lg, fontWeight: '700' },
  cancelButton: {
    flex: 2,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: { color: colors.danger, fontSize: fontSize.sm, fontWeight: '600' },
  buttonDisabled: { opacity: 0.4 },
  log: { flex: 1, marginTop: spacing.md },
  logContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  emptyLog: { color: colors.muted, textAlign: 'center', marginTop: spacing.lg },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  logTime: { color: colors.ink, fontSize: fontSize.md, fontVariant: ['tabular-nums'] },
  logDelete: { color: colors.muted, fontSize: fontSize.md },
  navRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  navButton: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  navButtonText: { color: colors.ink, fontSize: fontSize.sm, fontWeight: '600' },
});
