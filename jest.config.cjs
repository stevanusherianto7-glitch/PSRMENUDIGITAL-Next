module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    '<rootDir>/src/lib/**/*.{ts,tsx}',
    '!<rootDir>/src/lib/client.ts',
    '!<rootDir>/src/lib/server.ts',
  ],
  coverageThreshold: {
    './src/lib/': {
      lines: 100,
      branches: 100,
      functions: 100,
      statements: 100,
    },
  },
};
