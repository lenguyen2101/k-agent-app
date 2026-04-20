// NativeWind v4 không parse trực tiếp tailwind.config.ts → dùng jiti
// để load TypeScript theme từ src/theme. Source of truth = src/theme.
// Import từ subpath cụ thể (không qua index.ts) để tránh kéo theo
// shadow.ts/motion.ts có react-native dep mà jiti không parse được.
const jiti = require('jiti')(__filename);
const { palette } = jiti('./src/theme/tokens');
const { semantic } = jiti('./src/theme/semantic');
const { radius } = jiti('./src/theme/radius');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: semantic.action.primary,
          hover: semantic.action.primaryHover,
          soft: semantic.action.primarySoft,
          deep: semantic.action.primaryDeep,
        },
        text: {
          primary: semantic.text.primary,
          secondary: semantic.text.secondary,
          tertiary: semantic.text.tertiary,
          inverse: semantic.text.inverse,
          'on-dark': semantic.text.onDark,
          'on-dark-soft': semantic.text.onDarkSoft,
        },
        surface: {
          DEFAULT: semantic.surface.background,
          card: semantic.surface.card,
          nav: semantic.surface.nav,
          alt: semantic.surface.alt,
          hover: semantic.surface.hover,
          dark: semantic.surface.dark,
          'dark-accent': semantic.surface.darkAccent,
          'dark-deep': semantic.surface.darkDeep,
          'brand-soft': semantic.surface.brandSoft,
        },
        border: {
          DEFAULT: semantic.border.default,
          light: semantic.border.light,
          strong: semantic.border.strong,
          dark: semantic.border.dark,
          focus: semantic.border.focus,
        },
        status: {
          success: semantic.status.success,
          'success-bg': semantic.status.successBg,
          warning: semantic.status.warning,
          'warning-bg': semantic.status.warningBg,
          error: semantic.status.error,
          'error-bg': semantic.status.errorBg,
          info: semantic.status.info,
          'info-bg': semantic.status.infoBg,
        },
        urgency: {
          DEFAULT: semantic.urgency.fg,
          bg: semantic.urgency.bg,
          dot: semantic.urgency.dot,
        },
        slate: palette.slate,
        obsidian: palette.obsidian,
        sienna: palette.sienna,
        violet: palette.violet,
      },
      borderRadius: {
        xs: `${radius.xs}px`,
        sm: `${radius.sm}px`,
        md: `${radius.md}px`,
        lg: `${radius.lg}px`,
        xl: `${radius.xl}px`,
        '2xl': `${radius['2xl']}px`,
      },
    },
  },
  plugins: [],
};
