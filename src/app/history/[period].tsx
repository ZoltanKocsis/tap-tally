import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams } from 'expo-router';

import { BarChart } from '@/components/BarChart';
import { dataForPeriod, PERIOD_TITLES, type Period } from '@/lib/aggregate';
import { getItemName } from '@/lib/db';
import { colors, fontSize, spacing } from '@/lib/theme';

const VALID_PERIODS: Period[] = ['week', 'month', 'year', 'all'];

export default function History() {
  const { period: rawPeriod } = useLocalSearchParams<{ period: string }>();
  const period: Period = VALID_PERIODS.includes(rawPeriod as Period) ? (rawPeriod as Period) : 'week';

  const data = useMemo(() => dataForPeriod(period), [period]);
  const itemName = useMemo(getItemName, []);
  const total = useMemo(() => data.reduce((sum, point) => sum + point.value, 0), [data]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
      <Stack.Screen options={{ title: PERIOD_TITLES[period] }} />
      <View style={styles.summary}>
        <Text style={styles.total}>
          {total} {itemName} total
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
  total: { fontSize: fontSize.lg, fontWeight: '700', color: colors.ink },
  chartWrap: { flex: 1, padding: spacing.lg },
});
