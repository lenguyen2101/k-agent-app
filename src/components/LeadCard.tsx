import { memo } from 'react';
import { Pressable, View } from 'react-native';
import { Building2, Clock, Phone } from 'lucide-react-native';
import { statusToGroup, type Lead } from '@/types/lead';
import { formatPhone, formatRelativeTime, isOverdue } from '@/lib/format';
import { palette, semantic } from '@/theme';
import { StatusBadge } from './StatusBadge';
import { ActionChip } from './ActionChip';
import { PriorityFrame, type FrameVariant } from './PriorityFrame';
import { Text } from '@/components/ui/Text';

function leadInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(-2)
    .join('')
    .toUpperCase();
}

function actionChipFor(lead: Lead): { kind: 'priority' | 'offer' | 'deal'; label: string } | null {
  if (lead.status === 'NEW') return { kind: 'priority', label: 'Ưu tiên' };
  if (lead.status === 'APPOINTMENT' || lead.status === 'VISITED') return { kind: 'offer', label: 'Đề nghị xem nhà' };
  if (lead.status === 'NEGOTIATING' || lead.status === 'DEPOSITED' || lead.status === 'CONTRACTED')
    return { kind: 'deal', label: 'Giao dịch' };
  return null;
}

export const LeadCard = memo(function LeadCard({
  lead,
  onPress,
}: {
  lead: Lead;
  onPress?: () => void;
}) {
  const overdue = isOverdue(lead.nextFollowupAt);
  const chip = actionChipFor(lead);
  const frameVariant: FrameVariant | null = chip
    ? chip.kind === 'priority'
      ? 'priority'
      : chip.kind === 'offer'
        ? 'offer'
        : chip.kind === 'deal'
          ? 'deal'
          : null
    : null;
  const wrapped = frameVariant !== null;
  const groupTint = semantic.leadGroup[statusToGroup[lead.status]];

  // Khi wrap PriorityFrame → frame tạo border gradient + shadow đậm. Inner
  // card bỏ border, shadow để tránh chồng lớp; rounded-2xl giữ cho visual
  // continuity với frame rounded 16.
  const cardContent = (
    <Pressable
      onPress={onPress}
      className="rounded-2xl p-4"
      style={{
        backgroundColor: semantic.surface.card,
        borderWidth: wrapped ? 0 : 1,
        borderColor: overdue ? semantic.urgency.bg : semantic.border.light,
        shadowColor: palette.obsidian[900],
        shadowOpacity: wrapped ? 0 : 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: wrapped ? 0 : 2,
      }}
    >
      <View className="flex-row items-start gap-3">
        <View
          className="w-11 h-11 rounded-full items-center justify-center"
          style={{ backgroundColor: groupTint.bg }}
        >
          <Text variant="body" style={{ color: groupTint.fg, fontFamily: 'BeVietnamPro_700Bold' }}>
            {leadInitials(lead.fullName)}
          </Text>
        </View>

        <View className="flex-1">
          <View className="flex-row items-start justify-between gap-2">
            <View className="flex-1">
              <Text variant="h3" style={{ color: semantic.text.primary }} numberOfLines={1}>
                {lead.fullName}
              </Text>
              <View className="flex-row items-center mt-0.5 gap-1.5">
                <Phone size={13} color={semantic.text.tertiary} />
                <Text variant="body" style={{ color: semantic.text.secondary }}>
                  {formatPhone(lead.phone)}
                </Text>
              </View>
            </View>
            <StatusBadge status={lead.status} size="sm" />
          </View>

          <View className="flex-row items-center mt-2 gap-1.5">
            <Building2 size={13} color={semantic.text.tertiary} />
            <Text
              variant="caption"
              style={{ color: semantic.text.secondary, flex: 1 }}
              numberOfLines={1}
            >
              {lead.primaryProject.shortName}
              {lead.unitTypeInterests?.length ? ` · ${lead.unitTypeInterests.join('/')}` : ''}
            </Text>
          </View>

          <View className="flex-row items-center justify-between mt-3 gap-2">
            <View className="flex-row items-center gap-1.5 flex-1">
              {lead.nextFollowupAt && (
                <>
                  <Clock size={13} color={overdue ? semantic.urgency.fg : semantic.text.tertiary} />
                  <Text
                    variant="caption"
                    numberOfLines={1}
                    style={{
                      color: overdue ? semantic.urgency.fg : semantic.text.tertiary,
                      fontFamily: overdue ? 'BeVietnamPro_500Medium' : 'BeVietnamPro_400Regular',
                    }}
                  >
                    {overdue ? 'Quá hạn ' : ''}
                    {formatRelativeTime(lead.nextFollowupAt)}
                  </Text>
                </>
              )}
            </View>
            {chip && !wrapped && (
              <ActionChip kind={chip.kind} label={chip.label} size="sm" />
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );

  if (frameVariant) return <PriorityFrame variant={frameVariant}>{cardContent}</PriorityFrame>;
  return cardContent;
});
