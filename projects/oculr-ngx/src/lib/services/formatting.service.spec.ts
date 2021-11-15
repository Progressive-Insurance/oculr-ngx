/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

import { FormattingService } from './formatting.service';

describe('FormattingService', () => {
  let service: FormattingService;

  beforeEach(() => {
    service = new FormattingService();
  });

  describe('formatCifDate', () => {
    it('should format the date', () => {
      const passedDate: Date = new Date('Oct 12 2017 15:20:47:444 EST');
      spyOn(passedDate, 'toISOString').and.returnValue('2017-10-12T16:20:47.444Z');
      spyOn(passedDate, 'toString').and.returnValue('Thu Oct 12 2017 16:20:47 GMT-0400 (Eastern Daylight Time)');
      const expected = '2017-10-12T16:20:47.444Z';

      const actual = service.formatCifDate(passedDate);

      expect(expected).toEqual(actual);
    });
  });

  describe('formatDateWithTimeZoneOffset', () => {
    it('should get a string representation of the date', () => {
      expect(typeof service.formatDateWithTimezoneOffset(new Date())).toEqual('string');
    });

    it('should correctly pad all fields', () => {
      spyOn(Date.prototype, 'getTimezoneOffset').and.returnValue(240);
      const date = new Date('Mar 07 1989 08:01:04.123');
      const expectedResult = '1989-03-07T08:01:04.123-04:00';

      expect(service.formatDateWithTimezoneOffset(date)).toEqual(expectedResult);
    });

    it('should not pad 2 digit numbers', () => {
      spyOn(Date.prototype, 'getTimezoneOffset').and.returnValue(240);
      const date = new Date('Dec 25 2012 12:34:56.321');
      const expectedResult = '2012-12-25T12:34:56.321-04:00';

      expect(service.formatDateWithTimezoneOffset(date)).toEqual(expectedResult);
    });

    it('should account for time zone offsets that are not whole number of hours', () => {
      spyOn(Date.prototype, 'getTimezoneOffset').and.returnValue(645);
      const date = new Date('Dec 25 2012 12:34:56.234');
      const expectedResult = '2012-12-25T12:34:56.234-10:45';

      expect(service.formatDateWithTimezoneOffset(date)).toEqual(expectedResult);
    });

    it('should get positive offset when getTimezoneOffset returns negative', () => {
      spyOn(Date.prototype, 'getTimezoneOffset').and.returnValue(-240);
      const date = new Date('Jan 01 1970 09:00:00.123');
      const expectedResult = '1970-01-01T09:00:00.123+04:00';

      expect(service.formatDateWithTimezoneOffset(date)).toEqual(expectedResult);
    });

    it("should pad milliseconds with '00' when less than 10", () => {
      spyOn(Date.prototype, 'getTimezoneOffset').and.returnValue(-240);
      const date = new Date('Jan 01 1970 09:00:00.001');
      const expectedResult = '1970-01-01T09:00:00.001+04:00';

      expect(service.formatDateWithTimezoneOffset(date)).toEqual(expectedResult);
    });
    it("should pad milliseconds with '0' when less than 100", () => {
      spyOn(Date.prototype, 'getTimezoneOffset').and.returnValue(-240);
      const date = new Date('Jan 01 1970 09:00:00.040');
      const expectedResult = '1970-01-01T09:00:00.040+04:00';

      expect(service.formatDateWithTimezoneOffset(date)).toEqual(expectedResult);
    });
  });

  describe('getCookieDomain', () => {
    it('should return domain as none when hostname is undefined', () => {
      const result = service.getCookieDomain(undefined);
      expect(result).toBe('none');
    });

    it('should return domain as none when hostname is localhost', () => {
      const result = service.getCookieDomain('localhost');
      expect(result).toBe('none');
    });

    it('should return domain as .Bob when hostname is Bob', () => {
      const result = service.getCookieDomain('Bob');
      expect(result).toBe('.Bob');
    });

    it('should return last 2 parts out of hostname as domain', () => {
      const result = service.getCookieDomain('d1-account.progressive.com');
      expect(result).toBe('.progressive.com');
    });
  });

  describe('getSelectedOptions', () => {
    it('returns text of the label element that surrounds the input', () => {
      const element = document.createElement('select');
      element.innerHTML = '<option value="one">One</option><option value="two">Two</option>';
      element.options[0].selected = true;
      const $event = { target: element };
      expect(service.getSelectedOptions($event as any)).toBe('One');
    });

    it('removes any white space before and after the actual label', () => {
      const element = document.createElement('select');
      element.innerHTML = '<option value="one">    One  \n</option><option value="two">Two</option>';
      element.options[0].selected = true;
      const $event = { target: element };
      expect(service.getSelectedOptions($event as any)).toBe('One');
    });

    it('returns ampersand-delimited string if multiple values are selected', () => {
      const element = document.createElement('select');
      element.setAttribute('multiple', 'true');
      element.innerHTML = '<option value="one">    One  \n</option><option value="two">\tTwo</option>';
      element.options[0].selected = true;
      element.options[1].selected = true;
      const $event = { target: element };
      expect(service.getSelectedOptions($event as any)).toBe('One&Two');
    });
    it('returns empty string if the $event is malformed', () => {
      expect(service.getSelectedOptions(undefined as any)).toBe('');
      const $event1 = {};
      expect(service.getSelectedOptions($event1 as any)).toBe('');
      const $event2 = { target: {} };
      expect(service.getSelectedOptions($event2 as any)).toBe('');
      const $event3 = { target: { options: [] } };
      expect(service.getSelectedOptions($event3 as any)).toBe('');
    });
  });

  describe('htmlToText Function', () => {
    it('removes tags from a string', () => {
      const htmlString = 'This is <b>bold</b> text. &amp; these are line breaks <br> <br />';
      const textString = 'This is bold text. & these are line breaks  ';
      expect(service.htmlToText(htmlString, ['&amp;'])).toEqual(textString);
    });

    it('removes tags without a closing tag', () => {
      const htmlString = 'This is a <test>here';
      const textString = 'This is a here';
      expect(service.htmlToText(htmlString)).toEqual(textString);
    });

    it('does not remove text that happens to use < and > signs', () => {
      const htmlString = 'This statement, 3 < 5 is true but, 2 > 3 is false.';
      const textString = 'This statement, 3 < 5 is true but, 2 > 3 is false.';
      expect(service.htmlToText(htmlString)).toEqual(textString);
    });

    it('converts tags and text', () => {
      const htmlString = 'Snapshot<sup>&reg;</sup>';
      const textString = 'Snapshot®';
      expect(service.htmlToText(htmlString, ['&reg;'])).toEqual(textString);
    });

    it("doesn't remove &nbsp;", () => {
      const htmlString = '&lt;Home&nbsp;Page';
      const textString = 'Home\u00A0Page'; // \u00A0 is unicode for nbsp
      expect(service.htmlToText(htmlString)).toEqual(textString);
    });
  });
});
