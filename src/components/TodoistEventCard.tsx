import { memo } from 'react';
import { Linking, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Clock, Handshake, MapPin, Phone, PhoneCall } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { timeLabel, type CalendarEvent } from '@/lib/calendar';
import { palette, semantic } from '@/theme';

// Todoist-inspired event card — replace dense row layout với clean card
// có round checkbox (màu theo type) + title bold + meta chips (time, project).
// Dùng trên Home "Lịch hôm nay" và Calendar agenda view.
type Props = {
  event: CalendarEvent;
  /** Khi true → card không có shadow/border (dùng trong container group đã có border). */
  flat?: boolean;
};

export const TodoistEventCard = memo(function TodoistEventCard({ event, flat = false }: Props) {
  const now = Date.now();
  const scheduled = new Date(event.scheduledAt).getTime();
  const overdue = scheduled < now;

  const typeMeta =
    event.type === 'MEETING'
      ? {
          icon: <Handshake size={12} color={palette.blue[700]} strokeWidth={2.4} />,
          label: 'Xem nhà',
        }
      : {
          icon: <PhoneCall size={12} color={palette.sienna[700]} strokeWidth={2.4} />,
          label: 'Gọi chăm',
        };

  const timeChipBg = overdue ? palette.red[50] : palette.emerald[50];
  const timeChipFg = overdue ? palette.red[600] : palette.emerald[700];
  const timeChipIcon = overdue ? Clock : MapPin;
  const TimeIcon = timeChipIcon;

  return (
    <Pressable
      onPress={() => router.push(`/(app)/leads/${event.leadId}`)}
      className="flex-row items-center gap-3 p-4 rounded-2xl"
      style={{
        backgroundColor: palette.white,
        borderWidth: flat ? 0 : 1,
        borderColor: semantic.border.light,
        shadowColor: palette.obsidian[900],
        shadowOpacity: flat ? 0 : 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: flat ? 0 : 1,
      }}
    >
      <View className="flex-1">
        <Text
          variant="body"
          style={{ color: semantic.text.primary, fontFamily: 'BeVietnamPro_500Medium' }}
          numberOfLines={1}
        >
          {event.leadName}
        </Text>

        <View className="flex-row items-center gap-1.5 mt-1.5 flex-wrap">
          {/* Time chip — green nếu future, red nếu overdue */}
          <View
            className="flex-row items-center gap-1 px-1.5 py-0.5 rounded-md"
            style={{ backgroundColor: timeChipBg }}
          >
            <TimeIcon size={11} color={timeChipFg} strokeWidth={2.4} />
            <Text
              variant="caption"
              style={{ color: timeChipFg, fontFamily: 'BeVietnamPro_700Bold' }}
            >
              {overdue ? `Trễ ${timeLabel(event.scheduledAt)}` : timeLabel(event.scheduledAt)}
            </Text>
          </View>

          {/* Type chip */}
          <View
            className="flex-row items-center gap-1 px-1.5 py-0.5 rounded-md"
            style={{ backgroundColor: semantic.surface.alt }}
          >
            {typeMeta.icon}
            <Text
              variant="caption"
              style={{ color: semantic.text.secondary, fontFamily: 'BeVietnamPro_600SemiBold' }}
            >
              {typeMeta.label}
            </Text>
          </View>

          {/* Project name */}
          <Text
            variant="caption"
            style={{ color: semantic.text.tertiary, flex: 1 }}
            numberOfLines={1}
          >
            · {event.projectName}
          </Text>
        </View>
      </View>

      {/* Quick call button */}
      <Pressable
        onPress={(e) => {
          e.stopPropagation();
          Linking.openURL(`tel:${event.leadPhone}`);
        }}
        hitSlop={6}
        className="w-9 h-9 rounded-full items-center justify-center"
        style={{ backgroundColor: palette.emerald[50] }}
      >
        <Phone size={15} color={palette.emerald[700]} strokeWidth={2.4} />
      </Pressable>
    </Pressable>
  );
});
