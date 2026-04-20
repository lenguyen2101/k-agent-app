// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-native',
              importNames: ['Text'],
              message:
                'Import Text from "@/components/ui/Text" instead. The custom Text component enforces typography variants (DESIGN.md §3.2).',
            },
          ],
        },
      ],
    },
  },
  {
    // Cho phép Text wrapper component import RNText
    files: ['src/components/ui/Text.tsx'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
]);
