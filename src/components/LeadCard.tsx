import { Pressable, View } from 'react-native';
import { Building2, Clock, Phone } from 'lucide-react-native';
import type { Lead } from '@/types/lead';
import { formatPhone, formatRelativeTime, isOverdue } from '@/lib/format';
import { palette, semantic } from '@/theme';
import { StatusBadge } from './StatusBadge';
import { ActionChip } from './ActionChip';
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

export function LeadCard({ lead, onPress }: { lead: Lead; onPress?: () => void }) {
  const overdue = isOverdue(lead.nextFollowupAt);
  const chip = actionChipFor(lead);

  return (
    <Pressable
      onPress={onPress}
      className="bg-surface-card rounded-2xl p-4 active:bg-surface-hover"
      style={{
        borderWidth: 1,
        borderColor: overdue ? semantic.urgency.bg : semantic.border.light,
        shadowColor: palette.obsidian[900],
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
    >
      <View className="flex-row items-start gap-3">
        <View
          className="w-11 h-11 rounded-full items-center justify-center"
          style={{ backgroundColor: semantic.surface.brandSoft }}
        >
          <Text variant="body" style={{ color: semantic.action.primaryDeep, fontFamily: 'BeVietnamPro_600SemiBold' }}>
            {leadInitials(lead.fullName)}
          </Text>
        </View>

        <View className="flex-1">
          <View className="flex-row items-start justify-between gap-2">
            <View className="flex-1">
              <Text variant="h3" className="text-text-primary" numberOfLines={1}>
                {lead.fullName}
              </Text>
              <View className="flex-row items-center mt-0.5 gap-1.5">
                <Phone size={13} color={semantic.text.tertiary} />
                <Text variant="body" className="text-text-secondary">
                  {formatPhone(lead.phone)}
                </Text>
              </View>
            </View>
            <StatusBadge status={lead.status} size="sm" />
          </View>

          <View className="flex-row items-center mt-2 gap-1.5">
            <Building2 size={13} color={semantic.text.tertiary} />
            <Text variant="caption" className="text-text-secondary flex-1" numberOfLines={1}>
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
            {chip && <ActionChip kind={chip.kind} label={chip.label} size="sm" />}
          </View>
        </View>
      </View>
    </Pressable>
  );
}
