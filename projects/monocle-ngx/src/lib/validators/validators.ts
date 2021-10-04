import {
  AbstractControl,
  Validators as ngValidators,
  ValidationErrors,
  ValidatorFn,
  AsyncValidatorFn
} from '@angular/forms';

export class Validators {

  static min(min: number, message: string): ValidatorFn {
    return Validators.wrapValidator(ngValidators.min(min), message);
  }

  static max(max: number, message: string): ValidatorFn {
    return Validators.wrapValidator(ngValidators.max(max), message);
  }

  static required(message: string): ValidatorFn {
    return Validators.wrapValidator(ngValidators.required, message);
  }

  static requiredTrue(message: string): ValidationErrors | null {
    return Validators.wrapValidator(ngValidators.requiredTrue, message);
  }

  static email(message: string): ValidationErrors | null {
    return Validators.wrapValidator(ngValidators.email, message);
  }

  static minLength(minLength: number, message: string): ValidatorFn {
    return Validators.wrapValidator(ngValidators.minLength(minLength), message);
  }

  static maxLength(maxLength: number, message: string): ValidatorFn {
    return Validators.wrapValidator(ngValidators.maxLength(maxLength), message);
  }

  static pattern(pattern: string | RegExp, message: string): ValidatorFn {
    return Validators.wrapValidator(ngValidators.pattern(pattern), message);
  }

  static nullValidator(control: AbstractControl): ValidationErrors | null {
    return ngValidators.nullValidator(control);
  }

  static compose(validators: (ValidatorFn | null | undefined)[]): ValidatorFn | null {
    return ngValidators.compose(validators);
  }

  static composeAsync(validators: (AsyncValidatorFn | null)[]): AsyncValidatorFn | null {
    return ngValidators.composeAsync(validators);
  }

  static wrapValidator(validator: ValidatorFn, message: string) {
    const wrappedValidator = (control: AbstractControl): ValidationErrors | null => {
      const errors = validator(control);
      if (errors === null) {
        return null;
      }
      return Object.keys(errors).reduce((result: ValidationErrors, errorKey: string) => {
        return {
          ...result,
          [errorKey]: { message }
        };
      }, {});
    };
    return wrappedValidator;
  }
}
