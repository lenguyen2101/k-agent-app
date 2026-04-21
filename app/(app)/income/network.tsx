import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle2, ChevronRight, Users } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { incomeSummary, networkStats } from '@/mock/income';
import { formatVND, formatVNDCompact } from '@/lib/format';
import { palette, semantic } from '@/theme';
import type { NetworkLevel } from '@/types/income';

const levelColor = [
  palette.blue[600],
  palette.sienna[500],
  palette.emerald[500],
  palette.violet[600],
];

export default function IncomeNetwork() {
  const insets = useSafeAreaInsets();
  const totalHhmg = incomeSummary.network.reduce((s, l) => s + l.totalHhmg, 0);

  return (
    <View className="flex-1 bg-surface">
      <View
        className="bg-white border-b border-border-light flex-row items-center px-2"
        style={{ paddingTop: insets.top + 4, paddingBottom: 10 }}
      >
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center"
          hitSlop={8}
        >
          <ArrowLeft size={22} color={semantic.text.primary} />
        </Pressable>
        <View className="flex-1 items-center">
          <Text
            variant="h3"
            style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_700Bold' }}
          >
            Mạng lưới của tôi
          </Text>
          <Text variant="caption" className="text-text-secondary mt-0.5">
            {networkStats.totalMembers} thành viên · 4 cấp
          </Text>
        </View>
        <View className="w-10" />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Aggregate stats */}
        <View className="flex-row mx-4 mt-4 gap-3">
          <View
            className="flex-1 p-4 rounded-2xl"
            style={{
              backgroundColor: palette.blue[50],
              borderWidth: 1,
              borderColor: palette.blue[50],
            }}
          >
            <View className="flex-row items-center gap-1.5">
              <Users size={14} color={palette.blue[700]} />
              <Text variant="caption" style={{ color: palette.blue[700] }}>
                Tổng thành viên
              </Text>
            </View>
            <Text
              variant="h1"
              style={{
                color: palette.blue[700],
                fontFamily: 'BeVietnamPro_700Bold',
                marginTop: 4,
              }}
            >
              {networkStats.totalMembers}
            </Text>
            <Text variant="caption" className="text-text-secondary mt-0.5">
              4 cấp F1-F4
            </Text>
          </View>

          <View
            className="flex-1 p-4 rounded-2xl"
            style={{
              backgroundColor: palette.emerald[50],
              borderWidth: 1,
              borderColor: palette.emerald[50],
            }}
          >
            <View className="flex-row items-center gap-1.5">
              <CheckCircle2 size={14} color={palette.emerald[700]} />
              <Text variant="caption" style={{ color: palette.emerald[700] }}>
                Active QA
              </Text>
            </View>
            <Text
              variant="h1"
              style={{
                color: palette.emerald[700],
                fontFamily: 'BeVietnamPro_700Bold',
                marginTop: 4,
              }}
            >
              {networkStats.totalQa}
            </Text>
            <Text variant="caption" className="text-text-secondary mt-0.5">
              Chiếm {networkStats.qaSharePct}%
            </Text>
          </View>
        </View>

        {/* Total HHMG network */}
        <View
          className="mx-4 mt-4 p-4 rounded-2xl flex-row items-center gap-3"
          style={{
            backgroundColor: semantic.action.primarySoft,
            borderWidth: 1,
            borderColor: palette.sienna[100],
          }}
        >
          <View className="flex-1">
            <Text variant="caption" style={{ color: semantic.action.primaryDeep }}>
              Tổng HHMG mạng lưới mang lại
            </Text>
            <Text
              variant="h2"
              style={{
                color: semantic.action.primaryDeep,
                fontFamily: 'BeVietnamPro_700Bold',
                marginTop: 2,
              }}
            >
              {formatVND(totalHhmg)}
            </Text>
          </View>
        </View>

        {/* Levels F1-F4 */}
        <View className="mx-4 mt-5">
          <Text variant="h3" className="text-text-primary mb-3">
            Chi tiết 4 cấp
          </Text>
          <View style={{ gap: 12 }}>
            {incomeSummary.network.map((lvl, idx) => (
              <LevelCard key={lvl.level} level={lvl} color={levelColor[idx]} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function LevelCard({ level, color }: { level: NetworkLevel; color: string }) {
  return (
    <Pressable
      className="bg-surface-card rounded-2xl p-4 active:opacity-90"
      style={{
        borderWidth: 1,
        borderColor: semantic.border.light,
        shadowColor: palette.obsidian[900],
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
    >
      <View className="flex-row items-center gap-3">
        <View
          className="w-12 h-12 rounded-2xl items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Text
            variant="h2"
            style={{ color, fontFamily: 'BeVietnamPro_700Bold' }}
          >
            F{level.level}
          </Text>
        </View>
        <View className="flex-1">
          <Text variant="h3" className="text-text-primary">
            Cấp {level.level}
          </Text>
          <View className="flex-row items-center gap-1.5 mt-0.5">
            <Text
              variant="body"
              style={{ color, fontFamily: 'BeVietnamPro_700Bold' }}
            >
              {level.memberCount} MG
            </Text>
            <Text variant="caption" className="text-text-tertiary">·</Text>
            <Text variant="caption" className="text-text-secondary">
              {level.activeQaCount} active
            </Text>
          </View>
        </View>
        <ChevronRight size={18} color={semantic.text.tertiary} />
      </View>

      <View
        className="flex-row mt-3 pt-3 gap-4"
        style={{ borderTopWidth: 1, borderTopColor: semantic.border.light }}
      >
        <View className="flex-1">
          <Text variant="caption" className="text-text-secondary">HHMG mang lại</Text>
          <Text
            variant="body"
            style={{
              color: semantic.text.primary,
              fontFamily: 'BeVietnamPro_700Bold',
              marginTop: 1,
            }}
          >
            {formatVNDCompact(level.totalHhmg)}
          </Text>
        </View>
        <View style={{ width: 1, backgroundColor: semantic.border.light }} />
        <View className="flex-1">
          <Text variant="caption" className="text-text-secondary">Tỷ lệ bạn nhận</Text>
          <Text
            variant="body"
            style={{
              color: semantic.action.primary,
              fontFamily: 'BeVietnamPro_700Bold',
              marginTop: 1,
            }}
          >
            {level.mySharePct}%
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
