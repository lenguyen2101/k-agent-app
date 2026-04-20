// Spacing scale — Tailwind-compatible (px values).
// Dùng cho margin, padding, gap. Match DESIGN.md §4.1.

export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
} as const;

export type SpacingKey = keyof typeof spacing;
