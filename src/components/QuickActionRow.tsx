import { Pressable, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { semantic } from '@/theme';

export type QuickAction = {
  key: string;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
  onPress?: () => void;
};

export function QuickActionRow({ actions }: { actions: QuickAction[] }) {
  return (
    <View className="flex-row">
      {actions.map((a) => {
        const Icon = a.icon;
        return (
          <Pressable
            key={a.key}
            onPress={a.onPress}
            className="flex-1 items-center"
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <View
              className="w-12 h-12 rounded-2xl items-center justify-center"
              style={{ backgroundColor: semantic.surface.brandSoft }}
            >
              <Icon size={22} color={semantic.action.primary} strokeWidth={2} />
              {a.badge !== undefined && (
                <View
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full items-center justify-center px-1"
                  style={{ backgroundColor: semantic.urgency.fg }}
                >
                  <Text variant="badge" style={{ color: semantic.text.inverse, fontSize: 10, lineHeight: 14 }}>
                    {a.badge}
                  </Text>
                </View>
              )}
            </View>
            <Text variant="caption" className="text-text-primary mt-2" numberOfLines={1}>
              {a.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
