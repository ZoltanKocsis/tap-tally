import { ScrollView, StyleSheet, Text, View } from 'react-native';

import type { ChartPoint } from '@/lib/aggregate';
import { colors, fontSize, radius, spacing } from '@/lib/theme';

type Props = { data: ChartPoint[] };

const MIN_COLUMN_WIDTH = 34;

export function BarChart({ data }: Props) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const scrolls = data.length > 10;

  const columns = data.map((point) => {
    const pct = Math.round((point.value / max) * 100);
    return (
      <View key={point.label} style={styles.column}>
        <Text style={styles.value} numberOfLines={1}>
          {point.value}
        </Text>
        <View style={styles.track}>
          <View style={[styles.bar, { height: `${Math.max(pct, point.value > 0 ? 4 : 0)}%` }]} />
        </View>
        <Text style={styles.axisLabel} numberOfLines={1}>
          {point.label}
        </Text>
      </View>
    );
  });

  if (scrolls) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator style={styles.chartArea}>
        <View style={[styles.row, { minWidth: data.length * MIN_COLUMN_WIDTH }]}>{columns}</View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.chartArea}>
      <View style={styles.row}>{columns}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  chartArea: {
    flex: 1,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  column: {
    flex: 1,
    minWidth: MIN_COLUMN_WIDTH,
    alignItems: 'center',
    paddingHorizontal: spacing.xs / 2,
  },
  value: {
    fontSize: fontSize.xs,
    fontVariant: ['tabular-nums'],
    color: colors.muted,
    marginBottom: spacing.xs,
  },
  track: {
    flex: 1,
    width: '70%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    minHeight: 2,
  },
  axisLabel: {
    fontSize: fontSize.xs,
    color: colors.muted,
    marginTop: spacing.xs,
  },
});
