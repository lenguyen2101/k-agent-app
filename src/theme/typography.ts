// Source of truth typography. Phải khớp DESIGN.md §3.2.
// Min size = 12 (badge UPPERCASE only). KHÔNG được thêm variant <12px.
// fontFamily explicit (không qua fontWeight + monkey patch).

export type TextVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'section'
  | 'subtitle'
  | 'body-lg'
  | 'body'
  | 'paragraph'
  | 'label'
  | 'caption'
  | 'badge'
  | 'button'
  | 'stat';

export type FontFamily =
  | 'BeVietnamPro_400Regular'
  | 'BeVietnamPro_500Medium'
  | 'BeVietnamPro_600SemiBold'
  | 'BeVietnamPro_700Bold';

export type VariantStyle = {
  fontSize: number;
  lineHeight: number;
  fontFamily: FontFamily;
  letterSpacing?: number;
  textTransform?: 'uppercase';
};

// Rebalance 2026-04-24: giảm heading ~15-20% cho gần VN mobile app norms
// (Zalo/Momo 16-18 heading, Claude/Linear 16-18). Body/caption giữ nguyên
// (đã match Apple HIG / Material 3). Kết quả: heading vẫn luxury bold
// (700/600 weight) nhưng kích thước compact hơn, không bị "gigantic".
// Variants chính:
// - display/h1/h2/h3: heading
// - section: 13/SemiBold UPPERCASE — section title quiet eyebrow (gray), thay h3 Bold cho danh sách section trong detail screens
// - subtitle: 14/Medium — secondary text ở list row, card alt title
// - body-lg/body: UI text trong rows/cards (lineHeight chặt)
// - paragraph: 15/24 (1.6x) — long-form reading (description blocks, list items)
// - label: 13/SemiBold + letterSpacing — section header nhỏ, form label (VD "LOẠI TASK")
// - caption: meta text nhỏ
// - badge: 12 uppercase
// - button: 16/SemiBold
// - stat: 24/Bold — hero number mid-size (commission, price, count)
export const typography: Record<TextVariant, VariantStyle> = {
  display:   { fontSize: 28, lineHeight: 36, fontFamily: 'BeVietnamPro_700Bold' },
  h1:        { fontSize: 22, lineHeight: 30, fontFamily: 'BeVietnamPro_700Bold' },
  h2:        { fontSize: 19, lineHeight: 26, fontFamily: 'BeVietnamPro_600SemiBold' },
  h3:        { fontSize: 17, lineHeight: 24, fontFamily: 'BeVietnamPro_600SemiBold' },
  section:   { fontSize: 13, lineHeight: 18, fontFamily: 'BeVietnamPro_600SemiBold', letterSpacing: 0.5, textTransform: 'uppercase' },
  subtitle:  { fontSize: 14, lineHeight: 20, fontFamily: 'BeVietnamPro_500Medium' },
  'body-lg': { fontSize: 16, lineHeight: 24, fontFamily: 'BeVietnamPro_400Regular' },
  body:      { fontSize: 15, lineHeight: 22, fontFamily: 'BeVietnamPro_400Regular' },
  paragraph: { fontSize: 15, lineHeight: 24, fontFamily: 'BeVietnamPro_400Regular' },
  label:     { fontSize: 13, lineHeight: 18, fontFamily: 'BeVietnamPro_600SemiBold', letterSpacing: 0.3 },
  caption:   { fontSize: 13, lineHeight: 19, fontFamily: 'BeVietnamPro_400Regular' },
  badge:     { fontSize: 12, lineHeight: 17, fontFamily: 'BeVietnamPro_600SemiBold', letterSpacing: 0.4, textTransform: 'uppercase' },
  button:    { fontSize: 16, lineHeight: 24, fontFamily: 'BeVietnamPro_600SemiBold' },
  stat:      { fontSize: 24, lineHeight: 30, fontFamily: 'BeVietnamPro_700Bold' },
} as const;

