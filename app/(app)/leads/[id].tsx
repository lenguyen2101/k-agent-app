import { useMemo, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Banknote,
  BedDouble,
  Building2,
  Calendar,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Phone,
  Share2,
  ShieldCheck,
  StickyNote,
  UserCheck,
  UserPlus,
  Wallet,
} from 'lucide-react-native';
import { BottomSheetModal } from '@/components/BottomSheetModal';
import { useLeads } from '@/store/leads';
import { useBookings } from '@/store/bookings';
import { StatusBadge } from '@/components/StatusBadge';
import { AddActivitySheet } from '@/components/AddActivitySheet';
import { Text } from '@/components/ui/Text';
import { formatPhone, formatRelativeTime } from '@/lib/format';
import { palette, semantic } from '@/theme';
import { statusToGroup, type ActivityOutcome, type ActivityType } from '@/types/lead';

const sourceLabels: Record<string, string> = {
  NOXH_PLATFORM: 'noxh.net',
  FACEBOOK_ADS: 'Facebook Ads',
  HOTLINE: 'Hotline',
  WALK_IN: 'Đến trực tiếp',
  REFERRAL: 'Giới thiệu',
  EVENT: 'Sự kiện',
  ZALO: 'Zalo',
  OTHER: 'Khác',
};

const activityIconMap: Record<ActivityType, React.ComponentType<{ size: number; color: string; strokeWidth?: number }>> = {
  CALL: Phone,
  SMS: MessageCircle,
  ZALO_MESSAGE: MessageSquare,
  EMAIL: MessageCircle,
  MEETING: Building2,
  NOTE: StickyNote,
  STATUS_CHANGE: UserCheck,
  ASSIGNMENT_CHANGE: UserCheck,
  FOLLOWUP_SCHEDULED: Calendar,
  BOOKING_CREATED: Wallet,
};

const activityLabels: Record<ActivityType, string> = {
  CALL: 'Gọi điện',
  SMS: 'Nhắn tin',
  ZALO_MESSAGE: 'Zalo',
  EMAIL: 'Email',
  MEETING: 'Gặp trực tiếp',
  NOTE: 'Ghi chú',
  STATUS_CHANGE: 'Đổi trạng thái',
  ASSIGNMENT_CHANGE: 'Đổi phụ trách',
  FOLLOWUP_SCHEDULED: 'Đặt lịch follow up',
  BOOKING_CREATED: 'Booking giữ chỗ',
};

const outcomeLabels: Record<ActivityOutcome, { label: string; color: string }> = {
  REACHED:         { label: 'Liên lạc được',  color: palette.emerald[700] },
  INTERESTED:      { label: 'Quan tâm',       color: palette.emerald[700] },
  CALLBACK_LATER:  { label: 'Hẹn gọi lại',    color: palette.blue[700] },
  NO_ANSWER:       { label: 'Không bắt máy',  color: palette.sienna[700] },
  NOT_INTERESTED:  { label: 'Không quan tâm', color: palette.red[600] },
  WRONG_NUMBER:    { label: 'Số sai',         color: palette.red[600] },
};

export default function LeadDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const lead = useLeads((s) => s.leads.find((l) => l.id === id));
  const addActivity = useLeads((s) => s.addActivity);
  // Subscribe stable `bookings` array ref + filter qua useMemo.
  // Không dùng selector .filter() inline — tạo array mới mỗi render →
  // React 18 useSyncExternalStore warn "getSnapshot should be cached" → render loop.
  const allBookings = useBookings((s) => s.bookings);
  const leadBookings = useMemo(
    () => (id ? allBookings.filter((b) => b.leadId === id) : []),
    [allBookings, id]
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  if (!lead) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: semantic.surface.background }}
      >
        <Text variant="body" style={{ color: semantic.text.secondary }}>Không tìm thấy lead</Text>
      </View>
    );
  }

  const group = statusToGroup[lead.status];
  const groupColor = semantic.leadGroup[group].dot;

  return (
    <View className="flex-1" style={{ backgroundColor: semantic.surface.background }}>
      {/* Custom header */}
      <View
        className="flex-row items-center px-2"
        style={{
          backgroundColor: semantic.surface.card,
          borderBottomWidth: 1,
          borderBottomColor: semantic.border.light,
          paddingTop: insets.top + 4,
          paddingBottom: 10,
        }}
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
            {lead.fullName}
          </Text>
          <View className="flex-row items-center gap-1.5 mt-0.5">
            <View className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: groupColor }} />
            <Text variant="caption" className="text-text-secondary">
              Lead · cập nhật {formatRelativeTime(lead.updatedAt)}
            </Text>
          </View>
        </View>
        <Pressable
          className="w-10 h-10 items-center justify-center"
          hitSlop={8}
          onPress={() => router.push(`/(app)/leads/${lead.id}/edit`)}
        >
          <Pencil size={19} color={semantic.text.secondary} />
        </Pressable>
      </View>

      {/* Sub-action bar — sticky dưới header, 4 action: Gọi/SMS/Zalo/More */}
      <View
        className="flex-row px-3 py-2.5"
        style={{
          backgroundColor: semantic.surface.card,
          borderBottomWidth: 1,
          borderBottomColor: semantic.border.light,
        }}
      >
        <SubAction
          icon={<Phone size={18} color={palette.emerald[700]} strokeWidth={2.2} />}
          label="Gọi"
          bg={palette.emerald[50]}
          onPress={() => Linking.openURL(`tel:${lead.phone}`)}
        />
        <SubAction
          icon={<MessageCircle size={18} color={palette.sienna[700]} strokeWidth={2.2} />}
          label="SMS"
          bg={palette.sienna[50]}
          onPress={() => Linking.openURL(`sms:${lead.phone}`)}
        />
        <SubAction
          icon={<MessageSquare size={18} color={palette.blue[700]} strokeWidth={2.2} />}
          label="Zalo"
          bg={palette.blue[50]}
          onPress={() => Linking.openURL(`https://zalo.me/${lead.phone}`)}
        />
        <SubAction
          icon={<MoreHorizontal size={18} color={palette.slate[600]} strokeWidth={2.4} />}
          label="Khác"
          bg={palette.slate[100]}
          onPress={() => setMoreOpen(true)}
        />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Hero — sienna soft */}
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
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text
                style={{
                  color: semantic.action.primaryDeep,
                  fontFamily: 'BeVietnamPro_700Bold',
                  fontSize: 18,
                  lineHeight: 24,
                }}
              >
                {lead.fullName}
              </Text>
              <View className="flex-row items-center gap-1.5 mt-1">
                <Phone size={14} color={semantic.action.primaryDeep} />
                <Text
                  variant="body"
                  style={{ color: semantic.action.primaryDeep, fontFamily: 'BeVietnamPro_600SemiBold' }}
                >
                  {formatPhone(lead.phone)}
                </Text>
              </View>
            </View>
            <StatusBadge status={lead.status} />
          </View>

          {lead.noxhProfile?.ekycVerified && (
            <View
              className="flex-row items-center gap-1.5 mt-3 self-start px-2.5 py-1 rounded-full"
              style={{ backgroundColor: palette.emerald[50] }}
            >
              <ShieldCheck size={13} color={palette.emerald[700]} />
              <Text
                variant="caption"
                style={{
                  color: palette.emerald[700],
                  fontFamily: 'BeVietnamPro_600SemiBold',
                  fontSize: 11,
                }}
              >
                eKYC noxh.net · {lead.noxhProfile.cccdMasked}
              </Text>
            </View>
          )}

          {/* Quick chips */}
          <View
            className="flex-row flex-wrap gap-2 mt-4 pt-4"
            style={{ borderTopWidth: 1, borderTopColor: palette.sienna[100] }}
          >
            <InfoChip
              icon={<Building2 size={12} color={semantic.text.secondary} />}
              label={lead.primaryProject.shortName}
            />
            {lead.unitTypeInterests?.length ? (
              <InfoChip label={lead.unitTypeInterests.join(' / ')} />
            ) : null}
            <InfoChip
              icon={<UserCheck size={12} color={semantic.text.secondary} />}
              label={sourceLabels[lead.source] ?? lead.source}
            />
          </View>
        </View>

        {/* Info card */}
        <View
          className="mx-4 mt-4 p-4 rounded-2xl"
          style={{
            backgroundColor: semantic.surface.card,
            borderWidth: 1,
            borderColor: semantic.border.light,
          }}
        >
          <Text variant="h3" className="text-text-primary mb-1">
            Thông tin lead
          </Text>
          <InfoRow
            icon={<Building2 size={16} color={semantic.text.tertiary} />}
            label="Dự án"
            value={lead.primaryProject.name}
          />
          <InfoRow
            icon={<MapPin size={16} color={semantic.text.tertiary} />}
            label="Địa điểm"
            value={lead.primaryProject.location}
          />
          <InfoRow
            icon={<Banknote size={16} color={semantic.text.tertiary} />}
            label="Khoảng giá"
            value={lead.primaryProject.priceRange}
          />
          <InfoRow
            icon={<BedDouble size={16} color={semantic.text.tertiary} />}
            label="Loại căn"
            value={lead.unitTypeInterests?.join(', ') ?? '—'}
          />
          {lead.nextFollowupAt && (
            <InfoRow
              icon={<Calendar size={16} color={semantic.text.tertiary} />}
              label="Follow up"
              value={formatRelativeTime(lead.nextFollowupAt)}
              last
            />
          )}
        </View>

        {/* Notes */}
        {lead.notes && (
          <View
            className="mx-4 mt-4 p-4 rounded-2xl"
            style={{
              backgroundColor: semantic.status.warningBg,
              borderWidth: 1,
              borderColor: palette.sienna[100],
            }}
          >
            <View className="flex-row items-center gap-2 mb-2">
              <StickyNote size={14} color={semantic.action.primaryDeep} />
              <Text
                variant="caption"
                style={{
                  color: semantic.action.primaryDeep,
                  fontFamily: 'BeVietnamPro_700Bold',
                  letterSpacing: 0.5,
                }}
              >
                GHI CHÚ
              </Text>
            </View>
            <Text variant="body" className="text-text-primary">
              {lead.notes}
            </Text>
          </View>
        )}

        {/* Sản phẩm & Booking */}
        <View className="mx-4 mt-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text variant="h3" className="text-text-primary">
              Sản phẩm & Booking
            </Text>
            {leadBookings.length > 0 && (
              <Text variant="caption" className="text-text-tertiary">
                {leadBookings.length} booking
              </Text>
            )}
          </View>

          {leadBookings.length === 0 ? (
            <View
              className="p-4 rounded-2xl"
              style={{
                backgroundColor: semantic.surface.alt,
                borderWidth: 1,
                borderColor: semantic.border.light,
                borderStyle: 'dashed',
              }}
            >
              <View className="flex-row items-center gap-2">
                <Wallet size={16} color={semantic.text.tertiary} strokeWidth={2} />
                <Text variant="body" className="text-text-secondary">
                  Chưa có booking cho khách này
                </Text>
              </View>
              <Text variant="caption" className="text-text-tertiary mt-1">
                Khi khách chốt sản phẩm, tạo booking để tự động cập nhật funnel.
              </Text>
            </View>
          ) : (
            <View className="gap-2">
              {leadBookings.map((b) => (
                <View
                  key={b.id}
                  className="p-3 rounded-2xl"
                  style={{
                    backgroundColor: palette.white,
                    borderWidth: 1,
                    borderColor: semantic.border.light,
                  }}
                >
                  <View className="flex-row items-start gap-3">
                    <View
                      className="w-9 h-9 rounded-xl items-center justify-center"
                      style={{ backgroundColor: palette.emerald[50] }}
                    >
                      <Wallet size={16} color={palette.emerald[700]} strokeWidth={2.2} />
                    </View>
                    <View className="flex-1">
                      <Text
                        style={{
                          color: semantic.text.primary,
                          fontFamily: 'BeVietnamPro_700Bold',
                          fontSize: 14,
                        }}
                        numberOfLines={1}
                      >
                        {b.projectName}
                        {b.unitTypeName ? ` · ${b.unitTypeName}` : ''}
                        {b.unitCode ? ` · ${b.unitCode}` : ''}
                      </Text>
                      <View className="flex-row items-center gap-2 mt-1">
                        <View className="flex-row items-center gap-1">
                          <Banknote size={11} color={semantic.text.tertiary} />
                          <Text
                            variant="caption"
                            style={{
                              color: palette.emerald[700],
                              fontFamily: 'BeVietnamPro_700Bold',
                            }}
                          >
                            Cọc {(b.depositVnd / 1_000_000).toLocaleString('vi-VN')}tr
                          </Text>
                        </View>
                        <Text variant="caption" className="text-text-tertiary">
                          ·
                        </Text>
                        <Text variant="caption" className="text-text-tertiary">
                          {formatRelativeTime(b.createdAt)}
                        </Text>
                      </View>
                    </View>
                    <View
                      className="px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor:
                          b.status === 'CONFIRMED'
                            ? palette.emerald[50]
                            : b.status === 'PENDING'
                            ? palette.sienna[50]
                            : palette.slate[100],
                      }}
                    >
                      <Text
                        variant="caption"
                        style={{
                          color:
                            b.status === 'CONFIRMED'
                              ? palette.emerald[700]
                              : b.status === 'PENDING'
                              ? palette.sienna[700]
                              : palette.slate[600],
                          fontFamily: 'BeVietnamPro_700Bold',
                          fontSize: 10,
                          letterSpacing: 0.3,
                        }}
                      >
                        {b.status === 'CONFIRMED'
                          ? 'Đã xác nhận'
                          : b.status === 'PENDING'
                          ? 'Chờ CĐT'
                          : 'Đã huỷ'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

        </View>

        {/* Activity timeline */}
        <View className="mx-4 mt-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text variant="h3" className="text-text-primary">
              Lịch sử hoạt động
            </Text>
            <Text variant="caption" className="text-text-tertiary">
              {lead.activities.length} mục
            </Text>
          </View>

          {lead.activities.length === 0 ? (
            <View
              className="p-6 rounded-2xl items-center"
              style={{
                backgroundColor: semantic.surface.alt,
                borderWidth: 1,
                borderColor: semantic.border.light,
                borderStyle: 'dashed',
              }}
            >
              <Phone size={22} color={semantic.text.tertiary} strokeWidth={1.8} />
              <Text variant="body" className="text-text-secondary mt-2 text-center">
                Chưa có hoạt động.{'\n'}Bắt đầu gọi điện cho khách.
              </Text>
            </View>
          ) : (
            <View>
              {lead.activities.map((a, idx) => {
                const Icon = activityIconMap[a.type];
                const outcomeMeta = a.outcome ? outcomeLabels[a.outcome] : null;
                const last = idx === lead.activities.length - 1;
                return (
                  <View key={a.id} className="flex-row gap-3">
                    <View className="items-center" style={{ width: 34 }}>
                      <View
                        className="w-8 h-8 rounded-full items-center justify-center"
                        style={{ backgroundColor: semantic.action.primarySoft }}
                      >
                        <Icon size={14} color={semantic.action.primaryDeep} strokeWidth={2.2} />
                      </View>
                      {!last && (
                        <View
                          className="w-0.5 flex-1 mt-1"
                          style={{ backgroundColor: semantic.border.light, minHeight: 12 }}
                        />
                      )}
                    </View>
                    <View className="flex-1 pb-4">
                      <View className="flex-row items-center gap-2">
                        <Text
                          variant="body"
                          style={{
                            color: semantic.text.primary,
                            fontFamily: 'BeVietnamPro_600SemiBold',
                          }}
                        >
                          {activityLabels[a.type]}
                        </Text>
                        {outcomeMeta && (
                          <View
                            className="px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${outcomeMeta.color}15`,
                            }}
                          >
                            <Text
                              variant="caption"
                              style={{
                                color: outcomeMeta.color,
                                fontFamily: 'BeVietnamPro_600SemiBold',
                                fontSize: 11,
                              }}
                            >
                              {outcomeMeta.label}
                            </Text>
                          </View>
                        )}
                      </View>
                      {a.content && (
                        <Text variant="body" className="text-text-secondary mt-1">
                          {a.content}
                        </Text>
                      )}
                      <View className="flex-row items-center gap-1 mt-1.5">
                        <Clock size={11} color={semantic.text.tertiary} />
                        <Text variant="caption" className="text-text-tertiary">
                          {formatRelativeTime(a.createdAt)}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky bottom: Add activity */}
      <View
        className="absolute bottom-0 left-0 right-0 px-4 pt-3"
        style={{
          backgroundColor: semantic.surface.card,
          borderTopWidth: 1,
          borderTopColor: semantic.border.light,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
        }}
      >
        <Pressable
          onPress={() => setSheetOpen(true)}
          className="h-12 rounded-xl items-center justify-center"
          style={{
            backgroundColor: semantic.action.primary,
            shadowColor: semantic.action.primaryDeep,
            shadowOpacity: 0.25,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4,
          }}
        >
          <Text variant="body" style={{ color: palette.white, fontFamily: 'BeVietnamPro_700Bold' }}>
            + Thêm hoạt động
          </Text>
        </Pressable>
      </View>

      <AddActivitySheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSubmit={(v) => addActivity({ leadId: lead.id, ...v })}
      />

      <BottomSheetModal visible={moreOpen} onClose={() => setMoreOpen(false)}>
        <View className="px-4 pt-1 pb-6">
          <Text variant="h3" className="text-text-primary">
            Hành động khác
          </Text>
          <Text variant="caption" className="text-text-secondary mt-1">
            Lead: {lead.fullName}
          </Text>

          <View className="mt-4 gap-2">
            <MoreMenuRow
              icon={<Wallet size={18} color={palette.sienna[700]} />}
              iconBg={palette.sienna[50]}
              label="Tạo booking cho khách"
              subtitle="Đặt chỗ dự án, sản phẩm"
              onPress={() => {
                setMoreOpen(false);
                router.push({
                  pathname: '/(app)/booking',
                  params: { leadId: lead.id },
                });
              }}
            />
            <MoreMenuRow
              icon={<Mail size={18} color={palette.blue[700]} />}
              iconBg={palette.blue[50]}
              label="Gửi email"
              subtitle="Giới thiệu dự án qua email"
              onPress={() => {
                setMoreOpen(false);
                Linking.openURL(`mailto:?subject=Giới thiệu dự án&to=`);
              }}
            />
            <MoreMenuRow
              icon={<Share2 size={18} color={palette.sienna[700]} />}
              iconBg={palette.sienna[50]}
              label="Chia sẻ lead"
              subtitle="Gửi info lead cho đồng nghiệp"
              onPress={() => {
                setMoreOpen(false);
                Linking.openURL(
                  `sms:?body=Lead: ${lead.fullName} - ${lead.phone} - ${lead.primaryProject.shortName}`
                );
              }}
            />
            <MoreMenuRow
              icon={<UserPlus size={18} color={palette.emerald[700]} />}
              iconBg={palette.emerald[50]}
              label="Chuyển phụ trách"
              subtitle="Giao lead cho sale khác (cần duyệt)"
              onPress={() => {
                setMoreOpen(false);
                Alert.alert('Sắp ra mắt', 'Chuyển phụ trách lead sẽ có ở phase tiếp.');
              }}
              comingSoon
            />
          </View>
        </View>
      </BottomSheetModal>
    </View>
  );
}

function SubAction({
  icon,
  label,
  bg,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  bg: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 items-center"
      hitSlop={4}
    >
      <View
        className="w-10 h-10 rounded-xl items-center justify-center"
        style={{ backgroundColor: bg }}
      >
        {icon}
      </View>
      <Text
        variant="caption"
        style={{
          color: semantic.text.primary,
          fontFamily: 'BeVietnamPro_600SemiBold',
          fontSize: 11,
          marginTop: 4,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function MoreMenuRow({
  icon,
  iconBg,
  label,
  subtitle,
  onPress,
  comingSoon,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  subtitle: string;
  onPress?: () => void;
  comingSoon?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="p-3 rounded-2xl flex-row items-center gap-3"
      style={{
        backgroundColor: palette.white,
        borderWidth: 1,
        borderColor: semantic.border.light,
        opacity: comingSoon ? 0.7 : 1,
      }}
    >
      <View
        className="w-10 h-10 rounded-xl items-center justify-center"
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </View>
      <View className="flex-1">
        <Text
          variant="body"
          style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_600SemiBold' }}
        >
          {label}
        </Text>
        <Text variant="caption" className="text-text-secondary mt-0.5" numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      {comingSoon && (
        <View
          className="px-2 py-0.5 rounded-full"
          style={{ backgroundColor: palette.sienna[100] }}
        >
          <Text
            variant="caption"
            style={{
              color: palette.sienna[700],
              fontFamily: 'BeVietnamPro_700Bold',
              fontSize: 10,
              letterSpacing: 0.3,
            }}
          >
            SẮP RA MẮT
          </Text>
        </View>
      )}
    </Pressable>
  );
}

function InfoChip({ icon, label }: { icon?: React.ReactNode; label: string }) {
  return (
    <View
      className="flex-row items-center gap-1 px-2.5 py-1 rounded-full"
      style={{ backgroundColor: palette.white, borderWidth: 1, borderColor: palette.sienna[100] }}
    >
      {icon}
      <Text
        variant="caption"
        style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_500Medium', fontSize: 12 }}
      >
        {label}
      </Text>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
  last,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
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
        {icon ?? <View />}
      </View>
      <Text variant="body" className="text-text-secondary ml-3 mr-4 w-24">
        {label}
      </Text>
      <Text
        variant="body"
        className="text-text-primary flex-1"
        numberOfLines={2}
        style={{ fontFamily: 'BeVietnamPro_500Medium' }}
      >
        {value}
      </Text>
    </View>
  );
}
