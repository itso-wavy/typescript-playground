import js from '@eslint/js';
import babelParser from '@babel/eslint-parser';

export default [
  {
    ignores: ['dist/', 'node_modules/', 'coverage/', 'playwright-report/', 'test-results/'],
  },
  js.configs.recommended,
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: {
        process: 'readonly', console: 'readonly', Buffer: 'readonly',
        URL: 'readonly', fetch: 'readonly', setTimeout: 'readonly',
      },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          babelrc: false,
          configFile: false,
          parserOpts: {
            plugins: ['jsx', 'typescript'],
          },
        },
      },
    },
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off',
    },
  },
];
