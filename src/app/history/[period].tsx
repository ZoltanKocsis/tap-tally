import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useFocusEffect, useLocalSearchParams } from 'expo-router';

import { BarChart } from '@/components/BarChart';
import { Header } from '@/components/Header';
import { dataForPeriod, PERIOD_TITLES, type Period } from '@/lib/aggregate';
import { useItems } from '@/lib/items-context';
import { colors, fontSize, spacing } from '@/lib/theme';

const VALID_PERIODS: Period[] = ['week', 'month', 'year', 'all'];

export default function History() {
  const { period: rawPeriod } = useLocalSearchParams<{ period: string }>();
  const period: Period = VALID_PERIODS.includes(rawPeriod as Period) ? (rawPeriod as Period) : 'week';
  const { currentItem } = useItems();
  const [refreshTick, setRefreshTick] = useState(0);

  useFocusEffect(useCallback(() => setRefreshTick((t) => t + 1), []));

  const data = useMemo(
    () => (currentItem ? dataForPeriod(period, currentItem.id) : []),
    [period, currentItem, refreshTick],
  );
  const total = useMemo(() => data.reduce((sum, point) => sum + point.value, 0), [data]);

  if (!currentItem) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
      <Header showBack />
      <View style={styles.summary}>
        <Text style={styles.periodTitle}>{PERIOD_TITLES[period]}</Text>
        <Text style={styles.total}>
          {total} {currentItem.name} total
        </Text>
      </View>
      <View style={styles.chartWrap}>
        <BarChart data={data} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  summary: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  periodTitle: { fontSize: fontSize.xs, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  total: { fontSize: fontSize.lg, fontWeight: '700', color: colors.ink, marginTop: spacing.xs },
  chartWrap: { flex: 1, padding: spacing.lg },
});
