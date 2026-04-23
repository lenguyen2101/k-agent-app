import { memo } from 'react';
import { Linking, Pressable, View } from 'react-native';
import { Building2, ChevronRight, Clock, Phone } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { formatRelativeTime, isOverdue } from '@/lib/format';
import { palette, semantic } from '@/theme';
import { statusLabels, statusToGroup, type Lead } from '@/types/lead';

// Compact row dùng cho list "Cần follow up hôm nay" trên Home.
// Khác LeadCard ở Lead tab:
// - Layout dense (1 dòng name + subtitle), avatar 38px
// - Inline "Gọi" button quick action (1 tap dial phone, không navigate)
// - Urgency tint trên left-border khi overdue — mắt scan nhanh "cần xử lý"
// - Không priority frame / action chips (Home là triage, không deep context)
type Props = {
  lead: Lead;
  onPress?: () => void;
  /** True nếu không phải row cuối — render border-bottom để group rows trong 1 card container. */
  showDivider?: boolean;
};

function leadInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const FollowUpRow = memo(function FollowUpRow({ lead, onPress, showDivider }: Props) {
  const overdue = isOverdue(lead.nextFollowupAt);
  const groupTint = semantic.leadGroup[statusToGroup[lead.status]];

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 px-3 py-3"
      style={{
        borderBottomWidth: showDivider ? 1 : 0,
        borderBottomColor: semantic.border.light,
        // Urgency indicator — thin left border đỏ khi overdue, giúp eye scan
        borderLeftWidth: overdue ? 3 : 0,
        borderLeftColor: overdue ? semantic.urgency.fg : 'transparent',
      }}
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{ backgroundColor: groupTint.bg }}
      >
        <Text variant="caption" style={{ color: groupTint.fg, fontFamily: 'BeVietnamPro_700Bold' }}>
          {leadInitials(lead.fullName)}
        </Text>
      </View>

      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text
            variant="subtitle"
            style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_700Bold', flex: 1 }}
            numberOfLines={1}
          >
            {lead.fullName}
          </Text>
          <Text variant="badge" style={{ color: groupTint.fg }}>
            {statusLabels[lead.status]}
          </Text>
        </View>

        <View className="flex-row items-center gap-2 mt-0.5">
          {lead.nextFollowupAt && (
            <View className="flex-row items-center gap-1">
              <Clock
                size={11}
                color={overdue ? semantic.urgency.fg : semantic.text.tertiary}
                strokeWidth={2.2}
              />
              <Text
                variant="caption"
                style={{
                  color: overdue ? semantic.urgency.fg : semantic.text.tertiary,
                  fontFamily: overdue ? 'BeVietnamPro_600SemiBold' : 'BeVietnamPro_500Medium',
                }}
                numberOfLines={1}
              >
                {overdue ? 'Quá hạn ' : ''}
                {formatRelativeTime(lead.nextFollowupAt)}
              </Text>
            </View>
          )}
          <Text variant="caption" className="text-text-tertiary">·</Text>
          <View className="flex-row items-center gap-1 flex-1">
            <Building2 size={11} color={semantic.text.tertiary} />
            <Text
              variant="caption"
              style={{ color: semantic.text.secondary, flex: 1 }}
              numberOfLines={1}
            >
              {lead.primaryProject.shortName}
            </Text>
          </View>
        </View>
      </View>

      {/* Quick call button — 1 tap dial, không navigate */}
      <Pressable
        onPress={(e) => {
          e.stopPropagation();
          Linking.openURL(`tel:${lead.phone}`);
        }}
        hitSlop={6}
        className="w-9 h-9 rounded-full items-center justify-center"
        style={{ backgroundColor: palette.emerald[50] }}
      >
        <Phone size={15} color={palette.emerald[700]} strokeWidth={2.4} />
      </Pressable>

      <ChevronRight size={16} color={semantic.text.tertiary} strokeWidth={2} />
    </Pressable>
  );
});
