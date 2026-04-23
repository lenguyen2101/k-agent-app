import type { ComponentProps } from 'react';
import { Pressable, View } from 'react-native';
import { type LucideIcon } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { palette, semantic } from '@/theme';

// Reusable empty state — dùng khi list rỗng (lead list, listings, bookings,
// notifications, transactions). 3 biến thể:
// - "info":    default, sienna soft icon — không có data yet
// - "filter":  user filter ra rỗng — slate soft icon, CTA "Xoá bộ lọc"
// - "success": action đã xong, không còn gì pending (VD: no overdue leads)
type Variant = 'info' | 'filter' | 'success';

type Props = {
  icon: LucideIcon;
  title: string;
  description?: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
  variant?: Variant;
};

const variantStyle: Record<Variant, { iconBg: string; iconFg: string }> = {
  info:    { iconBg: palette.sienna[50],  iconFg: palette.sienna[700] },
  filter:  { iconBg: palette.slate[100],  iconFg: palette.slate[600] },
  success: { iconBg: palette.emerald[50], iconFg: palette.emerald[700] },
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  ctaLabel,
  onCtaPress,
  variant = 'info',
}: Props) {
  const v = variantStyle[variant];
  return (
    <View
      className="items-center p-8 rounded-2xl"
      style={{
        backgroundColor: palette.white,
        borderWidth: 1,
        borderColor: semantic.border.light,
      }}
    >
      <View
        className="w-16 h-16 rounded-full items-center justify-center"
        style={{ backgroundColor: v.iconBg }}
      >
        <Icon size={28} color={v.iconFg} strokeWidth={1.8} />
      </View>
      <Text
        variant="body"
        style={{
          color: semantic.text.primary,
          fontFamily: 'BeVietnamPro_700Bold',
          marginTop: 14,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      {description && (
        <Text
          variant="body"
          style={{
            color: semantic.text.secondary,
            marginTop: 6,
            textAlign: 'center',
            lineHeight: 20,
            maxWidth: 280,
          }}
        >
          {description}
        </Text>
      )}
      {ctaLabel && onCtaPress && (
        <Pressable
          onPress={onCtaPress}
          className="mt-4 px-4 h-10 rounded-xl items-center justify-center"
          style={{ backgroundColor: semantic.action.primary }}
        >
          <Text
            variant="caption"
            style={{ color: palette.white, fontFamily: 'BeVietnamPro_700Bold' }}
          >
            {ctaLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

// Props type export — cho các file khác dùng (VD: config object chứa empty state props).
export type EmptyStateProps = ComponentProps<typeof EmptyState>;
