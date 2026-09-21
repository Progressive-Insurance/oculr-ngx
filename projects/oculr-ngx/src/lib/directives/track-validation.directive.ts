/*
 * @license
 * Copyright (c) 2025 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
*/

import { Directive, HostListener, Input, OnDestroy } from '@angular/core';
import { NgControl, ValidationErrors } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DirectiveEvent } from '../models/directive-event.interface';
import { DispatchService } from '../services/dispatch.service';

@Directive({
  selector: '[oculrTrackValidation]',
  standalone: false
})
export class TrackValidationDirective implements OnDestroy {
  @Input('oculrTrackValidation') directiveEvent: DirectiveEvent | '' = '';

  /**
   * The control's value when the current pending blur observation began. Re-checked at
   * settlement because setValue() can emit statusChanges before valueChanges.
   */
  private observedValue: unknown;
  private observation: Subscription | null = null;

  constructor(private control: NgControl, private dispatchService: DispatchService) {}

  @HostListener('focusout')
  onBlur(): void {
    if (!this.control.touched) {
      return;
    }
    // A new blur takes ownership of the report, replacing any earlier pending observation.
    this.clearObservation();
    if (this.control.errors) {
      this.dispatchValidationError(this.control.errors);
      return;
    }
    if (this.control.pending) {
      this.startObservation();
    }
  }

  /**
   * Returning focus before the pending validation settles cancels the outstanding blur
   * report (deliberate policy: the editing session is active again, so the earlier blur
   * is not reported). The next blur starts a fresh observation.
   */
  @HostListener('focusin')
  onRefocus(): void {
    this.clearObservation();
  }

  ngOnDestroy(): void {
    this.clearObservation();
  }

  private startObservation(): void {
    const control = this.control.control;
    if (!control) {
      return;
    }
    this.observedValue = control.value;
    const observation = new Subscription();
    // Report once when this blur's asynchronous validation settles, as long as the
    // value has not been replaced in the meantime.
    observation.add(
      control.statusChanges.subscribe((status: string) => {
        if (status !== 'PENDING') {
          this.settleObservation();
        }
      })
    );
    // A value change before settlement cancels the outstanding report.
    observation.add(control.valueChanges.subscribe(() => this.clearObservation()));
    this.observation = observation;
  }

  private settleObservation(): void {
    const valueUnchanged = this.control.value === this.observedValue;
    this.clearObservation();
    // A replacement edit's synchronous validation can settle before its valueChange
    // arrives, so re-checking the value keeps it from being reported for the older blur.
    if (valueUnchanged && this.control.errors) {
      this.dispatchValidationError(this.control.errors);
    }
  }

  private dispatchValidationError(errors: ValidationErrors): void {
    this.dispatchService.trackValidationError({
      element: this.control.name,
      validationErrors: errors,
      ...this.directiveEvent,
    });
  }

  private clearObservation(): void {
    if (this.observation) {
      this.observation.unsubscribe();
      this.observation = null;
    }
    this.observedValue = undefined;
  }
}
