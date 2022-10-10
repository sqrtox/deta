// @ts-check

import { type JestConfigWithTsJest, pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';

const moduleNameMapper = pathsToModuleNameMapper(compilerOptions.paths, {
  prefix: '<rootDir>/'
});

const config: JestConfigWithTsJest = {
  collectCoverage: true,
  moduleNameMapper,
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.ts'],
  verbose: true
};

export default config;
