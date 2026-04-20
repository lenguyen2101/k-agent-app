import { useState } from 'react';
import { Linking, Pressable, ScrollView, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, MapPin, MessageCircle, Phone, ShieldCheck } from 'lucide-react-native';
import { useLeads } from '@/store/leads';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/Button';
import { AddActivitySheet } from '@/components/AddActivitySheet';
import { Text } from '@/components/ui/Text';
import { formatPhone, formatRelativeTime } from '@/lib/format';
import { palette, semantic } from '@/theme';

export default function LeadDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lead = useLeads((s) => s.leads.find((l) => l.id === id));
  const addActivity = useLeads((s) => s.addActivity);
  const [sheetOpen, setSheetOpen] = useState(false);

  if (!lead) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text variant="body" className="text-text-secondary">Không tìm thấy lead</Text>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerClassName="pb-32">
        <View className="bg-surface-alt px-4 pt-4 pb-5">
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-1">
              <Text variant="h2" className="text-text-title">{lead.fullName}</Text>
              <Text variant="body" className="text-text-secondary mt-1">{formatPhone(lead.phone)}</Text>
            </View>
            <StatusBadge status={lead.status} />
          </View>

          {lead.noxhProfile && (
            <View className="flex-row items-center gap-1.5 mt-2 bg-status-success-bg self-start px-3 py-1.5 rounded-full">
              <ShieldCheck size={14} color={semantic.status.success} />
              <Text variant="caption" className="text-status-success" style={{ fontWeight: '600' }}>
                eKYC verified · {lead.noxhProfile.cccdMasked}
              </Text>
            </View>
          )}
        </View>

        <View className="flex-row mx-4 mt-4 gap-2">
          <Pressable
            onPress={() => Linking.openURL(`tel:${lead.phone}`)}
            className="flex-1 h-12 rounded-md bg-primary flex-row items-center justify-center gap-2 active:bg-primary-hover"
          >
            <Phone size={18} color={palette.white} />
            <Text variant="button" className="text-white">Gọi</Text>
          </Pressable>
          <Pressable
            onPress={() => Linking.openURL(`sms:${lead.phone}`)}
            className="flex-1 h-12 rounded-md bg-white border border-text-primary flex-row items-center justify-center gap-2 active:bg-surface-hover"
          >
            <MessageCircle size={18} color={semantic.text.primary} />
            <Text variant="button" className="text-text-primary">Nhắn tin</Text>
          </Pressable>
        </View>

        <View className="mx-4 mt-6">
          <Text variant="h3" className="text-text-title mb-3">Thông tin lead</Text>
          <View className="bg-white rounded-lg border border-border-light divide-y divide-border-light">
            <Row label="Dự án quan tâm" value={lead.primaryProject.name} />
            <Row
              label="Địa điểm"
              value={lead.primaryProject.location}
              icon={<MapPin size={14} color={semantic.text.tertiary} />}
            />
            <Row label="Loại căn" value={lead.unitTypeInterests?.join(', ') ?? '—'} />
            <Row label="Giá" value={lead.primaryProject.priceRange} />
            <Row label="Nguồn lead" value={sourceLabel(lead.source)} />
            {lead.nextFollowupAt && (
              <Row
                label="Follow up tiếp"
                value={formatRelativeTime(lead.nextFollowupAt)}
                icon={<Calendar size={14} color={semantic.text.tertiary} />}
              />
            )}
          </View>
        </View>

        {lead.notes && (
          <View className="mx-4 mt-6">
            <Text variant="h3" className="text-text-title mb-2">Ghi chú</Text>
            <View className="bg-status-warning-bg border border-status-warning rounded-lg p-3">
              <Text variant="body-lg" className="text-text-primary">{lead.notes}</Text>
            </View>
          </View>
        )}

        <View className="mx-4 mt-6">
          <Text variant="h3" className="text-text-title mb-3">
            Lịch sử hoạt động · {lead.activities.length}
          </Text>
          {lead.activities.length === 0 ? (
            <View className="bg-white border border-border-light rounded-lg p-6 items-center">
              <Text variant="body" className="text-text-secondary">
                Chưa có hoạt động. Bắt đầu gọi điện cho khách.
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {lead.activities.map((a) => (
                <View key={a.id} className="bg-white border border-border-light rounded-lg p-3">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text variant="caption" className="text-text-primary">
                      {activityLabel(a.type)}
                    </Text>
                    <Text variant="caption" className="text-text-tertiary">
                      {formatRelativeTime(a.createdAt)}
                    </Text>
                  </View>
                  {a.content && (
                    <Text variant="body" className="text-text-secondary mt-1">{a.content}</Text>
                  )}
                  {a.outcome && (
                    <Text variant="caption" className="text-status-info mt-1">
                      → {outcomeLabel(a.outcome)}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <SafeAreaView
        edges={['bottom']}
        className="absolute left-0 right-0 bottom-0 bg-white border-t border-border-light"
      >
        <View className="px-4 py-3">
          <Button
            label="+ Thêm hoạt động"
            variant="primary"
            fullWidth
            onPress={() => setSheetOpen(true)}
          />
        </View>
      </SafeAreaView>

      <AddActivitySheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSubmit={(v) => addActivity({ leadId: lead.id, ...v })}
      />
    </View>
  );
}

function Row({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <View className="px-4 py-3 flex-row items-center justify-between">
      <Text variant="caption" className="text-text-secondary">{label}</Text>
      <View className="flex-row items-center gap-1.5 flex-1 ml-3 justify-end">
        {icon}
        <Text variant="body" className="text-text-primary" style={{ fontWeight: '500' }} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function sourceLabel(s: string) {
  const map: Record<string, string> = {
    NOXH_PLATFORM: 'noxh.net',
    FACEBOOK_ADS: 'Facebook Ads',
    HOTLINE: 'Hotline',
    WALK_IN: 'Đến trực tiếp',
    REFERRAL: 'Giới thiệu',
    EVENT: 'Sự kiện',
    ZALO: 'Zalo',
    OTHER: 'Khác',
  };
  return map[s] ?? s;
}

function activityLabel(t: string) {
  const map: Record<string, string> = {
    CALL: '📞 Gọi điện',
    SMS: '💬 Nhắn tin',
    ZALO_MESSAGE: '💬 Zalo',
    EMAIL: '📧 Email',
    MEETING: '🤝 Gặp trực tiếp',
    NOTE: '📝 Ghi chú',
    STATUS_CHANGE: 'Đổi trạng thái',
    ASSIGNMENT_CHANGE: 'Đổi phụ trách',
    FOLLOWUP_SCHEDULED: 'Đặt lịch follow up',
  };
  return map[t] ?? t;
}

function outcomeLabel(o: string) {
  const map: Record<string, string> = {
    REACHED: 'Liên lạc được',
    NO_ANSWER: 'Không bắt máy',
    WRONG_NUMBER: 'Số sai',
    CALLBACK_LATER: 'Hẹn gọi lại',
    NOT_INTERESTED: 'Không quan tâm',
    INTERESTED: 'Quan tâm',
  };
  return map[o] ?? o;
}
