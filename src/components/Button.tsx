import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { palette, semantic } from '@/theme';
import { Text } from '@/components/ui/Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'dark' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

const base = 'flex-row items-center justify-center rounded-md overflow-hidden';
const sizes: Record<Size, string> = {
  sm: 'px-3 h-9 gap-1.5',
  md: 'px-4 h-11 gap-2',
  lg: 'px-5 h-13 gap-2',
};

// `primary` dùng gradient bronze 2-stop (top→bottom subtle depth).
// `dark` solid slate-900 cho contrast CTA (vd "NHẬN LEAD" trên LeadOffer bg).
const variants: Record<Variant, { bg: string; text: string; gradient?: boolean }> = {
  primary: { bg: '', text: 'text-white', gradient: true },
  secondary: { bg: 'bg-white border border-text-primary', text: 'text-text-primary' },
  ghost: { bg: 'bg-transparent', text: 'text-primary-deep' },
  dark: { bg: 'bg-text-primary', text: 'text-white' },
  destructive: { bg: 'bg-status-error', text: 'text-white' },
};

export type ButtonProps = PressableProps & {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  fullWidth,
  leftIcon,
  className,
  ...rest
}: ButtonProps) {
  const v = variants[variant];
  const isDisabled = disabled || loading;
  return (
    <Pressable
      disabled={isDisabled}
      className={`${base} ${sizes[size]} ${v.bg} ${fullWidth ? 'w-full' : ''} ${className ?? ''}`}
      style={({ pressed }) => ({ opacity: isDisabled ? 0.4 : pressed ? 0.85 : 1 })}
      {...rest}
    >
      {v.gradient && (
        <LinearGradient
          colors={[...semantic.gradient.cta]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'dark' ? palette.white : semantic.action.primary} />
      ) : (
        <>
          {leftIcon}
          <Text variant="button" className={v.text}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}
