import { Text as RNText, type TextProps } from 'react-native';
import { typography, type TextVariant } from '@/theme';

export type AppTextProps = TextProps & {
  variant?: TextVariant;
};

export function Text({ variant = 'body-lg', style, ...rest }: AppTextProps) {
  return <RNText {...rest} style={[typography[variant], style]} />;
}
