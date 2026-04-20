import { Platform } from 'react-native';
import { palette } from './tokens';

// Dual-layer shadow tokens — RN compatible.
// iOS: shadowColor/Offset/Opacity/Radius (React Native renders 1 layer per View;
//      ta combine 2 layer bằng cách wrap View ngoài cho ambient + key).
// Android: elevation (Material design depth).
//
// Helper `shadow.md` trả về 1 style object áp được cho View.
// Khi cần dual-layer: stack 2 View với 2 shadow tokens.

const SHADOW_COLOR = palette.slate[900];

const buildShadow = (
  offsetY: number,
  blur: number,
  opacity: number,
  elevation: number
) => ({
  ...Platform.select({
    ios: {
      shadowColor: SHADOW_COLOR,
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: blur,
    },
    android: {
      elevation,
    },
    default: {
      shadowColor: SHADOW_COLOR,
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: blur,
    },
  }),
});

export const shadow = {
  none: {},
  sm: buildShadow(1, 2, 0.05, 1),    // subtle separator
  md: buildShadow(4, 8, 0.08, 3),    // card resting
  lg: buildShadow(10, 20, 0.10, 6),  // popover, dropdown
  xl: buildShadow(20, 40, 0.15, 12), // modal sheet, FAB

  // Dual-layer variants — apply trên 2 View lồng nhau (outer = ambient, inner = key).
  // Reference: Material Design elevation overlays.
  dual: {
    md: {
      ambient: buildShadow(1, 2, 0.04, 0),
      key: buildShadow(4, 6, 0.10, 3),
    },
    lg: {
      ambient: buildShadow(2, 4, 0.04, 0),
      key: buildShadow(8, 16, 0.12, 6),
    },
  },
} as const;

export type ShadowKey = keyof typeof shadow;
