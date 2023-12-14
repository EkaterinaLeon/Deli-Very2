import type { Config } from 'jest';

const config: Config = {
    testTimeout: 60000,
    preset: 'ts-jest',
    testEnvironment: 'node',
    rootDir: '.',
    testMatch: [
        '<rootDir>/test/**/*.e2e-spec.{ts,js}',
        '<rootDir>/**/*.spec.{ts,js}',
        '<rootDir>/**/*.integration.{ts,js}'
    ],
    collectCoverage: true,
    coverageDirectory: './coverage',
    coverageThreshold: {
        global: {
            branches: 100,
            functions: 100,
            lines: 100,
            statements: 100
        }
    }
};

export default config;
