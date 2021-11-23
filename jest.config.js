module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    // testMatch: ['<rootDir>/test/**/*.test.[jt]s?(x)'],
    testMatch: ['<rootDir>/test/**/all.test.[jt]s?(x)'],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
        '^.+\\.(js|jsx)$': 'babel-jest',
    },
    transformIgnorePatterns: ['<rootDir>/node_modules/(?!lodash-es)'],
    collectCoverageFrom: [
        'src/**/*.[jt]s?(x)',
        '!coverage/**',
        '!node_modules/**',
    ],
    coverageReporters: ['json-summary'],
    coveragePathIgnorePatterns: ['test/', 'node_modules/'],
    moduleNameMapper: {
        '^@Lib/(.*)$': '<rootDir>/src/$1',
    },
    moduleDirectories: ['node_modules', 'src'],
    coverageDirectory: '<rootDir>/coverage/',
    coverageThreshold: {
        global: {
            branches: 0,
            functions: 0,
            lines: 0,
            statements: 0,
        },
    },
    globals: {
        'ts-jest': {
            tsconfig: 'test/tsconfig.json',
        },
    },
};
