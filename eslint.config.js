const nextConfig = require('eslint-config-next/core-web-vitals');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/out/**',
      '**/build/**',
      '**/dist/**',
      '**/storybook-static/**',
      '**/out_publish/**',
      '**/coverage/**',
      '**/.netlify/**',
      '**/.vercel/**',
    ],
  },
  ...nextConfig,
  prettierConfig,
  {
    rules: {
      // Add any custom rules here
    },
  },
];
