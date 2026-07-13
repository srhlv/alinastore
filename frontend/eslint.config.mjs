// @ts-check
import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [ 'eslint.config.mjs', 'dist/**' ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jasmine,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      '@stylistic/array-bracket-spacing': [ 'error', 'always' ],
      '@stylistic/computed-property-spacing': [ 'error', 'always' ],
      '@stylistic/object-curly-spacing': [ 'error', 'always' ],
      '@stylistic/space-in-parens': [ 'error', 'always', { exceptions: [ 'empty' ] } ],
      '@stylistic/template-curly-spacing': [ 'error', 'always' ],
      '@stylistic/key-spacing': [
        'error',
        {
          singleLine: {
            beforeColon: false,
            afterColon:  true,
          },
          multiLine: {
            beforeColon: false,
            afterColon:  true,
          },
          align: {
            beforeColon: false,
            afterColon:  true,
            on:          'value',
          },
        },
      ],
      '@stylistic/quotes': [ 'error', 'single', { avoidEscape: true } ],
      '@stylistic/semi': [ 'error', 'always' ],
      '@stylistic/comma-dangle': [ 'error', 'always-multiline' ],
    },
  },
);
