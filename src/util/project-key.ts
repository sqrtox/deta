import { type Brand } from '~/types/Brand';

type ProjectKey = Brand<string, 'projectKey'>;

const isProjectKey = (projectKey: unknown): projectKey is ProjectKey => (
  typeof projectKey === 'string' &&
  /^[\da-z]+_[\da-zA-Z]+$/.test(projectKey)
);

type AssertIsProjectKey = (projectKey: unknown) => asserts projectKey is ProjectKey;

const assertIsProjectKey: AssertIsProjectKey = projectKey => {
  if (!isProjectKey(projectKey)) {
    throw new TypeError('Invalid project key');
  }
};

export {
  type AssertIsProjectKey,
  type ProjectKey,
  assertIsProjectKey,
  isProjectKey
};
