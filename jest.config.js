/* eslint-disable no-undef */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageReporters: ['text', 'html'],
  coverageDirectory: '<rootDir>/coverage/',
  verbose: true,
  testRegex: './tests/.*.ts$',
  testPathIgnorePatterns: ['/node_modules/', './src/tests/db.ts']
}
