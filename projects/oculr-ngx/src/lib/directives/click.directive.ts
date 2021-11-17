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
import { EventDispatchService } from '../services/event-dispatch.service';

@Directive({
  selector: '[oculrClick]',
})
export class ClickDirective {
  @Input('oculrClick') analyticEventInput: AnalyticEvent | '' = '';
  interactionDetail: InteractionDetail | undefined = undefined;

  @HostListener('click', ['$event'])
  onClick(): void {
    const analyticEvent = this.getAnalyticEvent();
    this.setId(analyticEvent);
    if (this.shouldDispatch(analyticEvent)) {
      analyticEvent.interactionType = InteractionType.click;
      this.setInteractionDetail(analyticEvent);
      this.setLabel(analyticEvent);
      this.setHostUrl(analyticEvent);
      this.handleEvent(analyticEvent);
    }
  }

  @HostListener('keydown', ['$event'])
  onKeydown(): void {
    this.interactionDetail = InteractionDetail.keyboard;
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
    private elementRef: ElementRef<HTMLButtonElement | HTMLLinkElement>,
    private eventDispatchService: EventDispatchService
  ) {}

  private getAnalyticEvent(): AnalyticEvent {
    return this.analyticEventInput ? { ...this.analyticEventInput } : { id: '' };
  }

  private setId(analyticEvent: AnalyticEvent): void {
    const elementId = this.elementRef.nativeElement.getAttribute('id');
    if (elementId) {
      analyticEvent.id ||= elementId;
    }
  }

  private setInteractionDetail(analyticEvent: AnalyticEvent): void {
    analyticEvent.interactionDetail = this.interactionDetail;
  }

  private setLabel(analyticEvent: AnalyticEvent): void {
    const hostText = this.elementRef.nativeElement.textContent;
    if (hostText) {
      analyticEvent.label ||= hostText;
    }
  }

  private setHostUrl(analyticEvent: AnalyticEvent): void {
    if (this.elementRef.nativeElement.tagName.toLowerCase() === 'a') {
      analyticEvent.linkUrl =
        this.elementRef.nativeElement.getAttribute('routerLink') ||
        this.elementRef.nativeElement.getAttribute('href') ||
        '';
    }
  }

  private handleEvent(analyticEvent: AnalyticEvent) {
    this.eventDispatchService.trackClick(analyticEvent);
  }

  private shouldDispatch(analyticEvent: AnalyticEvent): boolean {
    if (!analyticEvent.id) {
      console.warn(
        `The oculrClick directive requires an identifier. This can be done with an id attribute on the
        host element, or by binding an Event object. More information can be found here:
        https://github.com/Progressive/oculr-ngx/blob/main/docs/click-directive.md`
      );
      return false;
    }
    return true;
  }
}
