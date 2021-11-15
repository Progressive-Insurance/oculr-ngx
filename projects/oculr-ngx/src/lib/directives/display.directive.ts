/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

import { Directive, ElementRef, Input, OnInit } from '@angular/core';

import { DisplayEvent } from '../models/display-event.interface';
import { EventDispatchService } from '../services/event-dispatch.service';

@Directive({
  selector: '[oculrDisplay]',
})
export class DisplayDirective implements OnInit {
  @Input('oculrDisplay') analyticEventInput: DisplayEvent | '' = '';

  constructor(private elementRef: ElementRef<HTMLElement>, private eventDispatchService: EventDispatchService) {}

  ngOnInit(): void {
    const analyticEvent = this.getAnalyticEvent();
    this.determineId(analyticEvent);
    if (this.shouldDispatch(analyticEvent)) {
      this.handleEvent(analyticEvent);
    }
  }

  private getAnalyticEvent(): DisplayEvent {
    return this.analyticEventInput ? { ...this.analyticEventInput } : { id: '' };
  }

  private determineId(analyticEvent: DisplayEvent): void {
    const elementId = this.elementRef.nativeElement.getAttribute('id');
    if (elementId) {
      analyticEvent.id ||= elementId;
    }
  }

  private handleEvent(analyticEvent: DisplayEvent) {
    this.eventDispatchService.trackDisplay(analyticEvent);
  }

  private shouldDispatch(analyticEvent: DisplayEvent): boolean {
    if (!analyticEvent.id) {
      console.warn(
        `The oculrDisplay directive requires an identifier. This can be done with an id attribute on the
        host element, or by binding an Event object. More information can be found here:
        https://github.com/Progressive/oculr-ngx/blob/main/docs/display-directive.md`
      );
      return false;
    }
    return true;
  }
}
