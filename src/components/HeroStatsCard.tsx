import { useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, Line, Pattern, Rect } from 'react-native-svg';
import { Text } from '@/components/ui/Text';
import { palette, semantic } from '@/theme';

type Stat = {
  label: string;
  value: number | string;
  tone?: 'default' | 'accent' | 'urgent' | 'success';
};

// Pattern type cho pipeline bar — kẻ sọc / chấm bi / solid để phân biệt
// giữa 5 segment cùng tone sienna (không dùng đa màu clash brand).
export type PipelinePattern = 'stripes' | 'dots' | 'solid';

export type PipelineSegment = {
  key: string;
  label: string;
  count: number;
  /** Màu fill chính (solid) hoặc màu stroke của pattern */
  color: string;
  pattern?: PipelinePattern;
};

type Props = {
  title: string;
  stats?: [Stat, Stat, Stat] | [Stat, Stat, Stat, Stat];
  pipeline?: PipelineSegment[];
};

const toneColor = {
  default: semantic.text.primary,
  accent: semantic.action.primary,
  urgent: semantic.urgency.fg,
  success: palette.emerald[600],
} as const;

const BAR_HEIGHT = 12;

export function HeroStatsCard({ title, stats, pipeline }: Props) {
  const total = pipeline?.reduce((s, p) => s + p.count, 0) ?? 0;

  return (
    <View
      className="rounded-2xl overflow-hidden"
      style={{
        borderWidth: 1,
        borderColor: palette.sienna[100],
        shadowColor: palette.sienna[700],
        shadowOpacity: 0.08,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
        elevation: 3,
      }}
    >
      <LinearGradient
        colors={[...semantic.gradient.statCardSoft]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 20 }}
      >
        <Text
          variant="h3"
          style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_700Bold' }}
        >
          {title}
        </Text>

        {pipeline && pipeline.length > 0 && (
          <View className="mt-4">
            <PipelineBar segments={pipeline} />
            <View className="flex-row flex-wrap gap-x-4 gap-y-1 mt-3">
              {pipeline.map((seg) => (
                <View key={seg.key} className="flex-row items-center gap-1.5">
                  <LegendSwatch color={seg.color} pattern={seg.pattern ?? 'solid'} />
                  <Text variant="caption" style={{ color: semantic.text.secondary }}>
                    {seg.label} · {seg.count}
                  </Text>
                </View>
              ))}
            </View>
            <Text
              variant="caption"
              style={{ color: semantic.text.tertiary, marginTop: 8 }}
            >
              Tổng cộng {total} lead
            </Text>
          </View>
        )}

        {stats && stats.length > 0 && (
          <View className="flex-row gap-3 mt-5">
            {stats.map((s, i) => (
              <View key={i} className="flex-1">
                <Text
                  variant="display"
                  style={{ color: toneColor[s.tone ?? 'default'] }}
                >
                  {s.value}
                </Text>
                <Text
                  variant="caption"
                  style={{ color: semantic.text.secondary, marginTop: 2 }}
                >
                  {s.label}
                </Text>
              </View>
            ))}
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

// ---

// SVG-based pipeline bar — mỗi segment là Rect với fill = solid color hoặc url(#pattern).
// Pattern được define 1 lần trong <Defs/>, share giữa các segment cùng pattern type.
function PipelineBar({ segments }: { segments: PipelineSegment[] }) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const total = segments.reduce((s, seg) => s + Math.max(seg.count, 0), 0);
  const effectiveTotal = Math.max(total, 1);

  let cursorX = 0;
  const rects = segments.map((seg) => {
    const segWidth = (Math.max(seg.count, 0) / effectiveTotal) * width;
    const x = cursorX;
    cursorX += segWidth;
    const fill =
      seg.pattern === 'stripes'
        ? `url(#p-stripes-${seg.key})`
        : seg.pattern === 'dots'
        ? `url(#p-dots-${seg.key})`
        : seg.color;
    return (
      <Rect key={seg.key} x={x} y={0} width={segWidth} height={BAR_HEIGHT} fill={fill} />
    );
  });

  return (
    <View
      onLayout={onLayout}
      style={{
        height: BAR_HEIGHT,
        borderRadius: BAR_HEIGHT / 2,
        overflow: 'hidden',
        backgroundColor: palette.sienna[50],
      }}
    >
      {width > 0 && (
        <Svg width={width} height={BAR_HEIGHT}>
          <Defs>
            {segments.map((seg) =>
              seg.pattern === 'stripes' ? (
                <Pattern
                  key={`p-stripes-${seg.key}`}
                  id={`p-stripes-${seg.key}`}
                  x="0"
                  y="0"
                  width="6"
                  height="6"
                  patternUnits="userSpaceOnUse"
                >
                  <Rect width="6" height="6" fill={seg.color} />
                  <Line
                    x1="-1"
                    y1="5"
                    x2="7"
                    y2="-3"
                    stroke={palette.sienna[50]}
                    strokeWidth="1.8"
                  />
                  <Line
                    x1="-1"
                    y1="11"
                    x2="7"
                    y2="3"
                    stroke={palette.sienna[50]}
                    strokeWidth="1.8"
                  />
                </Pattern>
              ) : seg.pattern === 'dots' ? (
                <Pattern
                  key={`p-dots-${seg.key}`}
                  id={`p-dots-${seg.key}`}
                  x="0"
                  y="0"
                  width="5"
                  height="5"
                  patternUnits="userSpaceOnUse"
                >
                  <Rect width="5" height="5" fill={seg.color} />
                  <Circle cx="2.5" cy="2.5" r="1" fill={palette.sienna[50]} opacity="0.7" />
                </Pattern>
              ) : null
            )}
          </Defs>
          {rects}
        </Svg>
      )}
    </View>
  );
}

// Legend swatch — mini square 10x10 render pattern tương ứng để user đối chiếu với bar.
function LegendSwatch({ color, pattern }: { color: string; pattern: PipelinePattern }) {
  const size = 10;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 3,
        overflow: 'hidden',
        backgroundColor: color,
      }}
    >
      {pattern === 'stripes' && (
        <Svg width={size} height={size}>
          <Line x1="-1" y1="8" x2="11" y2="-4" stroke={palette.sienna[50]} strokeWidth="1.6" />
          <Line x1="-1" y1="14" x2="11" y2="2" stroke={palette.sienna[50]} strokeWidth="1.6" />
        </Svg>
      )}
      {pattern === 'dots' && (
        <Svg width={size} height={size}>
          <Circle cx="3" cy="3" r="1" fill={palette.sienna[50]} opacity="0.8" />
          <Circle cx="7" cy="7" r="1" fill={palette.sienna[50]} opacity="0.8" />
        </Svg>
      )}
    </View>
  );
}
