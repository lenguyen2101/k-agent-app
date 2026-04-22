// Tier 1 — raw color primitives.
// Chỉ chứa hex literal. KHÔNG semantic. Tier 2 (semantic.ts) alias từ đây.
// Khi cần shade mới: thêm vào palette, không hard-code ở screen.

export const palette = {
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',

  // Neutral — surface + border. Light side (slate) vẫn giữ cho white surface.
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },

  // Neutral dark anchor — Obsidian (ink black → charcoal brown).
  // Dùng cho dark hero bg, dark card, text.primary thay slate 900 khi muốn warm tone.
  // 950 là jet black gần đen tuyệt đối; 900 charcoal warm; 50 cream paper.
  obsidian: {
    50:  '#F7F3ED',  // cream paper — text on dark, subtle contrast bg
    100: '#EDE5DA',
    200: '#C9BDAD',
    300: '#8F8173',
    400: '#4A3F36',  // warm coffee — divider on dark
    500: '#2E251F',  // espresso — card on dark bg
    600: '#221A15',
    700: '#1C1714',  // charcoal brown — hero bg, surface dark
    800: '#120E0B',
    900: '#0A0908',  // ink black — deepest fill, text inverse ground
    950: '#050404',
  },

  // Brand — Claude Sienna (burnt sienna → rust → mahogany → obsidian).
  // 500 (#C8603C) là BASE brand identity. Gradient 4-stop cho hero/immersive,
  // 2-stop subtle cho CTA depth.
  sienna: {
    50:  '#FBF2ED',  // soft bg brand
    100: '#F5DFD1',
    200: '#EBBFA4',
    300: '#DE9A78',
    400: '#D27B56',
    500: '#C8603C',  // BASE — Claude sienna
    600: '#A64A2A',  // rust — hover
    700: '#7A2F16',  // mahogany — deep anchor
    800: '#4F1E0E',
    900: '#3D1508',  // obsidian sienna — darkest stop, gradient anchor
    950: '#1F0A03',
  },

  // Status / urgency
  blue: {
    50: '#eff6ff',
    600: '#2563eb',
    700: '#1d4ed8',
  },
  emerald: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
  },
  green: {
    50: '#f0fdf4',
    600: '#16a34a',
  },
  // Urgency crimson — decoupled khỏi brand sienna.
  // E5484D (Radix crimson 9) contrast tốt trên cả white và obsidian dark.
  red: {
    50:  '#FEF2F3',
    100: '#FEE2E4',
    500: '#E5484D',
    600: '#D32F33',
  },
  sky: {
    50: '#e0f2fe',
    600: '#0284c7',
  },
  // Accent violet / purple cho OneHub-style "Giao dịch" chip.
  violet: {
    50:  '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6',
    600: '#7C3AED',
    700: '#6D28D9',
  },
} as const;

export type Palette = typeof palette;
