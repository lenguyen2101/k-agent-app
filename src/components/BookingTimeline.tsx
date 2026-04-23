import { View } from 'react-native';
import { Check, StickyNote, X } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { formatRelativeTime } from '@/lib/format';
import {
  bookingStatusLabels,
  type BookingStatusEvent,
} from '@/store/bookings';
import { bookingStatusTint } from '@/components/BookingStatusBadge';
import { palette, semantic } from '@/theme';

// Vertical timeline của status history. Mỗi event = 1 checkpoint với
// icon (check hoặc X cho CANCELLED), label status, thời gian, note optional.
// Line mảnh nối các checkpoint (done = sienna đậm, latest = vertical dashed faint).

type Props = {
  history: BookingStatusEvent[];
};

export function BookingTimeline({ history }: Props) {
  return (
    <View>
      {history.map((event, i) => {
        const isLast = i === history.length - 1;
        const isCancelled = event.status === 'CANCELLED';
        const tint = bookingStatusTint[event.status];
        // Circle: bg solid nhạt + icon đậm cùng màu family. COMPLETED có
        // tint swap (bg=dark, fg=white) — override về soft emerald palette
        // để cùng pattern với các status khác trên timeline.
        const circleBg = event.status === 'COMPLETED' ? palette.emerald[50] : tint.bg;
        const circleFg = event.status === 'COMPLETED' ? palette.emerald[700] : tint.fg;

        return (
          <View key={i} className="flex-row" style={{ minHeight: 56 }}>
            {/* Timeline rail */}
            <View className="items-center" style={{ width: 32 }}>
              <View
                className="w-7 h-7 rounded-full items-center justify-center"
                style={{ backgroundColor: circleBg }}
              >
                {isCancelled ? (
                  <X size={14} color={circleFg} strokeWidth={3} />
                ) : (
                  <Check size={14} color={circleFg} strokeWidth={3} />
                )}
              </View>
              {!isLast && (
                <View
                  style={{
                    flex: 1,
                    width: 2,
                    backgroundColor: semantic.border.default,
                    marginTop: 2,
                    marginBottom: 2,
                  }}
                />
              )}
            </View>

            {/* Content */}
            <View className="flex-1 ml-3" style={{ paddingBottom: isLast ? 0 : 16 }}>
              <View className="flex-row items-center gap-2">
                <Text
                  style={{
                    color: semantic.text.primary,
                    fontFamily: 'BeVietnamPro_700Bold',
                    fontSize: 14,
                    flex: 1,
                  }}
                  numberOfLines={1}
                >
                  {bookingStatusLabels[event.status]}
                </Text>
                <Text
                  variant="caption"
                  style={{
                    color: semantic.text.tertiary,
                    fontSize: 11,
                  }}
                >
                  {formatRelativeTime(event.at)}
                </Text>
              </View>
              {event.note && (
                <View
                  className="mt-1.5 p-2.5 rounded-lg flex-row gap-2"
                  style={{
                    backgroundColor: semantic.surface.alt,
                  }}
                >
                  <StickyNote
                    size={12}
                    color={semantic.text.tertiary}
                    strokeWidth={2.2}
                    style={{ marginTop: 2 }}
                  />
                  <Text
                    variant="caption"
                    style={{
                      color: semantic.text.secondary,
                      fontSize: 12,
                      lineHeight: 17,
                      flex: 1,
                    }}
                  >
                    {event.note}
                  </Text>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}
