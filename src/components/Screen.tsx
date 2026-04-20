import { type ReactNode } from 'react';
import { SafeAreaView, useSafeAreaInsets, type Edge } from 'react-native-safe-area-context';

// Screen wrapper — standardize safe area + top breathing padding cho tab/stack screens.
// Dùng thay cho raw <SafeAreaView> để mọi screen có inset top nhất quán.
//
// Logic breathing:
// - Device có notch/Dynamic Island (inset.top ≥ 24px): breathing 8px thoáng nhẹ
// - Web / simulator no-notch / Android no notch (inset.top < 24px): breathing 16px
//   để tránh content dính status bar / edge màn hình (không có notch đẩy xuống)

type BgKind = 'surface' | 'alt' | 'transparent';

const bgClass: Record<BgKind, string> = {
  surface: 'bg-surface',
  alt: 'bg-surface-alt',
  transparent: '',
};

type Props = {
  children: ReactNode;
  edges?: readonly Edge[];
  bg?: BgKind;
  padded?: boolean;
  className?: string;
};

export function Screen({
  children,
  edges = ['top'],
  bg = 'surface',
  padded = true,
  className = '',
}: Props) {
  const insets = useSafeAreaInsets();
  const breathingTop = insets.top < 24 ? 16 : 8;

  return (
    <SafeAreaView
      edges={edges}
      className={`flex-1 ${bgClass[bg]} ${className}`.trim()}
      style={padded ? { paddingTop: breathingTop } : undefined}
    >
      {children}
    </SafeAreaView>
  );
}
