import { getSelectedOptions } from './get-selected-options';

describe('getSelectedOptions', () => {
  it('returns text of the label element that surrounds the input', () => {
    const element = document.createElement('select');
    element.innerHTML = '<option value="one">One</option><option value="two">Two</option>';
    element.options[0].selected = true;
    const $event = { target: element };
    expect(getSelectedOptions($event)).toBe('One');
  });

  it('removes any white space before and after the actual label', () => {
    const element = document.createElement('select');
    element.innerHTML = '<option value="one">    One  \n</option><option value="two">Two</option>';
    element.options[0].selected = true;
    const $event = { target: element };
    expect(getSelectedOptions($event)).toBe('One');
  });

  it('returns ampersand-delimited string if multiple values are selected', () => {
    const element = document.createElement('select');
    element.setAttribute('multiple', 'true');
    element.innerHTML = '<option value="one">    One  \n</option><option value="two">\tTwo</option>';
    element.options[0].selected = true;
    element.options[1].selected = true;
    const $event = { target: element };
    expect(getSelectedOptions($event)).toBe('One&Two');
  });
  it('returns empty string if the $event is malformed', () => {
    expect(getSelectedOptions(undefined)).toBe('');
    const $event1 = {};
    expect(getSelectedOptions($event1)).toBe('');
    const $event2 = { target: {} };
    expect(getSelectedOptions($event2)).toBe('');
    const $event3 = { target: { options: [] } };
    expect(getSelectedOptions($event3)).toBe('');
  });
});
