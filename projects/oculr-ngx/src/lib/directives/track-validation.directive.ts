import { Directive, HostListener, Input } from '@angular/core';
import { NgControl } from '@angular/forms';
import { AnalyticEvent } from '../models/analytic-event.interface';
import { DispatchService } from '../services/dispatch.service';

@Directive({
  selector: '[oculrTrackValidation]',
})
export class TrackValidationDirective {
  @Input('oculrTrackValidation') analyticEventInput: AnalyticEvent | '' = '';

  constructor(private control: NgControl, private dispatchService: DispatchService) {}

  @HostListener('focusout')
  onBlur(): void {
    if (this.control.touched && this.control.errors) {
      this.dispatchService.trackValidationError({
        element: this.control.name,
        validationErrors: this.control.errors,
        ...this.analyticEventInput,
      });
    }
  }
}
