import { View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { semantic, type ActionChipKind } from '@/theme';

type Size = 'sm' | 'md';

export function ActionChip({
  kind,
  label,
  size = 'md',
}: {
  kind: ActionChipKind;
  label: string;
  size?: Size;
}) {
  const t = semantic.actionChip[kind];
  const padding = size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1';
  return (
    <View
      className={`rounded-full ${padding}`}
      style={{ backgroundColor: t.bg }}
    >
      <Text variant="badge" style={{ color: t.fg }}>
        {label}
      </Text>
    </View>
  );
}
