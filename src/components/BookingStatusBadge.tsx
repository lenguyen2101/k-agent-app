import { View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { bookingStatusLabels, type BookingStatus } from '@/store/bookings';
import { palette } from '@/theme';

// Status pill cho booking. Màu theo stage trong pipeline:
// PENDING → slate (chờ), CONFIRMED → blue (đã tiến), DEPOSITED → sienna (midway),
// CONTRACTED → emerald light (gần xong), COMPLETED → emerald deep (thành công),
// CANCELLED → red (thất bại).

export const bookingStatusTint: Record<BookingStatus, { bg: string; fg: string; dot: string }> = {
  PENDING:    { bg: palette.slate[100],   fg: palette.slate[700],   dot: palette.slate[500] },
  CONFIRMED:  { bg: palette.blue[50],     fg: palette.blue[700],    dot: palette.blue[600] },
  DEPOSITED:  { bg: palette.sienna[50],   fg: palette.sienna[700],  dot: palette.sienna[500] },
  CONTRACTED: { bg: palette.emerald[50],  fg: palette.emerald[700], dot: palette.emerald[500] },
  COMPLETED:  { bg: palette.emerald[700], fg: palette.white,        dot: palette.white },
  CANCELLED:  { bg: palette.red[50],      fg: palette.red[600],     dot: palette.red[500] },
};

type Size = 'sm' | 'md';

type Props = {
  status: BookingStatus;
  size?: Size;
  /** Hiện dot chấm màu bên trái label */
  withDot?: boolean;
};

export function BookingStatusBadge({ status, size = 'sm', withDot = false }: Props) {
  const tint = bookingStatusTint[status];
  const padX = size === 'md' ? 10 : 8;
  const padY = size === 'md' ? 4 : 2;
  const fontSize = size === 'md' ? 12 : 11;
  return (
    <View
      className="flex-row items-center rounded-full"
      style={{
        paddingHorizontal: padX,
        paddingVertical: padY,
        backgroundColor: tint.bg,
        gap: withDot ? 5 : 0,
      }}
    >
      {withDot && (
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: tint.dot,
          }}
        />
      )}
      <Text
        variant="caption"
        style={{
          color: tint.fg,
          fontFamily: 'BeVietnamPro_700Bold',
          fontSize,
          letterSpacing: 0.3,
        }}
      >
        {bookingStatusLabels[status]}
      </Text>
    </View>
  );
}
