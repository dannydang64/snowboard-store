// Jest configuration
module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Test files pattern
  testMatch: ['**/specs/**/*.test.js'],
  
  // Test timeout
  testTimeout: 30000,
  
  // Setup files
  setupFilesAfterEnv: ['./framework/setup.js'],
  
  // Reporters
  reporters: [
    'default',
    ['./utils/CustomJestReporter.js', {}],
    ['jest-html-reporter', {
      pageTitle: 'Snow Ice Test Report',
      outputPath: './reports/test-report.html',
      includeFailureMsg: true,
      includeConsoleLog: true
    }]
  ],
  
  // Global variables
  globals: {
    __DEV__: true
  },
  
  // Coverage configuration
  collectCoverage: false,
  coverageDirectory: './reports/coverage',
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!**/node_modules/**',
    '!**/vendor/**'
  ],
  
  // Mocks
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js'
  }
};
