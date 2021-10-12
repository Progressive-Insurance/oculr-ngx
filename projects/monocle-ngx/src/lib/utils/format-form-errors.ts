import { FormGroup } from '@angular/forms';

export const formatFormErrors = (formGroup: FormGroup): { errorMessages: string; errorCount: number } => {
  const formErrors: { errorMessages: string[]; errorCount: number } = { errorMessages: [], errorCount: 0 };
  Object.keys(formGroup.controls)
    .filter((controlName) => formGroup.controls[controlName].errors !== null)
    .forEach((controlName) => {
      const validationErrors = formGroup.controls[controlName].errors || {};
      const controlErrorKeys = Object.keys(validationErrors);
      const controlMessages = controlErrorKeys
        .filter((errorKey) => !!validationErrors[errorKey])
        .map((errorKey) => `${controlName}=${validationErrors[errorKey].message}`);
      formErrors.errorMessages = [...formErrors.errorMessages, ...controlMessages];
      formErrors.errorCount += controlErrorKeys.length;
    });
  return {
    // TODO: this can be cleaned up to occur while looping
    errorMessages: formErrors.errorMessages.join('&'),
    errorCount: formErrors.errorCount,
  };
};
