import { palette } from './tokens';

// Tier 2 — semantic aliases. Map use case → palette token.
// KHÔNG hex literal ở đây — luôn reference palette.
// Khi đổi brand/scheme: chỉ sửa file này, screens không đụng.

export const semantic = {
  surface: {
    // Light-side: white default. 60-30-10 rule — white chiếm 60%.
    background: palette.white,
    card: palette.white,
    nav: palette.white,
    sticky: palette.white,
    alt: palette.slate[50],
    hover: palette.slate[100],

    // Dark anchor: obsidian 700 (charcoal brown) cho hero/stats bg.
    // 900 ink cho modal overlay, 500 espresso cho card on dark.
    dark: palette.obsidian[700],
    darkAccent: palette.obsidian[500],
    darkDeep: palette.obsidian[900],
    overlay: 'rgba(10, 9, 8, 0.55)',

    brandSoft: palette.sienna[50],
  },

  text: {
    primary: palette.obsidian[900],
    secondary: palette.obsidian[400],
    tertiary: palette.obsidian[300],
    inverse: palette.obsidian[50],      // cream, không white tuyệt đối → warm
    onDark: palette.obsidian[50],
    onDarkSoft: palette.obsidian[200],
  },

  border: {
    default: palette.slate[200],
    light: palette.slate[100],
    strong: palette.slate[300],
    dark: palette.obsidian[500],
    focus: palette.sienna[500],
  },

  // Brand identity = Claude sienna. CTA solid 500 + gradient cho moment quan trọng.
  // 1 primary CTA per screen (DESIGN §0).
  action: {
    primary: palette.sienna[500],
    primaryHover: palette.sienna[600],
    primarySoft: palette.sienna[50],
    primaryDeep: palette.sienna[700],
    dark: palette.obsidian[900],
    darkHover: palette.obsidian[700],
  },

  status: {
    success: palette.green[600],
    successBg: palette.green[50],
    warning: palette.sienna[600],       // warning dùng sienna deep (warm), không amber
    warningBg: palette.sienna[50],
    error: palette.red[600],
    errorBg: palette.red[100],
    info: palette.sky[600],
    infoBg: palette.sky[50],
  },

  // Urgency — DECOUPLED khỏi brand. Dùng cho NEW lead, notification unread,
  // overdue indicator. Crimson = "cần action ngay", sienna = "K-Agent identity".
  urgency: {
    fg: palette.red[600],
    bg: palette.red[50],
    dot: palette.red[500],
  },

  leadGroup: {
    new:       { bg: palette.red[50],      fg: palette.red[600],     dot: palette.red[500] },
    engaged:   { bg: palette.blue[50],     fg: palette.blue[700],    dot: palette.blue[600] },
    midfunnel: { bg: palette.sienna[50],   fg: palette.sienna[700],  dot: palette.sienna[600] },
    closing:   { bg: palette.emerald[50],  fg: palette.emerald[700], dot: palette.emerald[500] },
    won:       { bg: palette.emerald[700], fg: palette.white,        dot: palette.white },
    ended:     { bg: palette.slate[100],   fg: palette.slate[600],   dot: palette.slate[400] },
  },

  actionChip: {
    priority:  { bg: palette.red[50],     fg: palette.red[600] },
    offer:     { bg: palette.green[50],   fg: palette.emerald[700] },
    deal:      { bg: palette.violet[50],  fg: palette.violet[700] },
    network:   { bg: palette.blue[50],    fg: palette.blue[700] },
  },

  gradient: {
    heroBrand:    [palette.sienna[900], palette.sienna[700], palette.sienna[500], palette.sienna[400]] as readonly [string, string, string, string],
    heroDark:     [palette.obsidian[900], palette.obsidian[700], palette.obsidian[500]] as readonly [string, string, string],
    statCardSoft: [palette.sienna[50], palette.white] as readonly [string, string],
    cta:          [palette.sienna[500], palette.sienna[700]] as readonly [string, string],
    ctaDark:      [palette.obsidian[700], palette.obsidian[900]] as readonly [string, string],
  },
} as const;

export type Semantic = typeof semantic;
export type StatusGroup = keyof Semantic['leadGroup'];
export type ActionChipKind = keyof Semantic['actionChip'];
