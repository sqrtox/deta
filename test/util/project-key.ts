import { assertIsProjectKey, isProjectKey } from '~/util/project-key';

const projectKey = 'a0abcyxz_aSecretValue';
const itsNotAProjectKey = 'It\'s not a project key';

describe('assertIsProjectKey Function', () => {
  it('If the value passed as an argument is a project key, no TypeError is raised', () => {
    expect(() => assertIsProjectKey(projectKey)).not.toThrowError(TypeError);
  });

  it('If the value passed as an argument is not a project key, a TypeError is raised', () => {
    expect(() => assertIsProjectKey(itsNotAProjectKey)).toThrowError(TypeError);
  });
});

describe('isProjectKey Function', () => {
  it('Returns true if the value passed as argument is a project key', () => {
    expect(isProjectKey(projectKey)).toBe(true);
  });

  it('Returns false if the value passed as argument is not a project key', () => {
    expect(isProjectKey(itsNotAProjectKey)).toBe(false);
  });
});
