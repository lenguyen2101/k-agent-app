import { useMemo, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import Slider from '@react-native-community/slider';
import {
  Building2,
  Calendar,
  ChevronDown,
  ChevronUp,
  Percent,
  Wallet,
} from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import {
  calculateLoan,
  type AmortizationRow,
  type LoanMethod,
} from '@/lib/loanCalc';
import { formatVND, formatVNDCompact } from '@/lib/format';
import { palette, semantic } from '@/theme';

// Loan calculator — tính vay mua BĐS cho sale tư vấn khách.
// Inputs: giá căn, % vốn tự có, kỳ hạn vay (năm), lãi suất %, phương thức.
// Outputs: khoản vay, trả tháng đầu/cuối (declining) hoặc cố định (annuity),
// tổng lãi, tổng phải trả, bảng amortization 12 tháng đầu + cuối kỳ.

type Props = {
  /** Giá trị BĐS ban đầu prefill từ unit detail. User có thể đổi. */
  initialPrincipal?: number;
};

const PRICE_PRESETS = [
  { label: '1 tỷ', value: 1_000_000_000 },
  { label: '2 tỷ', value: 2_000_000_000 },
  { label: '3 tỷ', value: 3_000_000_000 },
  { label: '5 tỷ', value: 5_000_000_000 },
];

const DOWN_MIN = 20;
const DOWN_MAX = 80;
const DOWN_STEP = 10;

const TERM_MIN = 5;
const TERM_MAX = 30;
const TERM_STEP = 5;
const TERM_TICKS = [5, 10, 15, 20, 25, 30];

const RATE_PRESETS = [
  { label: '6.8%', value: 6.8, hint: 'NHCS ưu đãi' },
  { label: '8.5%', value: 8.5, hint: 'VCB / BIDV' },
  { label: '10%', value: 10, hint: 'TPBank / VPB' },
  { label: '11.5%', value: 11.5, hint: 'Sau ưu đãi' },
];

export function LoanCalculator({ initialPrincipal }: Props) {
  const [principal, setPrincipal] = useState(initialPrincipal ?? 2_000_000_000);
  const [downPct, setDownPct] = useState(30);
  const [termYears, setTermYears] = useState(15);
  const [ratePct, setRatePct] = useState(8.5);
  const [method, setMethod] = useState<LoanMethod>('declining');
  // Pagination: null = preview mode (12 đầu + 3 cuối). Number = show first N
  // rows với "Tải thêm 60 tháng" button. Tránh render full 360 rows ngay.
  const [visibleCount, setVisibleCount] = useState<number | null>(null);
  const BATCH_SIZE = 60;

  const loanAmount = useMemo(
    () => Math.round(principal * (1 - downPct / 100)),
    [principal, downPct]
  );

  const result = useMemo(
    () => calculateLoan(loanAmount, ratePct, termYears * 12, method),
    [loanAmount, ratePct, termYears, method]
  );

  // Reset pagination khi loan params thay đổi → schedule mới → start lại preview
  useMemo(() => {
    setVisibleCount(null);
  }, [result.schedule.length]);

  // Preview: 12 tháng đầu + 3 tháng cuối cho user thấy shape của lịch trả.
  // Khi expand: show first N rows batched, không last-3 vì user đã commit scroll.
  const previewRows = useMemo(() => {
    if (visibleCount === null) {
      if (result.schedule.length <= 15) return result.schedule;
      const first = result.schedule.slice(0, 12);
      const last = result.schedule.slice(-3);
      return [...first, ...last];
    }
    return result.schedule.slice(0, Math.min(visibleCount, result.schedule.length));
  }, [result.schedule, visibleCount]);

  const isCollapsed = visibleCount === null;
  const needsEllipsis = isCollapsed && result.schedule.length > 15;
  const remainingRows =
    visibleCount !== null && visibleCount < result.schedule.length
      ? result.schedule.length - visibleCount
      : 0;

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 32 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Section: Giá trị BĐS */}
      <Section title="Giá trị bất động sản" icon={Building2}>
        <AmountInput
          value={principal}
          onChangeText={(v) => {
            const num = parseInt(v.replace(/\D/g, ''), 10) || 0;
            setPrincipal(num);
          }}
        />
        <View className="flex-row flex-wrap gap-2 mt-2.5">
          {PRICE_PRESETS.map((p) => (
            <PresetChip
              key={p.value}
              label={p.label}
              active={principal === p.value}
              onPress={() => setPrincipal(p.value)}
            />
          ))}
        </View>
      </Section>

      {/* Section: Vốn tự có — slider 20%..80% step 10 */}
      <Section title="Vốn tự có" icon={Wallet}>
        <View className="flex-row items-baseline justify-between mb-1">
          <Text variant="stat" style={{ color: semantic.action.primaryDeep }}>
            {downPct}%
          </Text>
          <Text variant="caption" className="text-text-tertiary">
            {DOWN_MIN}% – {DOWN_MAX}%
          </Text>
        </View>
        <Slider
          minimumValue={DOWN_MIN}
          maximumValue={DOWN_MAX}
          step={DOWN_STEP}
          value={downPct}
          onValueChange={setDownPct}
          minimumTrackTintColor={semantic.action.primary}
          maximumTrackTintColor={semantic.border.default}
          thumbTintColor={semantic.action.primary}
          style={{ width: '100%', height: 36 }}
        />
        <View className="flex-row justify-between px-1 -mt-1">
          {[20, 30, 40, 50, 60, 70, 80].map((v) => (
            <Text
              key={v}
              variant="caption"
              style={{
                color: v === downPct ? semantic.action.primaryDeep : semantic.text.tertiary,
                fontFamily:
                  v === downPct ? 'BeVietnamPro_700Bold' : 'BeVietnamPro_500Medium',
              }}
            >
              {v}
            </Text>
          ))}
        </View>
        <View className="mt-3 flex-row justify-between">
          <Info label="Vốn có" value={formatVNDCompact(principal * (downPct / 100))} />
          <Info
            label="Khoản vay"
            value={formatVNDCompact(loanAmount)}
            accent
            align="right"
          />
        </View>
      </Section>

      {/* Section: Kỳ hạn vay — slider 5..30 năm step 5 */}
      <Section title="Kỳ hạn vay" icon={Calendar}>
        <View className="flex-row items-baseline justify-between mb-1">
          <Text variant="stat" style={{ color: semantic.action.primaryDeep }}>
            {termYears} năm
          </Text>
          <Text variant="caption" className="text-text-tertiary">
            {TERM_MIN} – {TERM_MAX} năm
          </Text>
        </View>
        <Slider
          minimumValue={TERM_MIN}
          maximumValue={TERM_MAX}
          step={TERM_STEP}
          value={termYears}
          onValueChange={setTermYears}
          minimumTrackTintColor={semantic.action.primary}
          maximumTrackTintColor={semantic.border.default}
          thumbTintColor={semantic.action.primary}
          style={{ width: '100%', height: 36 }}
        />
        <View className="flex-row justify-between px-1 -mt-1">
          {TERM_TICKS.map((y) => (
            <Text
              key={y}
              variant="caption"
              style={{
                color:
                  y === termYears ? semantic.action.primaryDeep : semantic.text.tertiary,
                fontFamily:
                  y === termYears ? 'BeVietnamPro_700Bold' : 'BeVietnamPro_500Medium',
              }}
            >
              {y}
            </Text>
          ))}
        </View>
      </Section>

      {/* Section: Lãi suất */}
      <Section title="Lãi suất (% / năm)" icon={Percent}>
        <View
          className="flex-row items-center rounded-xl px-3 h-12"
          style={{
            borderWidth: 1,
            borderColor: semantic.border.default,
            backgroundColor: palette.white,
          }}
        >
          <TextInput
            value={String(ratePct)}
            onChangeText={(v) => {
              const num = parseFloat(v.replace(',', '.')) || 0;
              setRatePct(num);
            }}
            keyboardType="decimal-pad"
            style={{
              flex: 1,
              fontFamily: 'BeVietnamPro_700Bold',
              fontSize: 18,
              color: semantic.text.primary,
            }}
          />
          <Text variant="button" style={{ color: semantic.text.secondary, fontFamily: 'BeVietnamPro_700Bold' }}>
            %/năm
          </Text>
        </View>
        <View className="flex-row flex-wrap gap-2 mt-2.5">
          {RATE_PRESETS.map((r) => (
            <Pressable
              key={r.value}
              onPress={() => setRatePct(r.value)}
              className="flex-1 px-3 py-2 rounded-xl border"
              style={{
                minWidth: 72,
                borderColor:
                  ratePct === r.value ? semantic.action.primary : semantic.border.default,
                backgroundColor:
                  ratePct === r.value ? semantic.action.primarySoft : palette.white,
              }}
            >
              <Text
                variant="caption"
                style={{
                  color:
                    ratePct === r.value
                      ? semantic.action.primaryDeep
                      : semantic.text.primary,
                  fontFamily: 'BeVietnamPro_700Bold',
                }}
              >
                {r.label}
              </Text>
              <Text
                variant="caption"
                style={{
                  color:
                    ratePct === r.value
                      ? semantic.action.primaryDeep
                      : semantic.text.tertiary,
                  marginTop: 1,
                }}
              >
                {r.hint}
              </Text>
            </Pressable>
          ))}
        </View>
      </Section>

      {/* Section: Phương thức */}
      <Section title="Phương thức trả">
        <View className="flex-row gap-2">
          <MethodOption
            active={method === 'declining'}
            onPress={() => setMethod('declining')}
            title="Dư nợ giảm dần"
            subtitle="Lãi tính trên dư nợ còn lại. Phổ biến VN."
          />
          <MethodOption
            active={method === 'annuity'}
            onPress={() => setMethod('annuity')}
            title="Trả đều hàng tháng"
            subtitle="Số tiền cố định mỗi tháng."
          />
        </View>
      </Section>

      {/* Results hero */}
      <View className="mx-4 mt-5">
        <View
          className="rounded-3xl overflow-hidden p-5"
          style={{
            backgroundColor: semantic.action.primaryDeep,
            shadowColor: semantic.action.primaryDeep,
            shadowOpacity: 0.25,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 6 },
            elevation: 6,
          }}
        >
          <Text variant="label" style={{ color: palette.sienna[100] }}>
            {method === 'annuity' ? 'Trả hàng tháng (cố định)' : 'Trả tháng đầu'}
          </Text>
          <Text
            variant="display"
            style={{ color: palette.white, marginTop: 4 }}
          >
            {formatVND(Math.round(result.firstPayment))}
          </Text>
          {method === 'declining' && (
            <Text
              variant="caption"
              style={{
                color: palette.sienna[100],
                marginTop: 4,
                opacity: 0.9,
              }}
            >
              Giảm dần về {formatVND(Math.round(result.lastPayment))} vào tháng cuối
            </Text>
          )}

          <View
            className="flex-row mt-4 pt-4"
            style={{ borderTopWidth: 1, borderTopColor: 'rgba(247,243,237,0.2)' }}
          >
            <View className="flex-1">
              <Text variant="caption" style={{ color: palette.sienna[100] }}>
                Tổng lãi
              </Text>
              <Text
                variant="subtitle"
                style={{
                  color: palette.white,
                  fontFamily: 'BeVietnamPro_700Bold',
                  marginTop: 2,
                }}
              >
                {formatVNDCompact(result.totalInterest)}
              </Text>
            </View>
            <View className="flex-1">
              <Text variant="caption" style={{ color: palette.sienna[100] }}>
                Tổng phải trả
              </Text>
              <Text
                variant="subtitle"
                style={{
                  color: palette.white,
                  fontFamily: 'BeVietnamPro_700Bold',
                  marginTop: 2,
                }}
              >
                {formatVNDCompact(result.totalPaid)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Amortization schedule */}
      <View className="mx-4 mt-5">
        <Text
          variant="body"
          style={{
            color: semantic.text.primary,
            fontFamily: 'BeVietnamPro_700Bold',
            marginBottom: 8,
          }}
        >
          Chi tiết trả nợ
        </Text>
        <View
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: palette.white,
            borderWidth: 1,
            borderColor: semantic.border.light,
          }}
        >
          {/* Header — đơn vị chung (triệu đồng) cho column Gốc/Lãi/Tổng */}
          <View
            className="flex-row px-3 py-2"
            style={{
              backgroundColor: semantic.surface.alt,
              borderBottomWidth: 1,
              borderBottomColor: semantic.border.light,
            }}
          >
            <Text
              variant="caption"
              style={{ width: 28, color: semantic.text.tertiary }}
            >
              Th
            </Text>
            <Text
              variant="caption"
              style={{ flex: 1, color: semantic.text.tertiary, textAlign: 'right' }}
            >
              Gốc (tr)
            </Text>
            <Text
              variant="caption"
              style={{ flex: 1, color: semantic.text.tertiary, textAlign: 'right' }}
            >
              Lãi (tr)
            </Text>
            <Text
              variant="caption"
              style={{
                flex: 1,
                color: semantic.text.tertiary,
                textAlign: 'right',
                fontFamily: 'BeVietnamPro_600SemiBold',
              }}
            >
              Tổng (tr)
            </Text>
          </View>

          {previewRows.map((row, idx) => {
            const showEllipsisAfter =
              needsEllipsis && idx === 11 /* sau tháng 12 nếu chưa expand */;
            return (
              <View key={row.month}>
                <Row row={row} />
                {showEllipsisAfter && (
                  <View
                    className="px-3 py-2 items-center"
                    style={{ backgroundColor: semantic.surface.alt }}
                  >
                    <Text
                      variant="caption"
                      style={{ color: semantic.text.tertiary }}
                    >
                      ... còn {result.schedule.length - 15} tháng ...
                    </Text>
                  </View>
                )}
              </View>
            );
          })}

          {result.schedule.length > 15 && (
            <Pressable
              onPress={() => {
                if (isCollapsed) {
                  // Mở lần đầu → show BATCH_SIZE rows
                  setVisibleCount(Math.min(BATCH_SIZE, result.schedule.length));
                } else if (remainingRows > 0) {
                  // Tải thêm 60 (hoặc phần còn lại)
                  setVisibleCount((v) =>
                    v === null ? BATCH_SIZE : Math.min(v + BATCH_SIZE, result.schedule.length)
                  );
                } else {
                  // Đã load full → rút gọn về preview
                  setVisibleCount(null);
                }
              }}
              className="flex-row items-center justify-center gap-1 py-3"
              style={{ borderTopWidth: 1, borderTopColor: semantic.border.light }}
            >
              <Text
                variant="caption"
                style={{
                  color: semantic.action.primary,
                  fontFamily: 'BeVietnamPro_700Bold',
                }}
              >
                {isCollapsed
                  ? `Xem toàn bộ ${result.schedule.length} tháng`
                  : remainingRows > 0
                  ? `Tải thêm ${Math.min(BATCH_SIZE, remainingRows)} tháng`
                  : 'Rút gọn'}
              </Text>
              {isCollapsed ? (
                <ChevronDown size={14} color={semantic.action.primary} strokeWidth={2.4} />
              ) : remainingRows > 0 ? (
                <ChevronDown size={14} color={semantic.action.primary} strokeWidth={2.4} />
              ) : (
                <ChevronUp size={14} color={semantic.action.primary} strokeWidth={2.4} />
              )}
            </Pressable>
          )}
        </View>
      </View>

      <Text
        variant="caption"
        style={{
          color: semantic.text.tertiary,
          textAlign: 'center',
          marginTop: 14,
          marginHorizontal: 24,
        }}
      >
        * Kết quả tính toán chỉ mang tính tham khảo. Lãi suất thực tế phụ thuộc vào
        điều kiện vay + chính sách từng ngân hàng.
      </Text>
    </ScrollView>
  );
}

// --- Sub-components ---

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  children: React.ReactNode;
}) {
  return (
    <View className="mx-4 mt-5">
      <View className="flex-row items-center gap-2 mb-3">
        {Icon && <Icon size={15} color={semantic.action.primaryDeep} strokeWidth={2.4} />}
        <Text
          variant="subtitle"
          style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_700Bold' }}
        >
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

function AmountInput({
  value,
  onChangeText,
}: {
  value: number;
  onChangeText: (v: string) => void;
}) {
  // Format with comma separators for display
  const formatted = value.toLocaleString('vi-VN');
  return (
    <View
      className="flex-row items-center rounded-xl px-4 h-14"
      style={{
        borderWidth: 1,
        borderColor: semantic.border.default,
        backgroundColor: palette.white,
      }}
    >
      <TextInput
        value={formatted}
        onChangeText={onChangeText}
        keyboardType="number-pad"
        style={{
          flex: 1,
          fontFamily: 'BeVietnamPro_700Bold',
          fontSize: 20,
          color: semantic.text.primary,
        }}
      />
      <Text
        variant="h3"
        style={{ color: semantic.text.secondary }}
      >
        đ
      </Text>
    </View>
  );
}

function PresetChip({
  label,
  active,
  onPress,
  flex,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  flex?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="px-3.5 h-10 rounded-xl items-center justify-center border"
      style={{
        minWidth: 64,
        flex: flex ? 1 : undefined,
        backgroundColor: active ? semantic.action.primarySoft : palette.white,
        borderColor: active ? semantic.action.primary : semantic.border.default,
      }}
    >
      <Text
        variant="caption"
        style={{
          color: active ? semantic.action.primaryDeep : semantic.text.primary,
          fontFamily: 'BeVietnamPro_700Bold',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function MethodOption({
  active,
  onPress,
  title,
  subtitle,
}: {
  active: boolean;
  onPress: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 p-3 rounded-2xl border"
      style={{
        backgroundColor: active ? semantic.action.primarySoft : palette.white,
        borderColor: active ? semantic.action.primary : semantic.border.default,
      }}
    >
      <Text
        variant="caption"
        style={{
          color: active ? semantic.action.primaryDeep : semantic.text.primary,
          fontFamily: 'BeVietnamPro_700Bold',
        }}
      >
        {title}
      </Text>
      <Text
        variant="caption"
        style={{
          color: active ? semantic.action.primaryDeep : semantic.text.tertiary,
          marginTop: 3,
          opacity: 0.85,
        }}
      >
        {subtitle}
      </Text>
    </Pressable>
  );
}

function Info({
  label,
  value,
  accent,
  align,
}: {
  label: string;
  value: string;
  accent?: boolean;
  align?: 'left' | 'right';
}) {
  return (
    <View>
      <Text
        variant="caption"
        style={{ color: semantic.text.tertiary, textAlign: align }}
      >
        {label}
      </Text>
      <Text
        variant="body"
        style={{
          color: accent ? palette.emerald[700] : semantic.text.primary,
          fontFamily: 'BeVietnamPro_700Bold',
          marginTop: 1,
          textAlign: align,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

// Hiển thị số tiền dưới dạng triệu với 2 chữ số thập phân ("18,27").
// Bảng amortization cần precision này để user thấy rõ sự thay đổi giữa
// các tháng (vs formatVNDCompact chỉ round tới "20 tr" → stale).
function toMillions(amount: number): string {
  return (amount / 1_000_000).toFixed(2).replace('.', ',');
}

function Row({ row }: { row: AmortizationRow }) {
  return (
    <View
      className="flex-row px-3 py-2.5 items-center"
      style={{
        borderBottomWidth: 1,
        borderBottomColor: semantic.border.light,
      }}
    >
      <Text
        variant="caption"
        style={{
          width: 28,
          color: semantic.text.secondary,
          fontFamily: 'BeVietnamPro_600SemiBold',
        }}
      >
        {row.month}
      </Text>
      <Text
        variant="caption"
        style={{
          flex: 1,
          color: semantic.text.primary,
          textAlign: 'right',
          fontVariant: ['tabular-nums'],
        }}
      >
        {toMillions(row.principalPaid)}
      </Text>
      <Text
        variant="caption"
        style={{
          flex: 1,
          color: palette.sienna[700],
          textAlign: 'right',
          fontVariant: ['tabular-nums'],
        }}
      >
        {toMillions(row.interestPaid)}
      </Text>
      <Text
        variant="caption"
        style={{
          flex: 1,
          color: semantic.text.primary,
          fontFamily: 'BeVietnamPro_700Bold',
          textAlign: 'right',
          fontVariant: ['tabular-nums'],
        }}
      >
        {toMillions(row.totalPaid)}
      </Text>
    </View>
  );
}
