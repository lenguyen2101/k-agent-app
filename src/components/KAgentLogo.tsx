import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { Text } from '@/components/ui/Text';
import { palette, semantic } from '@/theme';

// K-Agent logo — SVG mark designed theo brand language:
// - Squircle sienna gradient (iOS app icon shape, rx = 24/100 viewBox)
// - Bold geometric K letterform, stroke rounded caps (modern SaaS vibe)
// - 4-point spark ở góc trên phải = accent "AI 60s · Grab-style allocation",
//   match Sparkles motif trong Splash + Onboarding.

type Props = {
  size?: number;            // width/height (square)
  variant?: 'icon' | 'full'; // full = icon + "K-Agent" text dưới
  showSpark?: boolean;      // ẩn spark nếu muốn minimal
};

export function KAgentLogo({ size = 96, variant = 'icon', showSpark = true }: Props) {
  const icon = <KIcon size={size} showSpark={showSpark} />;

  if (variant === 'icon') return icon;

  return (
    <View style={{ alignItems: 'center' }}>
      {icon}
      <Text
        style={{
          color: semantic.action.primaryDeep,
          fontFamily: 'BeVietnamPro_700Bold',
          fontSize: Math.round(size * 0.36),
          lineHeight: Math.round(size * 0.42),
          marginTop: size * 0.12,
          letterSpacing: 0.5,
        }}
      >
        K-Agent
      </Text>
    </View>
  );
}

function KIcon({ size, showSpark }: { size: number; showSpark: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="kAgentBg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={palette.sienna[900]} />
          <Stop offset="0.35" stopColor={palette.sienna[700]} />
          <Stop offset="0.75" stopColor={palette.sienna[500]} />
          <Stop offset="1" stopColor={palette.sienna[400]} />
        </LinearGradient>
      </Defs>

      {/* Squircle background */}
      <Rect x="0" y="0" width="100" height="100" rx="24" ry="24" fill="url(#kAgentBg)" />

      {/* K letterform — filled geometric shape (bold custom mark) */}
      <Path
        d="M18 14 L36 14 L36 44 L62 14 L82 14 L52 50 L88 86 L66 86 L36 56 L36 86 L18 86 Z"
        fill={palette.white}
      />

      {/* 4-point spark ở góc trên phải — accent */}
      {showSpark && (
        <Path
          d="M84 14 L86 22 L94 24 L86 26 L84 34 L82 26 L74 24 L82 22 Z"
          fill={palette.white}
          opacity={0.95}
        />
      )}
    </Svg>
  );
}
