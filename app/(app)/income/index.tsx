import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  Info,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { PieChart, PieLegend, incomeSourceColors, type PieSegment } from '@/components/PieChart';
import { incomeSummary, networkStats } from '@/mock/income';
import { formatVND, formatVNDCompact } from '@/lib/format';
import { palette, semantic } from '@/theme';
import { incomeSourceLabels } from '@/types/income';

export default function IncomeDashboard() {
  const insets = useSafeAreaInsets();

  const segments: PieSegment[] = incomeSummary.breakdown.map((b) => ({
    key: b.source,
    value: b.amount,
    color: incomeSourceColors[b.source],
    label: incomeSourceLabels[b.source],
  }));

  return (
    <View className="flex-1 bg-surface">
      {/* Custom header */}
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
            Tổng kết thu nhập
          </Text>
          <Pressable className="flex-row items-center gap-1 mt-0.5" hitSlop={6}>
            <Text variant="caption" className="text-text-secondary">
              {incomeSummary.periodLabel}
            </Text>
            <ChevronDown size={13} color={semantic.text.secondary} />
          </Pressable>
        </View>
        <View className="w-10" />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Info banner */}
        <View
          className="mx-4 mt-3 p-3 rounded-xl flex-row items-center gap-2"
          style={{ backgroundColor: palette.sky[50] }}
        >
          <Info size={16} color={palette.sky[600]} />
          <Text variant="caption" style={{ color: palette.sky[600], flex: 1 }}>
            Bạn đang xem thu nhập từ {formatShortDate(incomeSummary.periodFrom)} đến{' '}
            {formatShortDate(incomeSummary.periodTo)}
          </Text>
        </View>

        {/* Hero stats — light sienna */}
        <View
          className="mx-4 mt-4 p-5 rounded-2xl"
          style={{
            backgroundColor: semantic.action.primarySoft,
            borderWidth: 1,
            borderColor: palette.sienna[100],
            shadowColor: semantic.action.primaryDeep,
            shadowOpacity: 0.08,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 6 },
            elevation: 3,
          }}
        >
          <Text variant="body" style={{ color: semantic.action.primaryDeep, fontFamily: 'BeVietnamPro_600SemiBold' }}>
            Tổng thu nhập ròng
          </Text>

          <View className="flex-row items-end gap-3 mt-1">
            <Text
              variant="h1"
              style={{
                color: semantic.action.primaryDeep,
                fontFamily: 'BeVietnamPro_700Bold',
                fontSize: 32,
                lineHeight: 38,
              }}
            >
              {formatVND(incomeSummary.netTotal)}
            </Text>
          </View>

          <View className="flex-row items-center gap-1.5 mt-1.5">
            <View
              className="flex-row items-center gap-0.5 px-2 py-0.5 rounded-full"
              style={{ backgroundColor: palette.emerald[50] }}
            >
              <ArrowUpRight size={12} color={palette.emerald[700]} strokeWidth={2.6} />
              <Text
                variant="caption"
                style={{
                  color: palette.emerald[700],
                  fontFamily: 'BeVietnamPro_700Bold',
                  fontSize: 12,
                }}
              >
                +{incomeSummary.trendPct}%
              </Text>
            </View>
            <Text variant="caption" className="text-text-secondary">
              Cùng kỳ tháng trước
            </Text>
          </View>

          <View
            className="flex-row mt-4 pt-4 gap-4"
            style={{ borderTopWidth: 1, borderTopColor: palette.sienna[100] }}
          >
            <View className="flex-1">
              <Text variant="caption" className="text-text-secondary">
                Thu nhập đã nhận
              </Text>
              <Text
                variant="h3"
                style={{
                  color: semantic.text.primary,
                  fontFamily: 'BeVietnamPro_700Bold',
                  marginTop: 2,
                }}
              >
                {formatVNDCompact(incomeSummary.paidAmount)}
              </Text>
            </View>
            <View style={{ width: 1, backgroundColor: palette.sienna[100] }} />
            <View className="flex-1">
              <Text variant="caption" className="text-text-secondary">
                Chờ thanh toán
              </Text>
              <Text
                variant="h3"
                style={{
                  color: semantic.text.primary,
                  fontFamily: 'BeVietnamPro_700Bold',
                  marginTop: 2,
                }}
              >
                {formatVNDCompact(incomeSummary.pendingAmount)}
              </Text>
            </View>
          </View>
        </View>

        {/* Cơ cấu nguồn thu nhập — PieChart + Legend */}
        <View className="mx-4 mt-4 p-4 rounded-2xl bg-surface-card border border-border-light">
          <Text variant="h3" className="text-text-primary mb-3">
            Cơ cấu nguồn thu nhập
          </Text>

          <View className="flex-row items-center gap-4">
            <PieChart
              segments={segments}
              size={140}
              thickness={22}
              centerLabel="Tổng"
              centerValue={formatVNDCompact(incomeSummary.netTotal)}
            />
            <View className="flex-1">
              <PieLegend segments={segments} />
            </View>
          </View>
        </View>

        {/* Thống kê thu nhập (GSM vs HHMG mạng lưới) */}
        <View
          className="mx-4 mt-4 rounded-2xl bg-surface-card border border-border-light"
        >
          <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
            <View className="flex-row items-center gap-2">
              <View
                className="w-7 h-7 rounded-full items-center justify-center"
                style={{ backgroundColor: palette.sienna[100] }}
              >
                <Sparkles size={14} color={semantic.action.primaryDeep} strokeWidth={2.4} />
              </View>
              <Text variant="h3" className="text-text-primary">Thống kê thu nhập</Text>
            </View>
            <Pressable
              className="flex-row items-center gap-1"
              onPress={() => router.push('/(app)/income/transactions')}
              hitSlop={6}
            >
              <Text variant="caption" style={{ color: semantic.action.primary, fontFamily: 'BeVietnamPro_600SemiBold' }}>
                Xem chi tiết
              </Text>
              <ChevronRight size={14} color={semantic.action.primary} />
            </Pressable>
          </View>

          <View className="flex-row px-4 pb-4 gap-3">
            <View
              className="flex-1 p-3 rounded-xl"
              style={{ backgroundColor: semantic.surface.alt, borderWidth: 1, borderColor: semantic.border.light }}
            >
              <Text variant="caption" className="text-text-secondary">Tổng thu nhập GSM</Text>
              <Text
                variant="h3"
                style={{ color: palette.emerald[700], fontFamily: 'BeVietnamPro_700Bold', marginTop: 2 }}
                numberOfLines={1}
              >
                {formatVND(incomeSummary.gsmTotal)}
              </Text>
            </View>
            <View
              className="flex-1 p-3 rounded-xl"
              style={{ backgroundColor: semantic.surface.alt, borderWidth: 1, borderColor: semantic.border.light }}
            >
              <Text variant="caption" className="text-text-secondary">Tổng HHMG mạng lưới</Text>
              <Text
                variant="h3"
                style={{ color: palette.blue[700], fontFamily: 'BeVietnamPro_700Bold', marginTop: 2 }}
                numberOfLines={1}
              >
                {formatVND(incomeSummary.networkHhmgTotal)}
              </Text>
            </View>
          </View>
        </View>

        {/* Mạng lưới — summary + CTA */}
        <Pressable
          onPress={() => router.push('/(app)/income/network')}
          className="mx-4 mt-4 p-4 rounded-2xl bg-surface-card border border-border-light flex-row items-center gap-3 active:opacity-90"
        >
          <View
            className="w-11 h-11 rounded-full items-center justify-center"
            style={{ backgroundColor: palette.blue[50] }}
          >
            <Users size={20} color={palette.blue[700]} strokeWidth={2.2} />
          </View>
          <View className="flex-1">
            <Text variant="caption" className="text-text-secondary">
              Mạng lưới 4 cấp của bạn
            </Text>
            <View className="flex-row items-baseline gap-2 mt-0.5">
              <Text
                variant="h3"
                style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_700Bold' }}
              >
                {networkStats.totalMembers} MG
              </Text>
              <Text variant="caption" className="text-text-secondary">·</Text>
              <Text
                variant="body"
                style={{ color: palette.emerald[700], fontFamily: 'BeVietnamPro_600SemiBold' }}
              >
                {networkStats.totalQa} QA ({networkStats.qaSharePct}%)
              </Text>
            </View>
          </View>
          <ChevronRight size={18} color={semantic.text.tertiary} />
        </Pressable>

        {/* BIC balance */}
        <View
          className="mx-4 mt-4 p-4 rounded-2xl flex-row items-center gap-3"
          style={{
            backgroundColor: palette.obsidian[700],
          }}
        >
          <View
            className="w-11 h-11 rounded-full items-center justify-center"
            style={{ backgroundColor: 'rgba(247,243,237,0.1)' }}
          >
            <Wallet size={20} color={palette.obsidian[50]} strokeWidth={2.2} />
          </View>
          <View className="flex-1">
            <Text
              variant="caption"
              style={{ color: palette.obsidian[200], fontSize: 12 }}
            >
              Số dư BIC
            </Text>
            <Text
              variant="h2"
              style={{
                color: palette.obsidian[50],
                fontFamily: 'BeVietnamPro_700Bold',
                marginTop: 1,
              }}
            >
              {formatVND(incomeSummary.bicBalance)}
            </Text>
          </View>
          <ChevronRight size={18} color={palette.obsidian[200]} />
        </View>

        {/* Danh sách khoản thu nhập — shortcut button */}
        <Pressable
          onPress={() => router.push('/(app)/income/transactions')}
          className="mx-4 mt-4 p-4 rounded-2xl border flex-row items-center gap-3"
          style={{
            backgroundColor: palette.white,
            borderColor: semantic.border.default,
          }}
        >
          <View
            className="w-11 h-11 rounded-full items-center justify-center"
            style={{ backgroundColor: semantic.action.primarySoft }}
          >
            <TrendingUp size={20} color={semantic.action.primary} strokeWidth={2.2} />
          </View>
          <View className="flex-1">
            <Text variant="h3" className="text-text-primary">
              Danh sách khoản thu nhập
            </Text>
            <Text variant="caption" className="text-text-secondary mt-0.5">
              Lọc theo loại, trạng thái, BIC, người nhận
            </Text>
          </View>
          <ChevronRight size={18} color={semantic.text.tertiary} />
        </Pressable>
      </ScrollView>
    </View>
  );
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}
