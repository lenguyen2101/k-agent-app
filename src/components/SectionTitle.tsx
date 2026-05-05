import { View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { semantic } from '@/theme';

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View>
      <Text variant="section" style={{ color: semantic.text.secondary }}>
        {title}
      </Text>
      {subtitle && (
        <Text variant="body" style={{ color: semantic.text.secondary, marginTop: 6 }}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}
