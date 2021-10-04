import { FormGroup } from '@angular/forms';

export const formatFormErrors = (formGroup: FormGroup): { errorMessages: string, errorCount: number } => {
  const obj = Object.keys(formGroup.controls)
    .filter(controlName => formGroup.controls[controlName].errors !== null)
    .reduce((formErrors, controlName) => {
      const validationErrors = (formGroup.controls[controlName].errors || {});
      const controlErrorKeys = Object.keys(validationErrors);
      const controlMessages = controlErrorKeys
        .filter(errorKey => !!validationErrors[errorKey])
        .map(errorKey => `${controlName}=${validationErrors[errorKey].message}`);
      return {
        errorCount: formErrors.errorCount + controlErrorKeys.length,
        errorMessages: [...formErrors.errorMessages, ...controlMessages]
      };
    }, { errorCount: 0, errorMessages: [] });
  return {
    errorMessages: obj.errorMessages.join('&'),
    errorCount: obj.errorCount
  };
};
