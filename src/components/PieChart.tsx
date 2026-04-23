import { View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { Text } from '@/components/ui/Text';
import { palette, semantic } from '@/theme';

export type PieSegment = {
  key: string;
  value: number;          // absolute, sẽ được tính % tự động
  color: string;
  label: string;
};

type Props = {
  segments: PieSegment[];
  size?: number;          // outer diameter
  thickness?: number;     // ring thickness
  centerLabel?: string;   // dòng nhỏ trên
  centerValue?: string;   // số to giữa
  gapDeg?: number;        // khoảng trắng giữa các segment
};

// Donut chart dùng stacked strokes với stroke-dasharray.
// Quay -90deg để segment đầu bắt đầu ở 12h.
export function PieChart({
  segments,
  size = 160,
  thickness = 20,
  centerLabel,
  centerValue,
  gapDeg = 2,
}: Props) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const gapLen = (gapDeg / 360) * circumference;

  let cumulative = 0;
  const paths = segments.map((seg) => {
    const pct = seg.value / total;
    const arc = Math.max(pct * circumference - gapLen, 0);
    const offset = -cumulative;
    cumulative += pct * circumference;
    return {
      key: seg.key,
      color: seg.color,
      arc,
      rest: circumference - arc,
      offset,
    };
  });

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <G rotation={-90} origin={`${cx}, ${cy}`}>
          {/* Track ring */}
          <Circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={semantic.border.light}
            strokeWidth={thickness}
          />
          {paths.map((p) => (
            <Circle
              key={p.key}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={p.color}
              strokeWidth={thickness}
              strokeDasharray={`${p.arc} ${p.rest}`}
              strokeDashoffset={p.offset}
              strokeLinecap="butt"
            />
          ))}
        </G>
      </Svg>

      {(centerLabel || centerValue) && (
        <View style={{ position: 'absolute', alignItems: 'center' }}>
          {centerLabel && (
            <Text
              variant="caption"
              style={{ color: semantic.text.tertiary }}
            >
              {centerLabel}
            </Text>
          )}
          {centerValue && (
            <Text
              variant="h2"
              style={{
                color: semantic.text.primary,
                fontFamily: 'BeVietnamPro_700Bold',
              }}
            >
              {centerValue}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

// Legend row — dot + label + pct aligned
export function PieLegend({
  segments,
  total,
}: {
  segments: PieSegment[];
  total?: number;
}) {
  const sum = (total ?? segments.reduce((s, seg) => s + seg.value, 0)) || 1;
  return (
    <View style={{ gap: 10 }}>
      {segments.map((seg) => {
        const pct = (seg.value / sum) * 100;
        return (
          <View
            key={seg.key}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
          >
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: seg.color,
              }}
            />
            <Text
              variant="caption"
              style={{ color: semantic.text.secondary, flex: 1 }}
              numberOfLines={1}
            >
              {seg.label}
            </Text>
            <Text
              variant="caption"
              style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_700Bold' }}
            >
              {pct.toFixed(1).replace('.', ',')}%
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// Preset color cho 3 source thu nhập — map giữ nguyên trên toàn app Income
export const incomeSourceColors = {
  GSM: palette.emerald[500],
  HHMG_NETWORK: palette.blue[600],
  BONUS: palette.sienna[500],
} as const;
