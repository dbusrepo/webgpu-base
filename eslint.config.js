import path from 'path';
import { fileURLToPath } from 'url';
import brettz9 from '@brettz9/eslint-plugin';
import { includeIgnoreFile } from '@eslint/compat';
import pluginJs from '@eslint/js';
import typescriptEslintParser from '@typescript-eslint/parser';
import eslintConfigPrettier from 'eslint-config-prettier';
import * as depend from 'eslint-plugin-depend';
import github from 'eslint-plugin-github';
import html from 'eslint-plugin-html';
import pluginJsxA11y from 'eslint-plugin-jsx-a11y';
import pluginNoRelativeImports from 'eslint-plugin-no-relative-import-paths';
import pluginPrettier from 'eslint-plugin-prettier';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import sonarjs from 'eslint-plugin-sonarjs';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
// import eslintConfigPreact from 'eslint-config-preact'; // TODO
import pluginUnusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { chunkSplitPlugin } from 'vite-plugin-chunk-split';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, '.gitignore');

/** @type {import('eslint').Linter.Config[]} */
export default [
  includeIgnoreFile(gitignorePath),
  {
    ignores: [
      'vite.config.ts',
      'eslint.config.js',
      'src/vite-env.d.ts',
      'commitlint.config.js',
      'src/engine/wasmEngine/wasm',
      'src/ui/guify',
      'src/engine/assets/images/vivaxy-png',
      'src/app/pointerlock.js', // TODO
    ],
  },
  { files: ['**/*.{html,js,mjs,cjs,ts,jsx,tsx}'] },
  pluginJs.configs.recommended,
  // ...tseslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  // ...fixupConfigRules(eslintConfigPreact),
  depend.configs['flat/recommended'],
  github.getFlatConfigs().browser,
  github.getFlatConfigs().recommended,
  github.getFlatConfigs().react,
  ...github.getFlatConfigs().typescript,
  sonarjs.configs.recommended,
  // see https://github.com/sindresorhus/eslint-plugin-unicorn/issues/2546
  // eslintPluginUnicorn.configs.recommended,
  eslintPluginUnicorn.configs['flat/recommended'],
  eslintConfigPrettier,
  eslintPluginPrettierRecommended,
  {
    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        node: {
          paths: ['src'],
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: { project: ['tsconfig.json'] },
      globals: {
        ...globals.node,
        ...globals.amd,
        ...globals.browser,
        ...globals.worker,
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
  {
    plugins: {
      'jsx-a11y': pluginJsxA11y,
      'no-relative-import-paths': pluginNoRelativeImports,
      'unused-imports': pluginUnusedImports,
      brettz9,
      html,
      prettier: pluginPrettier,
      chunkSplitPlugin: chunkSplitPlugin(),
    },
    rules: {
      // 'eslintComments/no-use': ['error', { allow: [] }],
      'sonarjs/no-unused-vars': 'off',
      'sonarjs/unused-import': 'warn',
      'sonarjs/todo-tag': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/better-regex': 'warn',
      'unicorn/consistent-function-scoping': 'off',
      'unicorn/filename-case': [
        'error',
        {
          cases: {
            camelCase: true,
            pascalCase: true,
          },
        },
      ],
      'github/filenames-match-regex': [
        'error',
        '^([a-z0-9]+)([A-Z][a-z0-9]+)*$',
      ],
      // "depend/ban-dependencies": "error",
      // 'github/array-foreach': 'error',
      // 'github/async-preventdefault': 'warn',
      // 'github/no-then': 'error',
      // 'github/no-blur': 'error',
      ...eslintConfigPrettier.rules,
      'prettier/prettier': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'warn',
      '@typescript-eslint/no-empty-function': 'error',
      '@typescript-eslint/no-empty-interface': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-useless-escape': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-vars': [
        'off',
        { ignoreRestSiblings: true },
      ],
      '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      'array-callback-return': 'warn',
      eqeqeq: ['warn', 'smart'],
      curly: ['error', 'all'],
      complexity: ['warn', 35],
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      'no-console': ['off', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      // 'no-duplicate-imports': 0,
      'no-nested-ternary': 'warn',
      'no-relative-import-paths/no-relative-import-paths': [
        'off',
        { allowSameFolder: true, rootDir: 'src' },
      ],
      'no-unused-vars': 'off',
      'no-unneeded-ternary': 'warn',
      'require-await': 'warn',
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/display-name': 0,
      'react/prop-types': 'off',
      'react/require-default-props': 'off',
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/anchor-is-valid': 'warn',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/no-autofocus': 'warn',
      // 'prettier/prettier': 'warn',
      // 'import/no-unresolved': 'error',
      // 'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
      // 'no-shadow': 'off',
      // 'max-classes-per-file': ['off', 1],
      // camelcase: 'off',
      // 'lines-between-class-members': 'off',
      // 'no-unused-vars': 'off',
      // 'no-bitwise': 'off',
      // 'no-plusplus': 'off',
      // 'no-multi-assign': 'off',
      // 'prefer-const': 'off',
      // 'prefer-template': 'off',
      // 'one-var': 'off',
      // 'no-restricted-globals': 'off',
      // 'no-use-before-define': 'off',
      // 'no-restricted-syntax': [0, 'ForOfStatement'],
      // 'no-underscore-dangle': 'off',
      // 'no-empty': 'off',
      // 'no-empty-function': 'off',
      // 'no-loop-func': 'off',
      // 'no-prototype-builtins': 'off',
      // 'class-methods-use-this': 'off',
      // 'no-param-reassign': 'off',
      // 'no-lone-blocks': 'off',
      // 'import/no-mutable-exports': 'off',
      // 'import/no-cycle': 'off',
      // 'import/prefer-default-export': 'off',
      // 'react/jsx-filename-extension': [
      //   2,
      //   { extensions: ['.tsx', '.ts', '.js', '.jsx'] },
      // ],
      // 'react/jsx-props-no-spreading': 'off',
      // 'react/destructuring-assignment': 'off',
      // 'react/sort-comp': 'off',
      // semi: [2, 'always'],
      // 'max-len': ['warn', { code: 80, ignoreComments: true }],
      // 'no-console': 'off',
      // 'no-return-assign': 'off',
      // 'no-unused-expressions': 'off',
      // 'import/extensions': [
      //   'error',
      //   'ignorePackages',
      //   {
      //     js: 'never',
      //     jsx: 'never',
      //     ts: 'never',
      //     tsx: 'never',
      //     mjs: 'never',
      //   },
      // ],
      // '@typescript-eslint/indent': ['off'],
      // '@typescript-eslint/no-unused-vars': 'off',
      // '@typescript-eslint/no-explicit-any': 'off',
      // '@typescript-eslint/no-empty-interface': 'off',
      // '@typescript-eslint/no-empty-function': 'off',
      // '@typescript-eslint/no-non-null-assertion': 'off',
      // '@typescript-eslint/no-inferrable-types': 'warn',
      // '@typescript-eslint/no-this-alias': 'off',
      // '@typescript-eslint/no-shadow': ['error'],
      // '@typescript-eslint/ban-ts-comment': 'off',
      // '@typescript-eslint/lines-between-class-members': 'off',
    },
  },
];
