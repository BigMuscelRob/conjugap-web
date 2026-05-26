import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({ dir: './' });

const baseConfig: Config = {
  testEnvironment:    'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch:        ['<rootDir>/src/**/*.test.{ts,tsx}'],
  coverageProvider: 'v8',
};

// nextJest generates its own transformIgnorePatterns and does not merge the
// user's value. We resolve the config then replace the patterns wholesale so
// Prisma 7's WASM runtime (.mjs files with ESM exports) gets transpiled by
// babel-jest instead of being loaded raw by Jest's CommonJS module system.
export default async (...args: Parameters<ReturnType<typeof createJestConfig>>) => {
  const cfg = await createJestConfig(baseConfig)(...args);
  cfg.transformIgnorePatterns = [
    // Allow .mjs files in node_modules (Prisma 7 WASM runtime) to be transformed
    '/node_modules/(?!.*\\.mjs$)',
    // Preserve the CSS module exclusion that nextJest adds
    '^.+\\.module\\.(css|sass|scss)$',
  ];
  return cfg;
};
