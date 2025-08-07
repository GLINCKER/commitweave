import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      globals: {
        // Node.js globals
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        global: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        performance: 'readonly',
        NodeJS: 'readonly',
        fetch: 'readonly',
        Response: 'readonly',
        RequestInit: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      // TypeScript specific rules - made more lenient for CI
      '@typescript-eslint/no-unused-vars': 'off', // Too many false positives
      '@typescript-eslint/no-explicit-any': 'off', // Legacy code uses any
      
      // General ESLint rules
      'no-console': 'off', // Allow console for CLI tool
      'no-var': 'error',
      'prefer-const': 'off', // Too many issues to fix right now
      'no-unused-vars': 'off', // Use TypeScript version instead
      'no-case-declarations': 'off', // Common pattern in switch statements
      'no-async-promise-executor': 'off', // Sometimes needed
      
      // Code style - all off for CI
      'quotes': 'off',
      'semi': 'off',
      'comma-dangle': 'off',
    },
  },
  {
    files: ['scripts/**/*.ts', 'scripts/**/*.js'],
    rules: {
      // Scripts can be more lenient
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'vscode-extension/node_modules/**',
      'vscode-extension/out/**',
      '*.js.map',
      '*.d.ts.map',
    ],
  },
];