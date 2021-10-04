import { FormGroup, FormControl } from '@angular/forms';

import { Validators } from './validators';

describe('Validators wrapper', () => {

  describe('valid values should not produce errors', () => {
    it('min', () => {
      const unexpectedValidationMessage = 'You need a BIGGER value!';
      const formGroup = new FormGroup({
        formField: new FormControl(4, Validators.min(2, unexpectedValidationMessage))
      });
      expect(formGroup.controls.formField.errors).toBeNull();
    });

    it('max', () => {
      const unexpectedValidationMessage = 'You need a SMALLER value!';
      const formGroup = new FormGroup({
        formField: new FormControl(4, Validators.max(10, unexpectedValidationMessage))
      });
      expect(formGroup.controls.formField.errors).toBeNull();
    });

    it('required', () => {
      const unexpectedValidationMessage = 'You need to provide a value!';
      const formGroup = new FormGroup({
        formField: new FormControl('Some Data', Validators.required(unexpectedValidationMessage))
      });
      expect(formGroup.controls.formField.errors).toBeNull();
    });

    it('requiredTrue', () => {
      const unexpectedValidationMessage = 'You need to provide a TRUE value!';
      const formGroup = new FormGroup({
        formField: new FormControl(true, Validators.requiredTrue(unexpectedValidationMessage))
      });
      expect(formGroup.controls.formField.errors).toBeNull();
    });

    it('email', () => {
      const unexpectedValidationMessage = 'You need to provide a VALID EMAIL!';
      const formGroup = new FormGroup({
        formField: new FormControl('test@test.com', Validators.email(unexpectedValidationMessage))
      });
      expect(formGroup.controls.formField.errors).toBeNull();
    });

    it('minLength', () => {
      const unexpectedValidationMessage = 'You need MORE characters in there!';
      const formGroup = new FormGroup({
        formField: new FormControl('Regular Length Name', Validators.minLength(2, unexpectedValidationMessage))
      });
      expect(formGroup.controls.formField.errors).toBeNull();
    });

    it('maxLength', () => {
      const unexpectedValidationMessage = 'You need MORE characters in there!';
      const formGroup = new FormGroup({
        formField: new FormControl('Regular Length Name', Validators.maxLength(20, unexpectedValidationMessage))
      });
      expect(formGroup.controls.formField.errors).toBeNull();
    });

    it('pattern', () => {
      const unexpectedValidationMessage = 'You need to provide a VALID thing!';
      const formGroup = new FormGroup({
        formField: new FormControl('THE_RIGHT_THING', Validators.pattern('THE_RIGHT_THING', unexpectedValidationMessage))
      });
      expect(formGroup.controls.formField.errors).toBeNull();
    });
  });

  describe('should structure the errors object with message property set', () => {
    it('min', () => {
      const expectedValidationMessage = 'You need a BIGGER value!';
      const expected = { min: { message: expectedValidationMessage } };
      const formGroup = new FormGroup({
        formField: new FormControl(1, Validators.min(2, expectedValidationMessage))
      });
      expect(formGroup.controls.formField.errors).toEqual(expected);
    });

    it('max', () => {
      const expectedValidationMessage = 'You need a SMALLER value!';
      const expected = { max: { message: expectedValidationMessage } };
      const formGroup = new FormGroup({
        formField: new FormControl(11, Validators.max(10, expectedValidationMessage))
      });
      expect(formGroup.controls.formField.errors).toEqual(expected);
    });

    it('required', () => {
      const expectedValidationMessage = 'You need to provide a value!';
      const expected = { required: { message: expectedValidationMessage } };
      const formGroup = new FormGroup({
        formField: new FormControl(null, Validators.required(expectedValidationMessage))
      });
      expect(formGroup.controls.formField.errors).toEqual(expected);
    });

    it('requiredTrue', () => {
      const expectedValidationMessage = 'You need to provide a TRUE value!';
      const expected = { required: { message: expectedValidationMessage } };
      const formGroup = new FormGroup({
        formField: new FormControl(false, Validators.requiredTrue(expectedValidationMessage))
      });
      expect(formGroup.controls.formField.errors).toEqual(expected);
    });

    it('email', () => {
      const expectedValidationMessage = 'You need to provide a VALID EMAIL!';
      const expected = { email: { message: expectedValidationMessage } };
      const formGroup = new FormGroup({
        formField: new FormControl('123 Fake St.', Validators.email(expectedValidationMessage))
      });
      expect(formGroup.controls.formField.errors).toEqual(expected);
    });

    it('minLength', () => {
      const expectedValidationMessage = 'You need MORE characters in there!';
      const expected = { minlength: { message: expectedValidationMessage } };
      const formGroup = new FormGroup({
        formField: new FormControl('a', Validators.minLength(2, expectedValidationMessage))
      });
      expect(formGroup.controls.formField.errors).toEqual(expected);
    });

    it('maxLength', () => {
      const expectedValidationMessage = 'You need MORE characters in there!';
      const expected = { maxlength: { message: expectedValidationMessage } };
      const formGroup = new FormGroup({
        formField: new FormControl('THIS_IS_A_REALLY_LONG_STRING', Validators.maxLength(4, expectedValidationMessage))
      });
      expect(formGroup.controls.formField.errors).toEqual(expected);
    });

    it('pattern', () => {
      const expectedValidationMessage = 'You need to provide a VALID thing!';
      const expected = { pattern: { message: expectedValidationMessage } };
      const formGroup = new FormGroup({
        formField: new FormControl('NOT_THE_RIGHT_THING', Validators.pattern('THE_RIGHT_THING', expectedValidationMessage))
      });
      expect(formGroup.controls.formField.errors).toEqual(expected);
    });
  });

  describe('wrapValidator', () => {
    describe('should return a ValidatorFn', () => {
      it('that returns null when no errors are returned', () => {
        const mockValidator = (control: any) => null;

        const wrappedValidator = Validators.wrapValidator(mockValidator, 'This message SHOULD NOT be seen!');
        expect(wrappedValidator(new FormControl())).toBeNull();
      });

      it('that returns restructured errors when a single error exist on the control', () => {
        const mockValidator = (control: any) => ({
          errorKey1: true
        });
        const expectedValidationMessage = 'This message SHOULD be seen!';

        const expected = { errorKey1: { message: expectedValidationMessage } };
        const wrappedValidator = Validators.wrapValidator(mockValidator, expectedValidationMessage);
        expect(wrappedValidator(new FormControl())).toEqual(expected);
      });

      it('that returns restructured errors when multiple errors exist on the control', () => {
        const mockValidator = (control: any) => ({
          errorKey1: true,
          errorKey2: true
        });
        const expectedValidationMessage = 'Same VALIDATION Message';

        const expected = {
          errorKey1: { message: expectedValidationMessage },
          errorKey2: { message: expectedValidationMessage }
        };
        const wrappedValidator = Validators.wrapValidator(mockValidator, expectedValidationMessage);
        expect(wrappedValidator(new FormControl())).toEqual(expected);
      });

      it('that returns an empty object when an empty object is provided', () => {
        const mockValidator = (control: any) => ({});
        const unexpectedValidationMessage = 'You should not see this message!';

        const wrappedValidator = Validators.wrapValidator(mockValidator, unexpectedValidationMessage);
        expect(wrappedValidator(new FormControl())).toEqual({});
      });
    });
  });
});
