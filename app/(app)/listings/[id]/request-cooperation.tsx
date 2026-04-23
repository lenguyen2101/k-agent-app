import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Building2,
  Check,
  Clock,
  Info,
  ShieldCheck,
  TrendingUp,
  User,
} from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { listings } from '@/mock/listings';
import { useAuth } from '@/store/auth';
import { formatPhone, formatVND, formatVNDCompact } from '@/lib/format';
import { palette, semantic, typography } from '@/theme';

type ContactSlot = 'ANYTIME' | 'MORNING' | 'AFTERNOON' | 'EVENING';

const SLOTS: { key: ContactSlot; label: string; sub: string }[] = [
  { key: 'ANYTIME',   label: 'Bất kỳ',       sub: 'Chủ nhà linh hoạt' },
  { key: 'MORNING',   label: 'Sáng',         sub: '8h — 12h' },
  { key: 'AFTERNOON', label: 'Chiều',        sub: '13h — 17h' },
  { key: 'EVENING',   label: 'Tối',          sub: '18h — 21h' },
];

export default function RequestCooperation() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const listing = useMemo(() => listings.find((l) => l.id === id), [id]);
  const user = useAuth((s) => s.user);

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [slot, setSlot] = useState<ContactSlot>('ANYTIME');

  const canSubmit =
    clientName.trim().length > 0 &&
    /^0\d{9}$/.test(clientPhone.trim());

  if (!listing) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <Text variant="body" className="text-text-secondary">Không tìm thấy sản phẩm</Text>
      </View>
    );
  }

  const handleSubmit = () => {
    if (!canSubmit) {
      if (!clientName.trim()) {
        Alert.alert('Thiếu tên khách', 'Vui lòng nhập họ tên khách hàng dự kiến.');
      } else {
        Alert.alert('SĐT không hợp lệ', 'SĐT phải 10 số, bắt đầu bằng 0.');
      }
      return;
    }
    Alert.alert(
      'Đã gửi yêu cầu hợp tác',
      `Yêu cầu của bạn đã gửi tới ${listing.agent.fullName} (${listing.agent.company}). Chủ sản phẩm sẽ phản hồi trong 24h.`,
      [
        {
          text: 'OK',
          onPress: () => {
            router.back();
            router.back();
          },
        },
      ]
    );
  };

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
            numberOfLines={1}
          >
            Yêu cầu hợp tác
          </Text>
          <Text variant="caption" className="text-text-secondary mt-0.5" numberOfLines={1}>
            {listing.code}
          </Text>
        </View>
        <View className="w-10" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Listing summary */}
          <View
            className="p-4 rounded-2xl flex-row gap-3"
            style={{
              backgroundColor: palette.white,
              borderWidth: 1,
              borderColor: semantic.border.light,
            }}
          >
            <View
              className="w-12 h-12 rounded-xl items-center justify-center"
              style={{ backgroundColor: semantic.action.primarySoft }}
            >
              <Building2 size={20} color={semantic.action.primaryDeep} />
            </View>
            <View className="flex-1">
              <Text variant="h3" className="text-text-primary" numberOfLines={2}>
                {listing.title}
              </Text>
              <Text variant="caption" className="text-text-secondary mt-1">
                {listing.unitType} · {listing.areaM2}m²{listing.floor ? ` · Tầng ${listing.floor}` : ''}
              </Text>
              <View className="flex-row items-baseline gap-2 mt-1.5">
                <Text
                  variant="body"
                  style={{
                    color: semantic.action.primaryDeep,
                    fontFamily: 'BeVietnamPro_700Bold',
                  }}
                >
                  {formatVNDCompact(listing.listPrice)}
                </Text>
                <Text variant="caption" className="text-text-tertiary">
                  niêm yết
                </Text>
              </View>
            </View>
          </View>

          {/* Commission preview — highlight */}
          <View
            className="mt-3 p-4 rounded-2xl flex-row items-center gap-3"
            style={{
              backgroundColor: semantic.action.primarySoft,
              borderWidth: 1,
              borderColor: palette.sienna[100],
            }}
          >
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: semantic.action.primary }}
            >
              <TrendingUp size={18} color={palette.white} strokeWidth={2.4} />
            </View>
            <View className="flex-1">
              <Text variant="caption" style={{ color: semantic.action.primaryDeep }}>
                Hoa hồng dự kiến nếu chốt
              </Text>
              <View className="flex-row items-baseline gap-1.5 mt-0.5">
                <Text
                  variant="h2"
                  style={{
                    color: semantic.action.primaryDeep,
                    fontFamily: 'BeVietnamPro_700Bold',
                  }}
                >
                  {formatVND(listing.myCommission)}
                </Text>
                <Text
                  variant="caption"
                  style={{
                    color: semantic.action.primary,
                    fontFamily: 'BeVietnamPro_600SemiBold',
                  }}
                >
                  ({listing.myCommissionPct}%)
                </Text>
              </View>
            </View>
          </View>

          {/* Your info (readonly) */}
          <SectionLabel className="mt-6">Bạn</SectionLabel>
          <View
            className="p-4 rounded-2xl flex-row items-center gap-3"
            style={{
              backgroundColor: palette.white,
              borderWidth: 1,
              borderColor: semantic.border.light,
            }}
          >
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: semantic.action.primary }}
            >
              <Text
                variant="body"
                style={{
                  color: palette.white,
                  fontFamily: 'BeVietnamPro_700Bold',
                }}
              >
                {user?.fullName.charAt(0)}
              </Text>
            </View>
            <View className="flex-1">
              <Text
                variant="body"
                style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_700Bold' }}
              >
                {user?.fullName}
              </Text>
              <Text variant="caption" className="text-text-secondary mt-0.5">
                {user?.phone ? formatPhone(user.phone) : ''} · {user?.team}
              </Text>
            </View>
            {user?.noxhCertified && (
              <View
                className="flex-row items-center gap-1 px-2 py-0.5 rounded-full"
                style={{ backgroundColor: palette.emerald[50] }}
              >
                <ShieldCheck size={11} color={palette.emerald[700]} />
                <Text
                  variant="caption"
                  style={{ color: palette.emerald[700], fontFamily: 'BeVietnamPro_700Bold' }}
                >
                  Cert
                </Text>
              </View>
            )}
          </View>

          {/* Client info */}
          <SectionLabel className="mt-6">Khách hàng dự kiến</SectionLabel>
          <FieldWrap label="Họ tên khách" required>
            <TextInput
              value={clientName}
              onChangeText={setClientName}
              placeholder="Nguyễn Văn A"
              placeholderTextColor={semantic.text.tertiary}
              autoCapitalize="words"
              style={inputStyle}
            />
          </FieldWrap>
          <FieldWrap label="SĐT khách" required>
            <TextInput
              value={clientPhone}
              onChangeText={setClientPhone}
              placeholder="0901234567"
              placeholderTextColor={semantic.text.tertiary}
              keyboardType="phone-pad"
              style={inputStyle}
            />
          </FieldWrap>

          {/* Time slot */}
          <SectionLabel className="mt-4">Thời gian liên hệ chủ sản phẩm</SectionLabel>
          <View className="flex-row flex-wrap gap-2">
            {SLOTS.map((s) => {
              const active = slot === s.key;
              return (
                <Pressable
                  key={s.key}
                  onPress={() => setSlot(s.key)}
                  className="flex-row items-center gap-1.5 px-3.5 py-2 rounded-2xl border"
                  style={{
                    backgroundColor: active ? semantic.action.primarySoft : palette.white,
                    borderColor: active ? semantic.action.primary : semantic.border.default,
                  }}
                >
                  {active && <Check size={13} color={semantic.action.primary} strokeWidth={2.6} />}
                  <Clock
                    size={13}
                    color={active ? semantic.action.primary : semantic.text.tertiary}
                  />
                  <View>
                    <Text
                      variant="caption"
                      style={{
                        color: active ? semantic.action.primaryDeep : semantic.text.primary,
                        fontFamily: 'BeVietnamPro_600SemiBold',
                      }}
                    >
                      {s.label}
                    </Text>
                    <Text
                      variant="caption"
                      style={{
                        color: active ? semantic.action.primaryDeep : semantic.text.tertiary,
                      }}
                    >
                      {s.sub}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Notes */}
          <SectionLabel className="mt-4">Ghi chú cho chủ sản phẩm</SectionLabel>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Khách có nhu cầu rõ ràng, đã xem dự án khác, sẵn sàng đặt cọc trong tuần..."
            placeholderTextColor={semantic.text.tertiary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={[
              inputStyle,
              {
                minHeight: 100,
                paddingTop: 12,
              },
            ]}
          />

          {/* Disclaimer */}
          <View
            className="mt-4 p-3 rounded-xl flex-row items-start gap-2"
            style={{ backgroundColor: palette.sky[50] }}
          >
            <Info size={14} color={palette.sky[600]} style={{ marginTop: 2 }} />
            <Text variant="caption" style={{ color: palette.sky[600], flex: 1 }}>
              Chủ sản phẩm sẽ phản hồi trong 24h. Khi được chấp nhận, bạn có 14 ngày độc quyền để chốt deal với khách này.
            </Text>
          </View>
        </ScrollView>

        {/* Sticky submit */}
        <View
          className="absolute bottom-0 left-0 right-0 bg-white border-t border-border-light px-4 pt-3"
          style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : 12 }}
        >
          <Pressable
            onPress={handleSubmit}
            disabled={!canSubmit}
            className="h-12 rounded-xl items-center justify-center"
            style={{
              backgroundColor: canSubmit ? semantic.action.primary : semantic.border.default,
              shadowColor: semantic.action.primaryDeep,
              shadowOpacity: canSubmit ? 0.25 : 0,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
              elevation: canSubmit ? 4 : 0,
            }}
          >
            <Text
              variant="body"
              style={{
                color: canSubmit ? palette.white : semantic.text.tertiary,
                fontFamily: 'BeVietnamPro_700Bold',
              }}
            >
              Gửi yêu cầu hợp tác
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const inputStyle = [
  typography['body-lg'],
  {
    color: semantic.text.primary,
    borderWidth: 1,
    borderColor: semantic.border.default,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: palette.white,
  },
];

function SectionLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <Text
      variant="caption"
      className={className}
      style={{
        color: semantic.text.secondary,
        fontFamily: 'BeVietnamPro_700Bold',
        letterSpacing: 0.5,
        marginBottom: 10,
      }}
    >
      {String(children).toUpperCase()}
    </Text>
  );
}

function FieldWrap({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-3">
      <View className="flex-row items-center gap-1 mb-1.5">
        <Text
          variant="caption"
          style={{
            color: semantic.text.primary,
            fontFamily: 'BeVietnamPro_600SemiBold',
          }}
        >
          {label}
        </Text>
        {required && (
          <Text variant="caption" style={{ color: palette.red[600] }}>
            *
          </Text>
        )}
      </View>
      {children}
    </View>
  );
}
