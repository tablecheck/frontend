const path = require('path');

const systemSettings = require('@tablecheck/scripts-utils/userConfig');

const customTestPath = systemSettings.setupTests || false;

module.exports = (resolve, rootDir, srcRoots, moduleDirectories) => {
  // Use this instead of `paths.testsSetup` to avoid putting
  // an absolute filename into configuration after ejecting.
  const setupTestsFile = customTestPath
    ? `<rootDir>/${path.relative(rootDir, customTestPath)}`
    : resolve('config/setupTests.js');

  const toRelRootDir = (f) => `<rootDir>/${path.relative(rootDir || '', f)}`;

  const config = {
    collectCoverageFrom: srcRoots.map((root) =>
      path.join(path.relative(rootDir, root), '**/*.{ts,tsx,js,jsx}')
    ),
    reporters: [
      'default',
      [
        'jest-junit',
        { outputDirectory: path.join(rootDir, 'junit'), outputName: 'jest.xml' }
      ]
    ],
    setupFiles: [resolve('config/jest/setup.js')],
    setupFilesAfterEnv: [setupTestsFile],
    snapshotSerializers: ['@emotion/jest/serializer'],
    testMatch: [
      '**/__tests__/**/*.{ts,tsx,js,jsx}',
      '**/__tests__/*.{ts,tsx,js,jsx}',
      '**/?(*.)(spec|test).{ts,tsx,js,jsx}'
    ],
    watchPlugins: [
      'jest-watch-typeahead/filename',
      'jest-watch-typeahead/testname'
    ],
    // where to search for files/tests
    roots: srcRoots.map(toRelRootDir),
    testEnvironment: 'node',
    testURL: 'http://localhost',
    transform: {
      '^.+\\.(ts|tsx|js|jsx|cjs|mjs)$': resolve(
        'config/jest/babelTransform.js'
      ),
      '^.+\\.css$': resolve('config/jest/cssTransform.js'),
      '^.+\\.(gql|graphql)$': require.resolve('jest-transform-graphql'),
      '^(?!.*\\.(ts|tsx|js|jsx|cjs|mjs|css|json)$)': resolve(
        'config/jest/fileTransform.js'
      )
    },
    transformIgnorePatterns: [
      '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|cjs|ts|tsx)$',
      '^.+\\.module\\.(css|sass|scss)$'
    ],
    moduleNameMapper: {
      '^.+\\.module\\.css$': 'identity-obj-proxy'
    },
    moduleFileExtensions: [
      'web.js',
      'js',
      'ts',
      'json',
      'web.jsx',
      'jsx',
      'tsx',
      'node',
      'mjs'
    ],
    moduleDirectories,
    coverageReporters: ['lcov', 'text', 'json-summary'],
    coveragePathIgnorePatterns: [
      '/node_modules/',
      '/__fixtures__/',
      '.fixture.jsx',
      '.fixture.js',
      '.fixture.tsx',
      '.fixture.ts',
      '/__setup__/',
      '.setup.jsx',
      '.setup.js',
      '.setup.tsx',
      '.setup.ts',
      '/__mocks__/',
      '.mock.jsx',
      '.mock.js',
      '.mock.tsx',
      '.mock.ts'
    ]
  };
  if (rootDir) {
    config.rootDir = rootDir;
  }

  return config;
};
