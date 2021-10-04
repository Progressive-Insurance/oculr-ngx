import { getInputLabel } from './get-input-label';

describe('getInputLabel', () => {
  it('returns text of the label element that surrounds the input', () => {
    const $event = { target: { parentElement: { textContent: 'Field Label' } } };
    expect(getInputLabel($event)).toBe('Field Label');
  });
  it('removes any white space before and after the actual label', () => {
    const $event = { target: { parentElement: { textContent: '  \t  Field Label  \n' } } };
    expect(getInputLabel($event)).toBe('Field Label');
  });
  it('returns empty string if the $event is malformed', () => {
    expect(getInputLabel(undefined)).toBe('');
    const $event1 = {};
    expect(getInputLabel($event1)).toBe('');
    const $event2 = { target: {} };
    expect(getInputLabel($event2)).toBe('');
    const $event3 = { target: { parentElement: {} } };
    expect(getInputLabel($event3)).toBe('');
  });
});
