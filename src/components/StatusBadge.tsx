import { View } from 'react-native';
import { semantic } from '@/theme';
import { statusLabels, statusToGroup, type LeadStatus } from '@/types/lead';
import { Text } from '@/components/ui/Text';

export function StatusBadge({ status, size = 'md' }: { status: LeadStatus; size?: 'sm' | 'md' }) {
  const t = semantic.leadGroup[statusToGroup[status]];
  const padding = size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1';
  return (
    <View
      className={`flex-row items-center gap-1.5 rounded-full ${padding}`}
      style={{ backgroundColor: t.bg }}
    >
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: t.dot }} />
      <Text variant="badge" style={{ color: t.fg }}>
        {statusLabels[status]}
      </Text>
    </View>
  );
}
