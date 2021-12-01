/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

import { Directive, ElementRef, Input, OnInit } from '@angular/core';

import { AnalyticEvent } from '../models/analytic-event.interface';
import { DirectiveService } from '../services/directive.service';
import { EventDispatchService } from '../services/event-dispatch.service';

@Directive({
  selector: '[oculrDisplay]',
})
export class DisplayDirective implements OnInit {
  @Input('oculrDisplay') analyticEventInput: AnalyticEvent | '' = '';

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private eventDispatchService: EventDispatchService,
    private directiveService: DirectiveService
  ) {}

  ngOnInit(): void {
    const analyticEvent = this.directiveService.getAnalyticEvent(this.analyticEventInput);
    this.directiveService.setId(analyticEvent, this.elementRef);
    if (this.shouldDispatch(analyticEvent)) {
      this.directiveService.setElement(analyticEvent, this.elementRef);
      this.handleEvent(analyticEvent);
    }
  }

  private handleEvent(analyticEvent: AnalyticEvent) {
    this.eventDispatchService.trackDisplay(analyticEvent);
  }

  private shouldDispatch(analyticEvent: AnalyticEvent): boolean {
    return this.directiveService.shouldDispatch(
      analyticEvent,
      'oculrDisplay',
      'https://github.com/Progressive/oculr-ngx/blob/main/docs/display-directive.md'
    );
  }
}
