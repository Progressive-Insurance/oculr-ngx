import { getCheckboxState } from './get-checkbox-state';

describe('getCheckboxState', () => {
  it('returns `Check` new state of box is checked', () => {
    const $event = { target: { checked: true } };
    expect(getCheckboxState($event)).toBe('Check');
  });
  it('returns `Uncheck` if new state of box is unchecked', () => {
    const $event = { target: { checked: false } };
    expect(getCheckboxState($event)).toBe('Uncheck');
  });
  it('returns empty string if the $event is malformed', () => {
    const $event = {};
    expect(getCheckboxState($event)).toBe('');
    expect(getCheckboxState(undefined)).toBe('');
  });
});
