import { Pressable, View } from 'react-native';
import { Bell } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { palette, semantic } from '@/theme';

type Props = {
  name: string;
  team?: string;
  /** Giữ lại cho backward compat với Home, hiện không hiển thị trong header */
  tier?: string;
  unreadCount?: number;
  onBellPress?: () => void;
};

export function SalesProfileHeader({ name, team, unreadCount = 0, onBellPress }: Props) {
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
          className="w-11 h-11 rounded-full items-center justify-center"
          style={{ backgroundColor: semantic.surface.brandSoft }}
        >
          <Text
            variant="body"
            style={{ color: semantic.action.primaryDeep, fontFamily: 'BeVietnamPro_700Bold' }}
          >
            {initials}
          </Text>
        </View>
        <View className="flex-1">
          <Text
            variant="h3"
            style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_700Bold' }}
            numberOfLines={1}
          >
            {name}
          </Text>
          {team && (
            <Text
              variant="caption"
              style={{ color: semantic.text.secondary, marginTop: 2 }}
              numberOfLines={1}
            >
              {team}
            </Text>
          )}
        </View>
      </View>

      <Pressable
        onPress={onBellPress}
        className="relative w-12 h-12 rounded-2xl items-center justify-center"
        style={({ pressed }) => ({
          backgroundColor: pressed ? semantic.surface.hover : semantic.surface.alt,
        })}
        hitSlop={6}
      >
        <Bell size={24} color={semantic.text.primary} strokeWidth={2} />
        {unreadCount > 0 && (
          <View
            className="absolute rounded-full items-center justify-center px-1"
            style={{
              backgroundColor: semantic.urgency.fg,
              top: -4,
              right: -4,
              minWidth: 20,
              height: 20,
              borderWidth: 2,
              borderColor: palette.white,
            }}
          >
            <Text
              variant="badge"
              style={{ color: palette.white }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}
