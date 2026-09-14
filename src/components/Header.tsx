import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { ItemPicker } from './ItemPicker';
import { SettingsButton } from './SettingsButton';
import { colors, fontSize, spacing } from '@/lib/theme';

type Props = { showBack?: boolean };

export function Header({ showBack = false }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.band}>
        {showBack && (
          <Pressable style={styles.back} onPress={() => router.back()} hitSlop={12}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
        )}
        <Text style={styles.tagline}>Count what counts!</Text>
      </View>
      <View style={styles.controlsRow}>
        <ItemPicker />
        <SettingsButton onPress={() => router.push('/settings')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.accent },
  band: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  back: { marginRight: spacing.sm },
  backText: { color: colors.surface, fontSize: fontSize.xxl, fontWeight: '700', lineHeight: fontSize.xxl },
  tagline: { color: colors.surface, fontSize: fontSize.lg, fontWeight: '700' },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
});
