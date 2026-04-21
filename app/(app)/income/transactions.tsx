import { useMemo, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  CircleDashed,
  SlidersHorizontal,
  TrendingUp,
} from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { incomeSourceColors } from '@/components/PieChart';
import { transactions } from '@/mock/income';
import { formatVND } from '@/lib/format';
import { palette, semantic } from '@/theme';
import {
  incomeSourceLabels,
  transactionStatusLabels,
  type IncomeSource,
  type IncomeTransaction,
  type TransactionStatus,
} from '@/types/income';

type FilterKey = 'source' | 'status' | 'bic' | 'recipient';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'source', label: 'Loại' },
  { key: 'status', label: 'Trạng thái' },
  { key: 'bic', label: 'BIC' },
  { key: 'recipient', label: 'Người nhận' },
];

const statusStyle: Record<TransactionStatus, { bg: string; fg: string }> = {
  PAID:     { bg: palette.emerald[50], fg: palette.emerald[700] },
  APPROVED: { bg: palette.blue[50],    fg: palette.blue[700] },
  PENDING:  { bg: palette.sienna[50],  fg: palette.sienna[700] },
  REJECTED: { bg: palette.red[50],     fg: palette.red[600] },
};

export default function IncomeTransactions() {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<FilterKey | null>(null);

  const totalNet = useMemo(
    () => transactions.reduce((s, t) => s + t.netAmount, 0),
    []
  );

  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
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
            Khoản thu nhập
          </Text>
          <Text variant="caption" className="text-text-secondary mt-0.5">
            Tháng này
          </Text>
        </View>
        <Pressable className="w-10 h-10 items-center justify-center" hitSlop={8}>
          <SlidersHorizontal size={20} color={semantic.text.secondary} />
        </Pressable>
      </View>

      {/* Filter chips */}
      <View className="py-3 bg-white border-b border-border-light">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => {
            const active = activeFilter === item.key;
            return (
              <Pressable
                onPress={() => setActiveFilter(active ? null : item.key)}
                className="flex-row items-center gap-1 px-3.5 h-9 rounded-full border"
                style={{
                  backgroundColor: active ? semantic.action.primarySoft : palette.white,
                  borderColor: active ? semantic.action.primary : semantic.border.default,
                }}
              >
                <Text
                  variant="body"
                  style={{
                    color: active ? semantic.action.primaryDeep : semantic.text.secondary,
                    fontFamily: 'BeVietnamPro_600SemiBold',
                    fontSize: 13,
                  }}
                >
                  {item.label}
                </Text>
                <ChevronDown
                  size={13}
                  color={active ? semantic.action.primaryDeep : semantic.text.secondary}
                />
              </Pressable>
            );
          }}
        />
      </View>

      {/* Count + sort */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-border-light">
        <Text variant="caption" className="text-text-secondary">
          <Text variant="caption" style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_700Bold' }}>
            {transactions.length}
          </Text>{' '}
          khoản · Thực nhận{' '}
          <Text variant="caption" style={{ color: semantic.action.primaryDeep, fontFamily: 'BeVietnamPro_700Bold' }}>
            {formatVND(totalNet)}
          </Text>
        </Text>
        <Pressable className="flex-row items-center gap-1" hitSlop={6}>
          <Text variant="caption" className="text-text-secondary">Sắp xếp:</Text>
          <Text
            variant="caption"
            style={{ color: semantic.action.primary, fontFamily: 'BeVietnamPro_600SemiBold' }}
          >
            Mới tạo
          </Text>
          <ChevronDown size={13} color={semantic.action.primary} />
        </Pressable>
      </View>

      {/* List */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 32, gap: 12 }}
        renderItem={({ item }) => (
          <TransactionRow
            tx={item}
            onPress={() => router.push(`/(app)/income/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Text variant="body" className="text-text-secondary">
              Không có khoản thu nhập
            </Text>
          </View>
        }
      />
    </View>
  );
}

function TransactionRow({ tx, onPress }: { tx: IncomeTransaction; onPress?: () => void }) {
  const statusS = statusStyle[tx.status];
  const srcColor = incomeSourceColors[tx.source];

  return (
    <Pressable
      onPress={onPress}
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
      <View className="flex-row items-start gap-3">
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: `${srcColor}15` }}
        >
          <TrendingUp size={18} color={srcColor} strokeWidth={2.4} />
        </View>

        <View className="flex-1">
          <View className="flex-row items-start justify-between gap-2">
            <View className="flex-1">
              <SourcePill source={tx.source} />
              <Text variant="h3" className="text-text-primary mt-1.5" numberOfLines={2}>
                {tx.title}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center mt-2 gap-2">
            <View
              className="px-2 py-0.5 rounded-full"
              style={{ backgroundColor: statusS.bg }}
            >
              <Text
                variant="caption"
                style={{
                  color: statusS.fg,
                  fontFamily: 'BeVietnamPro_600SemiBold',
                  fontSize: 11,
                }}
              >
                {transactionStatusLabels[tx.status]}
              </Text>
            </View>
            {tx.bic && (
              <Text variant="caption" className="text-text-tertiary" numberOfLines={1}>
                {tx.bic}
              </Text>
            )}
            {tx.recipientLevel && (
              <>
                <Text variant="caption" className="text-text-tertiary">·</Text>
                <Text variant="caption" className="text-text-secondary">
                  F{tx.recipientLevel}: {tx.recipientName}
                </Text>
              </>
            )}
          </View>
        </View>

        <ChevronRight size={18} color={semantic.text.tertiary} style={{ marginTop: 4 }} />
      </View>

      <View
        className="flex-row items-center justify-between mt-3 pt-3"
        style={{ borderTopWidth: 1, borderTopColor: semantic.border.light }}
      >
        <View className="flex-row items-center gap-1">
          <CircleDashed size={13} color={semantic.text.tertiary} />
          <Text variant="caption" className="text-text-secondary">
            Tạo {formatRelDay(tx.createdAt)}
          </Text>
        </View>
        <Text
          variant="h3"
          style={{
            color: semantic.action.primaryDeep,
            fontFamily: 'BeVietnamPro_700Bold',
          }}
        >
          +{formatVND(tx.netAmount)}
        </Text>
      </View>
    </Pressable>
  );
}

function SourcePill({ source }: { source: IncomeSource }) {
  const color = incomeSourceColors[source];
  return (
    <View
      className="flex-row items-center gap-1 px-2 py-0.5 rounded-full self-start"
      style={{ backgroundColor: `${color}15` }}
    >
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
      <Text
        variant="caption"
        style={{
          color,
          fontFamily: 'BeVietnamPro_700Bold',
          fontSize: 11,
        }}
      >
        {incomeSourceLabels[source]}
      </Text>
    </View>
  );
}

function formatRelDay(iso: string): string {
  const diffDays = Math.round((Date.now() - new Date(iso).getTime()) / 86400_000);
  if (diffDays === 0) return 'hôm nay';
  if (diffDays === 1) return 'hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return `${Math.floor(diffDays / 7)} tuần trước`;
}
