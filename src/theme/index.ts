// Public theme API — single import surface.
// Components: import { semantic, typography, spacing } from '@/theme';

export { palette } from './tokens';
export type { Palette } from './tokens';

export { semantic } from './semantic';
export type { Semantic, StatusGroup, ActionChipKind } from './semantic';

export { typography } from './typography';
export type { TextVariant, VariantStyle, FontFamily } from './typography';

export { spacing } from './spacing';
export type { SpacingKey } from './spacing';

export { radius } from './radius';
export type { RadiusKey } from './radius';

export { shadow } from './shadow';
export type { ShadowKey } from './shadow';

export { duration, easing } from './motion';
export type { DurationKey, EasingKey } from './motion';
