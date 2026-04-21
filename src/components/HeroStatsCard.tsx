import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '@/components/ui/Text';
import { palette, semantic } from '@/theme';

type Stat = {
  label: string;
  value: number | string;
  tone?: 'default' | 'accent' | 'urgent' | 'success';
};

type Props = {
  title: string;
  stats: [Stat, Stat, Stat] | [Stat, Stat, Stat, Stat];
  pipeline?: PipelineSegment[];
};

export type PipelineSegment = {
  key: string;
  label: string;
  count: number;
  color: string;
};

const toneColor = {
  default: semantic.text.primary,
  accent:  semantic.action.primary,
  urgent:  semantic.urgency.fg,
  success: palette.emerald[600],
} as const;

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
            <View
              className="flex-row h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: palette.sienna[100] }}
            >
              {pipeline.map((seg) => (
                <View
                  key={seg.key}
                  style={{
                    flex: seg.count || 0.0001,
                    backgroundColor: seg.color,
                  }}
                />
              ))}
            </View>
            <View className="flex-row flex-wrap gap-x-4 gap-y-1 mt-3">
              {pipeline.map((seg) => (
                <View key={seg.key} className="flex-row items-center gap-1.5">
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: seg.color }} />
                  <Text variant="caption" className="text-text-secondary">
                    {seg.label} · {seg.count}
                  </Text>
                </View>
              ))}
            </View>
            <Text variant="caption" className="text-text-tertiary" style={{ marginTop: 8 }}>
              Tổng cộng {total} lead
            </Text>
          </View>
        )}

        <View className="flex-row gap-3 mt-5">
          {stats.map((s, i) => (
            <View key={i} className="flex-1">
              <Text
                variant="display"
                style={{
                  color: toneColor[s.tone ?? 'default'],
                  fontSize: 28,
                  lineHeight: 34,
                  fontFamily: 'BeVietnamPro_700Bold',
                }}
              >
                {s.value}
              </Text>
              <Text variant="caption" className="text-text-secondary" style={{ marginTop: 2 }}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>
      </LinearGradient>
    </View>
  );
}
