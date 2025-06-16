export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: 'tsconfig.test.json', useESM: true }],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^(?:\\.{2}/)+server/(.*)$': '<rootDir>/src/server/$1.ts',
  },
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
  testTimeout: 10000,
  collectCoverage: true,
  collectCoverageFrom: [
    'src/client/**/*.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      lines: 80,
    },
  },
};
