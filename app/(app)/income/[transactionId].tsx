import { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  Check,
  CircleDashed,
  Copy,
  Hash,
  Share2,
  TrendingUp,
  User,
  UserCheck,
} from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { incomeSourceColors } from '@/components/PieChart';
import { transactions } from '@/mock/income';
import { formatVND, formatVNDCompact, formatVNDWords } from '@/lib/format';
import { palette, semantic } from '@/theme';
import {
  incomeSourceLabels,
  transactionStatusLabels,
  type TransactionStatus,
} from '@/types/income';

const statusColor: Record<TransactionStatus, { bg: string; fg: string; dot: string }> = {
  PAID:     { bg: palette.emerald[50], fg: palette.emerald[700], dot: palette.emerald[500] },
  APPROVED: { bg: palette.blue[50],    fg: palette.blue[700],    dot: palette.blue[600] },
  PENDING:  { bg: palette.sienna[50],  fg: palette.sienna[700],  dot: palette.sienna[500] },
  REJECTED: { bg: palette.red[50],     fg: palette.red[600],     dot: palette.red[500] },
};

function formatFullDate(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${time}`;
}

export default function IncomeTransactionDetail() {
  const { transactionId } = useLocalSearchParams<{ transactionId: string }>();
  const insets = useSafeAreaInsets();
  const tx = useMemo(() => transactions.find((t) => t.id === transactionId), [transactionId]);

  if (!tx) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <Text variant="body" className="text-text-secondary">Không tìm thấy khoản thu</Text>
      </View>
    );
  }

  const statusS = statusColor[tx.status];
  const srcColor = incomeSourceColors[tx.source];
  const taxAmount = tx.grossAmount - tx.netAmount;
  const taxPct = tx.grossAmount > 0 ? Math.round((taxAmount / tx.grossAmount) * 100) : 0;

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
            {tx.code}
          </Text>
          <View className="flex-row items-center gap-1.5 mt-0.5">
            <View className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusS.dot }} />
            <Text variant="caption" className="text-text-secondary">
              {transactionStatusLabels[tx.status]}
            </Text>
          </View>
        </View>
        <Pressable className="w-10 h-10 items-center justify-center" hitSlop={8}>
          <Share2 size={20} color={semantic.text.secondary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Hero amount */}
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
          <View className="flex-row items-center gap-2">
            <View
              className="w-7 h-7 rounded-full items-center justify-center"
              style={{ backgroundColor: `${srcColor}22` }}
            >
              <TrendingUp size={14} color={srcColor} strokeWidth={2.6} />
            </View>
            <Text
              variant="badge"
              style={{ color: srcColor }}
            >
              {incomeSourceLabels[tx.source]}
            </Text>
          </View>

          <Text variant="caption" style={{ color: semantic.action.primaryDeep, marginTop: 12 }}>
            Thực nhận
          </Text>
          <Text
            variant="display"
            style={{
              color: semantic.action.primaryDeep,
              marginTop: 2,
            }}
          >
            {formatVND(tx.netAmount)}
          </Text>
          <Text variant="caption" className="text-text-tertiary mt-1 italic" numberOfLines={2}>
            {formatVNDWords(tx.netAmount)}
          </Text>
        </View>

        {/* Breakdown */}
        <View className="mx-4 mt-4 p-4 rounded-2xl bg-surface-card border border-border-light">
          <Text variant="h3" className="text-text-primary mb-3">Chi tiết tính toán</Text>

          <BreakdownRow label="Tổng thô" value={formatVND(tx.grossAmount)} />
          <BreakdownRow
            label={`Thuế TNCN (${taxPct}%)`}
            value={`-${formatVND(taxAmount)}`}
            tone="deduct"
          />
          <BreakdownRow
            label="Thực nhận"
            value={formatVND(tx.netAmount)}
            tone="total"
            last
          />
        </View>

        {/* Meta */}
        <View className="mx-4 mt-4 p-4 rounded-2xl bg-surface-card border border-border-light">
          <Text variant="h3" className="text-text-primary mb-1">Thông tin</Text>

          <MetaRow
            icon={<Hash size={16} color={semantic.text.tertiary} />}
            label="Mã khoản thu"
            value={tx.code}
            copyable
          />
          {tx.bic && (
            <MetaRow
              icon={<Hash size={16} color={semantic.text.tertiary} />}
              label="Mã BIC"
              value={tx.bic}
              copyable
            />
          )}
          <MetaRow
            icon={<User size={16} color={semantic.text.tertiary} />}
            label="Người nhận"
            value={tx.recipientLevel ? `F${tx.recipientLevel} · ${tx.recipientName}` : tx.recipientName}
          />
          {tx.relatedLeadName && (
            <MetaRow
              icon={<UserCheck size={16} color={semantic.text.tertiary} />}
              label="Khách hàng"
              value={tx.relatedLeadName}
            />
          )}
          {tx.relatedListingCode && (
            <MetaRow
              icon={<Building2 size={16} color={semantic.text.tertiary} />}
              label="Sản phẩm"
              value={tx.relatedListingCode}
            />
          )}
          <MetaRow
            icon={<CalendarClock size={16} color={semantic.text.tertiary} />}
            label="Ngày tạo"
            value={formatFullDate(tx.createdAt)}
          />
          <MetaRow
            icon={<CircleDashed size={16} color={semantic.text.tertiary} />}
            label="Ngày nhận"
            value={tx.paidAt ? formatFullDate(tx.paidAt) : 'Chưa thanh toán'}
            last
          />
        </View>

        {/* Status progress */}
        <View className="mx-4 mt-4 p-4 rounded-2xl bg-surface-card border border-border-light">
          <Text variant="h3" className="text-text-primary mb-3">Tiến trình</Text>
          <ProgressStep
            label="Khởi tạo"
            done
            time={formatFullDate(tx.createdAt)}
          />
          <ProgressStep
            label="Đã duyệt"
            done={tx.status === 'APPROVED' || tx.status === 'PAID'}
            time={tx.status === 'APPROVED' || tx.status === 'PAID' ? '—' : 'Đang chờ'}
          />
          <ProgressStep
            label="Đã thanh toán"
            done={tx.status === 'PAID'}
            time={tx.paidAt ? formatFullDate(tx.paidAt) : 'Chưa thanh toán'}
            last
          />
        </View>

        {/* Bottom note */}
        <Text variant="caption" className="text-text-tertiary text-center mt-5 px-6" numberOfLines={2}>
          Mọi thắc mắc liên hệ phòng tài chính K-CITY hoặc trưởng sàn.
        </Text>
      </ScrollView>
    </View>
  );
}

function BreakdownRow({
  label,
  value,
  tone,
  last,
}: {
  label: string;
  value: string;
  tone?: 'deduct' | 'total';
  last?: boolean;
}) {
  const valueColor =
    tone === 'deduct'
      ? palette.red[600]
      : tone === 'total'
      ? semantic.action.primaryDeep
      : semantic.text.primary;
  return (
    <View
      className="flex-row items-center justify-between py-2.5"
      style={{
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: semantic.border.light,
      }}
    >
      <Text
        variant="body"
        style={{
          color: tone === 'total' ? semantic.text.primary : semantic.text.secondary,
          fontFamily: tone === 'total' ? 'BeVietnamPro_600SemiBold' : 'BeVietnamPro_400Regular',
        }}
      >
        {label}
      </Text>
      <Text
        variant="body"
        style={{
          color: valueColor,
          fontFamily: 'BeVietnamPro_700Bold',
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function MetaRow({
  icon,
  label,
  value,
  copyable,
  last,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  copyable?: boolean;
  last?: boolean;
}) {
  return (
    <View
      className="flex-row items-center py-2.5"
      style={{
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: semantic.border.light,
      }}
    >
      <View className="w-7 h-7 rounded-full bg-surface-alt items-center justify-center">
        {icon}
      </View>
      <Text variant="body" className="text-text-secondary ml-3 mr-4 w-28">
        {label}
      </Text>
      <Text
        variant="body"
        className="text-text-primary flex-1"
        numberOfLines={1}
        style={{ fontFamily: 'BeVietnamPro_500Medium' }}
      >
        {value}
      </Text>
      {copyable && (
        <Pressable className="p-1" hitSlop={4}>
          <Copy size={14} color={semantic.text.tertiary} />
        </Pressable>
      )}
    </View>
  );
}

function ProgressStep({
  label,
  done,
  time,
  last,
}: {
  label: string;
  done: boolean;
  time: string;
  last?: boolean;
}) {
  return (
    <View className="flex-row gap-3">
      <View className="items-center" style={{ width: 28 }}>
        <View
          className="w-6 h-6 rounded-full items-center justify-center"
          style={{
            backgroundColor: done ? palette.emerald[500] : semantic.border.default,
          }}
        >
          {done ? (
            <Check size={14} color={palette.white} strokeWidth={3} />
          ) : (
            <View className="w-2 h-2 rounded-full bg-white" />
          )}
        </View>
        {!last && (
          <View
            className="w-0.5 flex-1 mt-1"
            style={{
              backgroundColor: done ? palette.emerald[500] : semantic.border.light,
              minHeight: 26,
            }}
          />
        )}
      </View>
      <View className="flex-1 pb-4">
        <Text
          variant="body"
          style={{
            color: done ? semantic.text.primary : semantic.text.secondary,
            fontFamily: 'BeVietnamPro_600SemiBold',
          }}
        >
          {label}
        </Text>
        <Text variant="caption" className="text-text-tertiary mt-0.5">
          {time}
        </Text>
      </View>
    </View>
  );
}
