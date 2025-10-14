module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.{js,mjs}',
    '!src/encryption.js',
    '!src/encryption.mjs',
    '!src/cli/**',
    '!src/module.mjs'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'src[\\\\/]+encryption\\.js$',
    'src[\\\\/]+encryption\\.mjs$',
    'src[\\\\/]+cli[\\\\/]',
    'src[\\\\/]+module\\.mjs$'
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  testTimeout: 10000,
  forceExit: true
};
