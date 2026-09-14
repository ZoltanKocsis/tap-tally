import { Pressable, StyleSheet } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';

import { colors, radius } from '@/lib/theme';

type Props = { onPress: () => void; size?: number };

/** A bold, unambiguous "sliders" settings glyph — deliberately distinct from Expo Go's own dev-menu icon. */
function SlidersGlyph({ size }: { size: number }) {
  const lineColor = colors.surface;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={3} y={5.5} width={18} height={2.4} rx={1.2} fill={lineColor} />
      <Circle cx={16} cy={6.7} r={2.6} fill={colors.accent2} stroke={lineColor} strokeWidth={1.4} />

      <Rect x={3} y={10.8} width={18} height={2.4} rx={1.2} fill={lineColor} />
      <Circle cx={8} cy={12} r={2.6} fill={colors.accent2} stroke={lineColor} strokeWidth={1.4} />

      <Rect x={3} y={16.1} width={18} height={2.4} rx={1.2} fill={lineColor} />
      <Circle cx={17.5} cy={17.3} r={2.6} fill={colors.accent2} stroke={lineColor} strokeWidth={1.4} />
    </Svg>
  );
}

export function SettingsButton({ onPress, size = 44 }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, { width: size, height: size }, pressed && styles.pressed]}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Settings"
    >
      <SlidersGlyph size={size * 0.5} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.ink,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
});
