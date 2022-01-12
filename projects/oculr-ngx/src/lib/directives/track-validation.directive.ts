import { Directive, HostListener, Input } from '@angular/core';
import { NgControl } from '@angular/forms';
import { AnalyticEvent } from '../models/analytic-event.interface';
import { EventDispatchService } from '../services/event-dispatch.service';

@Directive({
  selector: '[oculrTrackValidation]',
})
export class TrackValidationDirective {
  @Input('oculrTrackValidation') analyticEventInput: AnalyticEvent | '' = '';

  constructor(private control: NgControl, private eventDispatch: EventDispatchService) {}

  @HostListener('focusout')
  onBlur(): void {
    if (this.control.touched && this.control.errors) {
      this.eventDispatch.trackValidationError({
        element: this.control.name,
        validationErrors: this.control.errors,
        ...this.analyticEventInput,
      });
    }
  }
}
