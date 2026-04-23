import { useMemo, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  ChevronRight,
  CircleCheck,
  Mail,
  MessageSquare,
  Phone,
  Ruler,
  ScanLine,
  User,
  Wallet,
  X,
} from 'lucide-react-native';
import { BookingStatusBadge, bookingStatusTint } from '@/components/BookingStatusBadge';
import { BookingTimeline } from '@/components/BookingTimeline';
import { BottomSheetModal } from '@/components/BottomSheetModal';
import { Text } from '@/components/ui/Text';
import {
  bookingStatusLabels,
  nextStatuses,
  useBookings,
  type BookingStatus,
} from '@/store/bookings';
import { useLeads } from '@/store/leads';
import { statusToGroup } from '@/types/lead';
import { formatPhone, formatVND, formatVNDCompact } from '@/lib/format';
import { palette, semantic } from '@/theme';

// Booking detail + status update flow. Sheet "Chuyển bước" cho phép tiến 1
// step (PENDING → CONFIRMED → DEPOSITED...) hoặc huỷ. Mỗi transition có thể
// thêm note optional → append vào history timeline.

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function BookingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const booking = useBookings((s) => s.bookings.find((b) => b.id === id));
  const updateStatus = useBookings((s) => s.updateStatus);
  const linkedLead = useLeads((s) =>
    booking?.leadId ? s.leads.find((l) => l.id === booking.leadId) : undefined
  );

  const [statusSheetOpen, setStatusSheetOpen] = useState(false);

  if (!booking) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <Text variant="body" className="text-text-secondary">
          Không tìm thấy booking
        </Text>
      </View>
    );
  }

  const possibleNext = useMemo(() => nextStatuses(booking.status), [booking.status]);
  const tint = bookingStatusTint[booking.status];
  const isTerminal = booking.status === 'COMPLETED' || booking.status === 'CANCELLED';

  const handleUpdate = (next: BookingStatus, note?: string) => {
    updateStatus(booking.id, next, note);
    setStatusSheetOpen(false);
  };

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
        <View className="w-10" />
        <View className="flex-1 items-center">
          <Text
            variant="h3"
            style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_700Bold' }}
            numberOfLines={1}
          >
            Booking {booking.id.replace('bk-', '').slice(-6)}
          </Text>
        </View>
        <View className="w-10" />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: isTerminal ? 40 : 120 }}>
        {/* Status hero card */}
        <View
          className="mx-4 mt-4 p-5 rounded-2xl"
          style={{
            backgroundColor: tint.bg,
            borderWidth: 1,
            borderColor: tint.fg,
          }}
        >
          <View className="flex-row items-center gap-2 mb-2">
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: tint.dot,
              }}
            />
            <Text
              variant="caption"
              style={{
                color: tint.fg,
                fontFamily: 'BeVietnamPro_700Bold',
                letterSpacing: 0.5,
                fontSize: 11,
              }}
            >
              TRẠNG THÁI HIỆN TẠI
            </Text>
          </View>
          <Text
            style={{
              color: tint.fg,
              fontFamily: 'BeVietnamPro_700Bold',
              fontSize: 26,
              lineHeight: 32,
            }}
          >
            {bookingStatusLabels[booking.status]}
          </Text>
          {!isTerminal && possibleNext.length > 0 && (
            <Text
              variant="body"
              style={{
                color: tint.fg,
                opacity: 0.85,
                marginTop: 6,
                fontSize: 13,
              }}
            >
              Bước tiếp theo: {bookingStatusLabels[possibleNext[0]]}
            </Text>
          )}
        </View>

        {/* Unit + Project card */}
        <View
          className="mx-4 mt-4 p-4 rounded-2xl"
          style={{
            backgroundColor: palette.white,
            borderWidth: 1,
            borderColor: semantic.border.light,
          }}
        >
          <Text
            variant="caption"
            style={{
              color: semantic.text.tertiary,
              fontFamily: 'BeVietnamPro_700Bold',
              letterSpacing: 0.4,
              fontSize: 10,
              marginBottom: 6,
            }}
          >
            DỰ ÁN & CĂN
          </Text>
          <View className="flex-row items-center gap-2 mb-1">
            <Building2 size={16} color={semantic.action.primaryDeep} strokeWidth={2.2} />
            <Text
              style={{
                color: semantic.text.primary,
                fontFamily: 'BeVietnamPro_700Bold',
                fontSize: 15,
                flex: 1,
              }}
              numberOfLines={1}
            >
              {booking.projectName}
            </Text>
          </View>
          {booking.unitTypeName && (
            <View className="flex-row items-center gap-2 mt-1">
              <Ruler size={14} color={semantic.text.tertiary} />
              <Text variant="body" className="text-text-secondary">
                {booking.unitTypeName}
                {booking.unitCode ? ` · Mã căn ${booking.unitCode}` : ''}
              </Text>
            </View>
          )}
        </View>

        {/* Customer card */}
        <View
          className="mx-4 mt-3 p-4 rounded-2xl"
          style={{
            backgroundColor: palette.white,
            borderWidth: 1,
            borderColor: semantic.border.light,
          }}
        >
          <Text
            variant="caption"
            style={{
              color: semantic.text.tertiary,
              fontFamily: 'BeVietnamPro_700Bold',
              letterSpacing: 0.4,
              fontSize: 10,
              marginBottom: 10,
            }}
          >
            KHÁCH HÀNG
          </Text>
          <View className="flex-row items-center gap-3">
            <View
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{ backgroundColor: semantic.action.primarySoft }}
            >
              <Text
                style={{
                  color: semantic.action.primaryDeep,
                  fontFamily: 'BeVietnamPro_700Bold',
                  fontSize: 15,
                }}
              >
                {initials(booking.customerName)}
              </Text>
            </View>
            <View className="flex-1">
              <Text
                style={{
                  color: semantic.text.primary,
                  fontFamily: 'BeVietnamPro_700Bold',
                  fontSize: 15,
                }}
                numberOfLines={1}
              >
                {booking.customerName}
              </Text>
              <Text variant="caption" className="text-text-secondary">
                {formatPhone(booking.customerPhone)}
              </Text>
            </View>
          </View>

          {/* Quick contact actions */}
          <View className="flex-row gap-2 mt-3">
            <ContactAction
              icon={<Phone size={16} color={palette.emerald[700]} strokeWidth={2.2} />}
              label="Gọi"
              bg={palette.emerald[50]}
              onPress={() => Linking.openURL(`tel:${booking.customerPhone}`)}
            />
            <ContactAction
              icon={<MessageSquare size={16} color={palette.blue[700]} strokeWidth={2.2} />}
              label="Zalo"
              bg={palette.blue[50]}
              onPress={() => Linking.openURL(`https://zalo.me/${booking.customerPhone}`)}
            />
            {booking.customerEmail && (
              <ContactAction
                icon={<Mail size={16} color={palette.sienna[700]} strokeWidth={2.2} />}
                label="Email"
                bg={palette.sienna[50]}
                onPress={() => Linking.openURL(`mailto:${booking.customerEmail}`)}
              />
            )}
          </View>

          {booking.customerCccd && (
            <View
              className="flex-row items-center gap-2 mt-3 pt-3"
              style={{ borderTopWidth: 1, borderTopColor: semantic.border.light }}
            >
              <ScanLine size={13} color={semantic.text.tertiary} />
              <Text variant="caption" className="text-text-secondary" style={{ fontSize: 12 }}>
                CCCD: {booking.customerCccd}
              </Text>
            </View>
          )}
          {booking.customerEmail && !booking.customerCccd && (
            <View
              className="flex-row items-center gap-2 mt-3 pt-3"
              style={{ borderTopWidth: 1, borderTopColor: semantic.border.light }}
            >
              <Mail size={13} color={semantic.text.tertiary} />
              <Text variant="caption" className="text-text-secondary" style={{ fontSize: 12 }}>
                {booking.customerEmail}
              </Text>
            </View>
          )}
        </View>

        {/* Linked lead card */}
        {linkedLead && (
          <Pressable
            onPress={() => router.push(`/(app)/leads/${linkedLead.id}`)}
            className="mx-4 mt-3 p-4 rounded-2xl flex-row items-center gap-3"
            style={{
              backgroundColor: semantic.leadGroup[statusToGroup[linkedLead.status]].bg,
              borderWidth: 1,
              borderColor: semantic.border.light,
            }}
          >
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: palette.white }}
            >
              <User size={18} color={semantic.action.primaryDeep} strokeWidth={2.2} />
            </View>
            <View className="flex-1">
              <Text
                variant="caption"
                style={{
                  color: semantic.leadGroup[statusToGroup[linkedLead.status]].fg,
                  fontFamily: 'BeVietnamPro_700Bold',
                  letterSpacing: 0.4,
                  fontSize: 10,
                }}
              >
                LEAD LIÊN KẾT
              </Text>
              <Text
                style={{
                  color: semantic.text.primary,
                  fontFamily: 'BeVietnamPro_700Bold',
                  fontSize: 14,
                  marginTop: 1,
                }}
                numberOfLines={1}
              >
                {linkedLead.fullName}
              </Text>
            </View>
            <ChevronRight size={18} color={semantic.text.secondary} strokeWidth={2} />
          </Pressable>
        )}

        {/* Deposit info */}
        <View
          className="mx-4 mt-3 p-4 rounded-2xl"
          style={{
            backgroundColor: palette.white,
            borderWidth: 1,
            borderColor: semantic.border.light,
          }}
        >
          <Text
            variant="caption"
            style={{
              color: semantic.text.tertiary,
              fontFamily: 'BeVietnamPro_700Bold',
              letterSpacing: 0.4,
              fontSize: 10,
              marginBottom: 10,
            }}
          >
            TIỀN ĐẶT CỌC
          </Text>
          <Text
            style={{
              color: palette.emerald[700],
              fontFamily: 'BeVietnamPro_700Bold',
              fontSize: 22,
            }}
          >
            {formatVND(booking.depositVnd)}
          </Text>
          <Text variant="caption" className="text-text-tertiary mt-1" style={{ fontSize: 12 }}>
            Phương thức: {booking.paymentMethod === 'TRANSFER' ? 'Chuyển khoản' : 'Tiền mặt'}
          </Text>
        </View>

        {/* Notes */}
        {booking.notes && (
          <View
            className="mx-4 mt-3 p-4 rounded-2xl"
            style={{
              backgroundColor: semantic.action.primarySoft,
              borderWidth: 1,
              borderColor: palette.sienna[100],
            }}
          >
            <Text
              variant="caption"
              style={{
                color: semantic.action.primaryDeep,
                fontFamily: 'BeVietnamPro_700Bold',
                letterSpacing: 0.4,
                fontSize: 10,
                marginBottom: 6,
              }}
            >
              GHI CHÚ
            </Text>
            <Text
              variant="body"
              style={{
                color: semantic.text.primary,
                fontSize: 13,
                lineHeight: 19,
              }}
            >
              {booking.notes}
            </Text>
          </View>
        )}

        {/* Timeline */}
        <View className="mx-4 mt-4 p-4 rounded-2xl" style={{ backgroundColor: palette.white, borderWidth: 1, borderColor: semantic.border.light }}>
          <Text
            style={{
              color: semantic.text.primary,
              fontFamily: 'BeVietnamPro_700Bold',
              fontSize: 15,
              marginBottom: 14,
            }}
          >
            Lịch sử trạng thái
          </Text>
          <BookingTimeline history={booking.history} />
        </View>
      </ScrollView>

      {/* Sticky bottom CTA: update status — chỉ show nếu chưa terminal */}
      {!isTerminal && (
        <View
          className="absolute bottom-0 left-0 right-0 bg-white border-t border-border-light"
          style={{
            paddingHorizontal: 16,
            paddingTop: 10,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
          }}
        >
          <Pressable
            onPress={() => setStatusSheetOpen(true)}
            className="h-12 rounded-xl items-center justify-center flex-row gap-2"
            style={{
              backgroundColor: semantic.action.primary,
              shadowColor: semantic.action.primaryDeep,
              shadowOpacity: 0.25,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
              elevation: 4,
            }}
          >
            <ArrowRight size={18} color={palette.white} strokeWidth={2.4} />
            <Text
              variant="body"
              style={{ color: palette.white, fontFamily: 'BeVietnamPro_700Bold' }}
            >
              Chuyển bước
            </Text>
          </Pressable>
        </View>
      )}

      <BottomSheetModal
        visible={statusSheetOpen}
        onClose={() => setStatusSheetOpen(false)}
        heightPercent={0.7}
      >
        <StatusUpdateSheet
          currentStatus={booking.status}
          options={possibleNext}
          onSelect={handleUpdate}
          onCancel={() => setStatusSheetOpen(false)}
        />
      </BottomSheetModal>
    </View>
  );
}

function ContactAction({
  icon,
  label,
  bg,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  bg: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 h-11 rounded-xl flex-row items-center justify-center gap-1.5"
      style={{ backgroundColor: bg }}
    >
      {icon}
      <Text
        variant="body"
        style={{
          color: semantic.text.primary,
          fontFamily: 'BeVietnamPro_700Bold',
          fontSize: 13,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function StatusUpdateSheet({
  currentStatus,
  options,
  onSelect,
  onCancel,
}: {
  currentStatus: BookingStatus;
  options: BookingStatus[];
  onSelect: (status: BookingStatus, note?: string) => void;
  onCancel: () => void;
}) {
  const [pickedStatus, setPickedStatus] = useState<BookingStatus | null>(null);
  const [note, setNote] = useState('');

  const handleConfirm = () => {
    if (!pickedStatus) return;
    if (pickedStatus === 'CANCELLED') {
      Alert.alert(
        'Xác nhận huỷ booking',
        'Booking này sẽ bị đánh dấu huỷ. Hành động không thể hoàn tác.',
        [
          { text: 'Không', style: 'cancel' },
          {
            text: 'Huỷ booking',
            style: 'destructive',
            onPress: () => onSelect(pickedStatus, note.trim() || undefined),
          },
        ]
      );
    } else {
      onSelect(pickedStatus, note.trim() || undefined);
    }
  };

  return (
    <View className="px-5 pt-1 pb-4" style={{ flex: 1 }}>
      <Text variant="h3" className="text-text-primary">
        Chuyển bước booking
      </Text>
      <Text variant="caption" className="text-text-secondary mt-1">
        Đang ở: {bookingStatusLabels[currentStatus]}
      </Text>

      <ScrollView style={{ flex: 1 }} className="mt-4" contentContainerStyle={{ paddingBottom: 16 }}>
        <Text
          variant="caption"
          style={{
            color: semantic.text.tertiary,
            fontFamily: 'BeVietnamPro_700Bold',
            letterSpacing: 0.4,
            fontSize: 10,
            marginBottom: 8,
          }}
        >
          CHỌN BƯỚC TIẾP THEO
        </Text>
        <View className="gap-2">
          {options.map((opt) => {
            const tint = bookingStatusTint[opt];
            const active = pickedStatus === opt;
            const isCancel = opt === 'CANCELLED';
            return (
              <Pressable
                key={opt}
                onPress={() => setPickedStatus(opt)}
                className="p-3 rounded-2xl flex-row items-center gap-3"
                style={{
                  backgroundColor: active ? tint.bg : palette.white,
                  borderWidth: 1,
                  borderColor: active ? tint.fg : semantic.border.default,
                }}
              >
                <View
                  className="w-10 h-10 rounded-xl items-center justify-center"
                  style={{ backgroundColor: tint.bg }}
                >
                  {isCancel ? (
                    <X size={18} color={tint.fg} strokeWidth={2.4} />
                  ) : (
                    <CircleCheck size={18} color={tint.fg} strokeWidth={2.4} />
                  )}
                </View>
                <View className="flex-1">
                  <Text
                    style={{
                      color: semantic.text.primary,
                      fontFamily: 'BeVietnamPro_700Bold',
                      fontSize: 14,
                    }}
                  >
                    {bookingStatusLabels[opt]}
                  </Text>
                  <Text variant="caption" className="text-text-tertiary" style={{ fontSize: 11 }}>
                    {isCancel
                      ? 'Dừng booking vĩnh viễn'
                      : 'Tiến sang bước kế tiếp trong pipeline'}
                  </Text>
                </View>
                {active && (
                  <CircleCheck size={18} color={tint.fg} strokeWidth={2.4} />
                )}
              </Pressable>
            );
          })}
        </View>

        {pickedStatus && (
          <>
            <Text
              variant="caption"
              style={{
                color: semantic.text.tertiary,
                fontFamily: 'BeVietnamPro_700Bold',
                letterSpacing: 0.4,
                fontSize: 10,
                marginTop: 18,
                marginBottom: 6,
              }}
            >
              GHI CHÚ (TUỲ CHỌN)
            </Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder={
                pickedStatus === 'CANCELLED'
                  ? 'Lý do huỷ...'
                  : 'Ghi chú thêm cho bước này...'
              }
              placeholderTextColor={semantic.text.tertiary}
              multiline
              textAlignVertical="top"
              style={{
                minHeight: 80,
                borderWidth: 1,
                borderColor: semantic.border.default,
                borderRadius: 12,
                padding: 12,
                fontFamily: 'BeVietnamPro_400Regular',
                fontSize: 14,
                color: semantic.text.primary,
                lineHeight: 20,
                backgroundColor: palette.white,
              }}
            />
          </>
        )}
      </ScrollView>

      <View className="flex-row gap-2 mt-2">
        <Pressable
          onPress={onCancel}
          className="flex-1 h-12 rounded-xl items-center justify-center border"
          style={{
            backgroundColor: palette.white,
            borderColor: semantic.border.default,
          }}
        >
          <Text
            variant="body"
            style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_600SemiBold' }}
          >
            Huỷ
          </Text>
        </Pressable>
        <Pressable
          onPress={handleConfirm}
          disabled={!pickedStatus}
          className="flex-[1.5] h-12 rounded-xl items-center justify-center"
          style={{
            backgroundColor: pickedStatus ? semantic.action.primary : palette.slate[300],
          }}
        >
          <Text
            variant="body"
            style={{ color: palette.white, fontFamily: 'BeVietnamPro_700Bold' }}
          >
            Xác nhận
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
