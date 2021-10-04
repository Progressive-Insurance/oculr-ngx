
import * as dateUtil from './date-util';

describe('dateUtil', () => {

  describe('formatDateWithTimeZoneOffset', () => {

    it('should get a string representation of the date', () => {
      expect(typeof dateUtil.formatDateWithTimezoneOffset(new Date())).toEqual('string');
    });

    it('should correctly pad all fields', () => {
      spyOn(Date.prototype, 'getTimezoneOffset').and.returnValue(240);
      const date = new Date('Mar 07 1989 08:01:04.123');
      const expectedResult = '1989-03-07T08:01:04.123-04:00';

      expect(dateUtil.formatDateWithTimezoneOffset(date)).toEqual(expectedResult);
    });

    it('should not pad 2 digit numbers', () => {
      spyOn(Date.prototype, 'getTimezoneOffset').and.returnValue(240);
      const date = new Date('Dec 25 2012 12:34:56.321');
      const expectedResult = '2012-12-25T12:34:56.321-04:00';

      expect(dateUtil.formatDateWithTimezoneOffset(date)).toEqual(expectedResult);
    });

    it('should account for time zone offsets that are not whole number of hours', () => {
      spyOn(Date.prototype, 'getTimezoneOffset').and.returnValue(645);
      const date = new Date('Dec 25 2012 12:34:56.234');
      const expectedResult = '2012-12-25T12:34:56.234-10:45';

      expect(dateUtil.formatDateWithTimezoneOffset(date)).toEqual(expectedResult);
    });

    it('should get positive offset when getTimezoneOffset returns negative', () => {
      spyOn(Date.prototype, 'getTimezoneOffset').and.returnValue(-240);
      const date = new Date('Jan 01 1970 09:00:00.123');
      const expectedResult = '1970-01-01T09:00:00.123+04:00';

      expect(dateUtil.formatDateWithTimezoneOffset(date)).toEqual(expectedResult);
    });

    it('should pad milliseconds with \'00\' when less than 10', () => {
      spyOn(Date.prototype, 'getTimezoneOffset').and.returnValue(-240);
      const date = new Date('Jan 01 1970 09:00:00.001');
      const expectedResult = '1970-01-01T09:00:00.001+04:00';

      expect(dateUtil.formatDateWithTimezoneOffset(date)).toEqual(expectedResult);
    });
    it('should pad milliseconds with \'0\' when less than 100', () => {
      spyOn(Date.prototype, 'getTimezoneOffset').and.returnValue(-240);
      const date = new Date('Jan 01 1970 09:00:00.040');
      const expectedResult = '1970-01-01T09:00:00.040+04:00';

      expect(dateUtil.formatDateWithTimezoneOffset(date)).toEqual(expectedResult);
    });

  });

});

describe('formatCifDate', () => {
  const passedDate: Date = new Date('Oct 12 2017 15:20:47:444 EST');

  it('should format the date', () => {
    spyOn(passedDate, 'toISOString').and.returnValue('2017-10-12T16:20:47.444Z');
    spyOn(passedDate, 'toString').and.returnValue('Thu Oct 12 2017 16:20:47 GMT-0400 (Eastern Daylight Time)');
    const expected = '2017-10-12T16:20:47.444Z';
    const actual = dateUtil.formatCifDate(passedDate);
    expect(expected).toEqual(actual);
  });

});
