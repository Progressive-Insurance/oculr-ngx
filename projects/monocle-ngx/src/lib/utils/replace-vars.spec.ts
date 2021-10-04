import { determineValue, indexReplacer, replaceVars } from './replace-vars';

describe('determineValue', () => {
  it('should return value if it is a valid number', () => {
    expect(determineValue(0, 'other')).toBe(0);
  });

  it('should skip value if it is undefined', () => {
    expect(determineValue(undefined, 'other')).toBe('other');
  });

  it('should skip value if it is null', () => {
    expect(determineValue(null, 'other')).toBe('other');
  });

  it('should skip value if it is empty string', () => {
    expect(determineValue('', 'other')).toBe('other');
  });

  it('should prefer the fallback value if it is provided', () => {
    expect(determineValue(null, 'final', 'fallback')).toBe('fallback');
  });

  it('should allow for fallback to be 0', () => {
    expect(determineValue(null, 'final', 0)).toBe(0);
  });
});

describe('indexReplacer', () => {
  it('should increment value by 1 if p1 ends in Index', () => {
    expect(indexReplacer('{{ testIndex }}', 'testIndex', 0, undefined)).toBe(1);
  });

  it('should do nothing to value if Index is found in the middle of match', () => {
    expect(indexReplacer('{{ testIndexs }}', 'testIndexs', 5, undefined)).toBe(5);
  });

  it('should allow for zero values', () => {
    expect(indexReplacer('{{ any }}', 'any', 0, undefined)).toBe(0);
  });

  it('should do nothing to value if Index is found at the start of match', () => {
    expect(indexReplacer('{{ Index }}',  'Index', 5, undefined)).toBe(5);
  });
});

describe('replaceVars', () => {
  it('replaces variables in double braces "{{ }}" with values from values object if found', () => {
    const template = 'I ate a {{food}}';
    const values = { food: 'hamburger' };
    expect(replaceVars(template, values)).toBe('I ate a hamburger');
  });

  it('replaces multiple variables in one call', () => {
    const template = 'I ate a {{food}} and drank a {{ drink }}';
    const values = { food: 'hamburger', drink: 'pepsi' };
    expect(replaceVars(template, values)).toBe('I ate a hamburger and drank a pepsi');
  });

  it('does not perform substitution if no data is found', () => {
    const template = 'I ate a {{food}}';
    const values = {};
    expect(replaceVars(template, values)).toBe('I ate a {{food}}');
  });

  it('does not replace variable if it is in single braces "{}"', () => {
    const template = 'I ate a {food}';
    const values = { food: 'hamburger' };
    expect(replaceVars(template, values)).toBe('I ate a {food}');
  });

  it('should use the specified fallback value if a match is not found', () => {
    const template = 'I should display the {{default}}';
    const expected = 'I should display the 0';
    const actual = replaceVars(template, {}, '0');
    expect(actual).toBe(expected);
  });

  it('should use the indexReplacer to increment values with Index at the end', () => {
    const template = 'I should display the {{someIndex}}';
    const expected = 'I should display the 1';
    const actual = replaceVars(template, { someIndex: '0' }, '7');
    expect(actual).toBe(expected);
  });
});
