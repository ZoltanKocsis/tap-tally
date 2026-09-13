import Svg, { Circle, Ellipse } from 'react-native-svg';

import { colors } from '@/lib/theme';

type Props = { size?: number };

/** The "Orbit Dot" mark: a dashed ring (daily cycle) with a tally dot at its center. */
export function Logo({ size = 40 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Circle
        cx={24}
        cy={24}
        r={16}
        fill="none"
        stroke={colors.accent}
        strokeWidth={3}
        strokeDasharray="4 5"
        strokeLinecap="round"
      />
      <Ellipse cx={24} cy={24} rx={7} ry={4.5} fill={colors.accent2} transform="rotate(45 24 24)" />
    </Svg>
  );
}
