export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: 'tsconfig.json',
    },
  },
  moduleNameMapper: {},
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/utils.ts',
    'src/client/**/*.ts',
    '!src/client/index.ts',
  ],
  coverageThreshold: {
    global: {
      lines: 80,
    },
  },
};
