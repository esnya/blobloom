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
  moduleNameMapper: {
    '^https://cdn\.jsdelivr\.net/npm/d3@7/\+esm$': 'd3',
  },
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
