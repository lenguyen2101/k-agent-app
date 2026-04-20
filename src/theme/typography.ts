// Source of truth typography. Phải khớp DESIGN.md §3.2.
// Min size = 12 (badge UPPERCASE only). KHÔNG được thêm variant <12px.
// fontFamily explicit (không qua fontWeight + monkey patch).

export type TextVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body-lg'
  | 'body'
  | 'caption'
  | 'badge'
  | 'button';

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

export const typography: Record<TextVariant, VariantStyle> = {
  display:   { fontSize: 32, lineHeight: 45, fontFamily: 'BeVietnamPro_700Bold' },
  h1:        { fontSize: 28, lineHeight: 40, fontFamily: 'BeVietnamPro_700Bold' },
  h2:        { fontSize: 22, lineHeight: 32, fontFamily: 'BeVietnamPro_600SemiBold' },
  h3:        { fontSize: 18, lineHeight: 26, fontFamily: 'BeVietnamPro_600SemiBold' },
  'body-lg': { fontSize: 16, lineHeight: 24, fontFamily: 'BeVietnamPro_400Regular' },
  body:      { fontSize: 15, lineHeight: 22, fontFamily: 'BeVietnamPro_400Regular' },
  caption:   { fontSize: 13, lineHeight: 19, fontFamily: 'BeVietnamPro_400Regular' },
  badge:     { fontSize: 12, lineHeight: 17, fontFamily: 'BeVietnamPro_600SemiBold', letterSpacing: 0.4, textTransform: 'uppercase' },
  button:    { fontSize: 16, lineHeight: 24, fontFamily: 'BeVietnamPro_600SemiBold' },
} as const;

