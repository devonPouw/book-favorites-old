import { Directive } from '@angular/core';
import {
  AbstractControl,
  NG_VALIDATORS,
  Validator,
  ValidatorFn,
  ValidationErrors,
} from '@angular/forms';

export function isbnValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value == null) {
      return null;
    }

    const valueAsString = value.toString().trim();
    const regex = /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/;

    if (regex.test(valueAsString)) {
      return null;
    } else {
      return { invalidIsbnLength: { value: control.value } };
    }
  };
}

@Directive({
  selector: '[bfIsbnValidator]',
  standalone: true,
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: IsbnValidatorDirective,
      multi: true,
    },
  ],
})
export class IsbnValidatorDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    return isbnValidator()(control);
  }
}
