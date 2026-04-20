// Motion tokens — durations + easing curves.
// Match DESIGN.md §9. Dùng với react-native-reanimated hoặc Animated.timing.

export const duration = {
  instant: 150,  // tap feedback, press state
  default: 250,  // most transitions
  hero: 400,     // hero/page transitions
} as const;

// Cubic-bezier control points. RN-Reanimated: Easing.bezier(...args).
// CSS: cubic-bezier(...) cho web build.
export const easing = {
  // ease-out cubic — enter/expand
  enter: [0.33, 1, 0.68, 1] as const,
  // ease-in cubic — exit/collapse
  exit: [0.32, 0, 0.67, 0] as const,
  // ease-in-out cubic — neutral
  inOut: [0.65, 0, 0.35, 1] as const,
} as const;

export type DurationKey = keyof typeof duration;
export type EasingKey = keyof typeof easing;
