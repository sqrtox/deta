import { isArray } from '~/util/isArray';

describe('isArray Function', () => {
  it('For arrays, true is returned', () => {
    expect(isArray([])).toBe(true);
  });

  it('If it is not an array, false is returned', () => {
    expect(isArray('This is not an array')).toBe(false);
  });
});
