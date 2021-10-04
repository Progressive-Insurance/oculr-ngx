import { formatFormErrors } from './format-form-errors';

describe('formatFormErrors function', () => {

  it('returns error message for single form control', () => {
    const formGroup: any = {
      controls: {
        firstName: {
          errors: {
            required: { message: 'Blank' }
          }
        },
        lastName: {
          errors: {}
        }
      }
    };
    const expected = { errorMessages: 'firstName=Blank', errorCount: 1 };
    const actual = formatFormErrors(formGroup);
    expect(actual).toEqual(expected);
  });

  it('returns error messages for multiple form controls', () => {
    const formGroup: any = {
      controls: {
        firstName: {
          errors: {
            required: { message: 'Blank' }
          }
        },
        lastName: {
          errors: {
            pattern: { message: 'Invalid Format' }
          }
        }
      }
    };
    const expected = { errorMessages: 'firstName=Blank&lastName=Invalid Format', errorCount: 2 };
    const actual = formatFormErrors(formGroup);
    expect(actual).toEqual(expected);
  });

  it('returns empty errors set if there are empty error objects', () => {
    const formGroup: any = {
      controls: {
        first: {
          errors: {}
        },
        last: {
          errors: {}
        }
      }
    };
    expect(formatFormErrors(formGroup)).toEqual({ errorMessages: '', errorCount: 0 });
  });

  it('returns empty errors set if there are no form error objects', () => {
    const formGroup: any = {
      controls: {
        first: {},
        last: {}
      }
    };
    expect(formatFormErrors(formGroup)).toEqual({ errorMessages: '', errorCount: 0 });
  });
});
