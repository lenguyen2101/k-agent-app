import { Pressable, View } from 'react-native';
import { Bell } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { semantic } from '@/theme';

type Props = {
  name: string;
  team?: string;
  tier?: string;
  unreadCount?: number;
  onBellPress?: () => void;
};

export function SalesProfileHeader({ name, team, tier = 'Tân binh', unreadCount = 0, onBellPress }: Props) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(-2)
    .join('')
    .toUpperCase();

  return (
    <View className="flex-row items-center justify-between px-4 py-3">
      <View className="flex-row items-center gap-3 flex-1">
        <View
          className="w-12 h-12 rounded-full items-center justify-center"
          style={{ backgroundColor: semantic.surface.brandSoft }}
        >
          <Text variant="h3" style={{ color: semantic.action.primaryDeep }}>
            {initials}
          </Text>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text variant="caption" className="text-text-secondary">
              Xin chào
            </Text>
            <View
              className="px-2 py-0.5 rounded-full"
              style={{ backgroundColor: semantic.surface.dark }}
            >
              <Text variant="badge" style={{ color: semantic.text.onDark, fontSize: 10 }}>
                {tier}
              </Text>
            </View>
          </View>
          <Text variant="h3" className="text-text-primary mt-0.5" numberOfLines={1}>
            {name}
          </Text>
          {team && (
            <Text variant="caption" className="text-text-tertiary" numberOfLines={1}>
              {team}
            </Text>
          )}
        </View>
      </View>
      <Pressable
        onPress={onBellPress}
        className="relative w-11 h-11 rounded-full items-center justify-center"
        style={({ pressed }) => ({ backgroundColor: pressed ? semantic.surface.hover : semantic.surface.alt })}
      >
        <Bell size={22} color={semantic.text.primary} strokeWidth={2} />
        {unreadCount > 0 && (
          <View
            className="absolute top-2 right-2 min-w-[18px] h-[18px] rounded-full items-center justify-center px-1"
            style={{ backgroundColor: semantic.urgency.fg }}
          >
            <Text variant="badge" style={{ color: semantic.text.inverse, fontSize: 10, lineHeight: 14 }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}
