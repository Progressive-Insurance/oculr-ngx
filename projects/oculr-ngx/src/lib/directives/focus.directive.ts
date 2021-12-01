/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

import { Directive, ElementRef, HostListener, Input } from '@angular/core';

import { AnalyticEvent } from '../models/analytic-event.interface';
import { InteractionDetail } from '../models/interaction-detail.enum';
import { InteractionType } from '../models/interaction-type.enum';
import { DirectiveService } from '../services/directive.service';
import { EventDispatchService } from '../services/event-dispatch.service';

@Directive({
  selector: '[oculrFocus]',
})
export class FocusDirective {
  @Input('oculrFocus') analyticEventInput: AnalyticEvent | '' = '';
  interactionDetail: InteractionDetail | undefined = undefined;

  @HostListener('focus', ['$event'])
  onFocus(): void {
    const analyticEvent = this.directiveService.getAnalyticEvent(this.analyticEventInput);
    this.directiveService.setId(analyticEvent, this.elementRef);
    if (this.shouldDispatch(analyticEvent)) {
      this.setInteractionType(analyticEvent);
      this.setInteractionDetail(analyticEvent);
      this.directiveService.setElement(analyticEvent, this.elementRef);
      this.directiveService.setInputType(analyticEvent, this.elementRef);
      this.directiveService.setLabel(analyticEvent, this.elementRef);
      this.handleEvent(analyticEvent);
    }
    this.resetInteractionDetail();
  }

  @HostListener('mousedown', ['$event'])
  onMousedown(): void {
    if (this.interactionDetail !== InteractionDetail.touch) {
      this.interactionDetail = InteractionDetail.mouse;
    }
  }

  @HostListener('touchstart', ['$event'])
  onTouchstart(): void {
    this.interactionDetail = InteractionDetail.touch;
  }

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private eventDispatchService: EventDispatchService,
    private directiveService: DirectiveService
  ) {}

  private setInteractionType(analyticEvent: AnalyticEvent): void {
    analyticEvent.interactionType = InteractionType.focus;
  }

  private setInteractionDetail(analyticEvent: AnalyticEvent): void {
    this.interactionDetail ||= InteractionDetail.keyboard;
    analyticEvent.interactionDetail = this.interactionDetail;
  }

  private handleEvent(analyticEvent: AnalyticEvent) {
    this.eventDispatchService.trackFocus(analyticEvent);
  }

  private resetInteractionDetail() {
    this.interactionDetail = undefined;
  }

  private shouldDispatch(analyticEvent: AnalyticEvent): boolean {
    return this.directiveService.shouldDispatch(
      analyticEvent,
      'oculrFocus',
      'https://github.com/Progressive/oculr-ngx/blob/main/docs/focus-directive.md'
    );
  }
}
