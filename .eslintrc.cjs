module.exports = {
  root: true,
  extends: ['next/core-web-vitals', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  ignorePatterns: ['node_modules/', '.next/', '.test-dist/', 'coverage/', 'out/', 'build/'],
  rules: {
    'no-literal-app-routes': 'error',
    'server-action-form-must-use-form-submit-button': 'error',
    '@typescript-eslint/ban-ts-comment': [
      'error',
      {
        'ts-check': false,
        'ts-expect-error': 'allow-with-description',
        'ts-ignore': true,
        'ts-nocheck': true,
      },
    ],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    'no-console': ['error', { allow: ['error', 'info', 'warn'] }],
  },
  overrides: [
    {
      files: ['src/app/**/*.tsx'],
      excludedFiles: ['src/app/dev/auth-admin/page.tsx'],
      rules: {
        'app-page-must-delegate-screen': 'error',
      },
    },
    {
      files: ['src/app/dev/auth-admin/page.tsx'],
      rules: {
        'server-action-form-must-use-form-submit-button': 'error',
      },
    },
    {
      files: ['src/features/navigation/components/**/*.tsx', 'src/features/shell/components/**/*.tsx'],
      excludedFiles: ['src/features/navigation/components/TrackedLink.tsx'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [
              {
                name: 'next/link',
                message: 'Use TrackedLink for persistent navigation surfaces.',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['src/features/navigation/routes.ts'],
      rules: {
        'no-literal-app-routes': 'off',
      },
    },
    {
      files: ['src/lib/prisma.ts'],
      rules: {
        'no-var': 'off',
      },
    },
  ],
}
