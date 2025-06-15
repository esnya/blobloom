export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: 'tsconfig.json', useESM: true }],
  },
  moduleNameMapper: {},
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/math.ts',
    'src/client/**/*.{ts,tsx}',
    '!src/client/components/CommitLog.tsx',
    '!src/client/index.tsx',
  ],
  coverageThreshold: {
    global: {
      lines: 60,
    },
  },
};
