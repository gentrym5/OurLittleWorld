/** @type {import('jest').Config} */
const config = {
  // Use jsdom to simulate a browser environment for React component tests
  testEnvironment: 'jest-environment-jsdom',

  // Run jest.setup.ts after the test environment is set up.
  // This provides @testing-library/jest-dom matchers (toBeInTheDocument, etc.) globally.
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Transform TypeScript and TSX files with ts-jest
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          // Allow importing from node_modules that use ESM
          esModuleInterop: true,
        },
      },
    ],
  },

  // Resolve the @/ path alias that mirrors tsconfig.json "paths": { "@/*": ["./src/*"] }
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Stub CSS imports that would fail in Node
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
    // Stub static file imports
    '\\.(jpg|jpeg|png|gif|svg|ico|webp)$': '<rootDir>/__mocks__/fileMock.js',
  },

  // Collect coverage from source TypeScript files only
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],

  // Exclude Playwright E2E specs and Next.js build artifacts from Jest discovery
  testPathIgnorePatterns: ['/node_modules/', '/e2e/', '/.next/'],

  // Treat .ts and .tsx files as ESM modules when needed
  extensionsToTreatAsEsm: [],
};

module.exports = config;
