import { type ReactNode } from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Handshake, Home, Sparkles, type LucideIcon } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { palette, semantic } from '@/theme';

// Gradient frame wrapper + top ribbon label — dùng để highlight card quan
// trọng trong list (VD lead status=NEW / APPOINTMENT / NEGOTIATING).
// Tham khảo pattern HouseNow "Trực tiếp từ chủ đầu tư" card.
//
// 3 variant theo hành động cần làm:
// - priority: sienna (brand warm urgency — cần gọi/nhắn khách mới)
// - offer: emerald (ready to schedule viewing — khách đã hẹn xem)
// - deal: violet (closing deal — đàm phán/cọc/ký HĐ)

export type FrameVariant = 'priority' | 'offer' | 'deal';

type VariantConfig = {
  icon: LucideIcon;
  label: string;
  frameColors: readonly [string, string, string, string];
  ribbonColors: readonly [string, string];
  shadowColor: string;
};

const CONFIG: Record<FrameVariant, VariantConfig> = {
  priority: {
    icon: Sparkles,
    label: 'ƯU TIÊN',
    frameColors: [palette.sienna[400], palette.sienna[300], palette.sienna[200], palette.sienna[400]],
    ribbonColors: [palette.sienna[500], palette.sienna[700]],
    shadowColor: palette.sienna[500],
  },
  offer: {
    icon: Home,
    label: 'ĐỀ NGHỊ XEM NHÀ',
    frameColors: [palette.emerald[400], palette.emerald[300], palette.emerald[200], palette.emerald[400]],
    ribbonColors: [palette.emerald[600], palette.emerald[700]],
    shadowColor: palette.emerald[500],
  },
  deal: {
    icon: Handshake,
    label: 'GIAO DỊCH',
    frameColors: [palette.violet[500], palette.violet[400], palette.violet[300], palette.violet[500]],
    ribbonColors: [palette.violet[600], palette.violet[700]],
    shadowColor: palette.violet[600],
  },
};

type Props = {
  children: ReactNode;
  variant?: FrameVariant;
};

export function PriorityFrame({ children, variant = 'priority' }: Props) {
  const cfg = CONFIG[variant];
  const Icon = cfg.icon;

  return (
    <View style={{ position: 'relative', paddingTop: 10 }}>
      {/* Gradient border — 4-stop nhạt để shimmer feel subtle */}
      <LinearGradient
        colors={[...cfg.frameColors]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 18,
          padding: 2,
          shadowColor: cfg.shadowColor,
          shadowOpacity: 0.12,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 3,
        }}
      >
        <View
          style={{
            borderRadius: 16,
            backgroundColor: semantic.surface.card,
            overflow: 'hidden',
          }}
        >
          {children}
        </View>
      </LinearGradient>

      {/* Top ribbon label — sit half above, half on frame border */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 14,
          zIndex: 10,
        }}
      >
        <LinearGradient
          colors={[...cfg.ribbonColors]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingHorizontal: 9,
            paddingVertical: 3,
            borderRadius: 10,
            shadowColor: cfg.shadowColor,
            shadowOpacity: 0.25,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
            elevation: 3,
          }}
        >
          <Icon size={11} color={palette.white} strokeWidth={2.4} />
          <Text
            style={{
              color: palette.white,
              fontFamily: 'BeVietnamPro_700Bold',
              fontSize: 10,
              lineHeight: 14,
              letterSpacing: 0.8,
            }}
          >
            {cfg.label}
          </Text>
        </LinearGradient>
      </View>
    </View>
  );
}
