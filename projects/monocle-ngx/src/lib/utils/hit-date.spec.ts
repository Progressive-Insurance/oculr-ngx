
import { hitDate } from './hit-date';

describe('hitDate', () => {

  it('should get a string representation of the date', () => {
    expect(typeof hitDate()).toEqual('string');
  });

  it('should have timezone data', () => {
    expect(hitDate()).toMatch(/(\-|\+)[0-9]{2}:[0-9]{2}$/);
  });

  it('should not use Z time', () => {
    expect(hitDate()).not.toContain('Z');
  });

  it('should have fractional/milliseconds includes', () => {
    expect(hitDate()).toMatch(/[0-9]\.[0-9]{3}/);
  });

});
