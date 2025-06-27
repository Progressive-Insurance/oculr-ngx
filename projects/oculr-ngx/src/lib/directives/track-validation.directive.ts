/*
 * @license
 * Copyright (c) 2025 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
*/

import { Directive, HostListener, Input } from '@angular/core';
import { NgControl } from '@angular/forms';
import { DirectiveEvent } from '../models/directive-event.interface';
import { DispatchService } from '../services/dispatch.service';

@Directive({
    selector: '[oculrTrackValidation]',
    standalone: false
})
export class TrackValidationDirective {
  @Input('oculrTrackValidation') directiveEvent: DirectiveEvent | '' = '';

  constructor(private control: NgControl, private dispatchService: DispatchService) {}

  @HostListener('focusout')
  onBlur(): void {
    if (this.control.touched && this.control.errors) {
      this.dispatchService.trackValidationError({
        element: this.control.name,
        validationErrors: this.control.errors,
        ...this.directiveEvent,
      });
    }
  }
}
