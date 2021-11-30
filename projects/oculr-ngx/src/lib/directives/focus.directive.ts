/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

import { Directive, ElementRef, HostListener, Input } from '@angular/core';

import { AnalyticEvent } from '../models/analytic-event.interface';
import { InputType } from '../models/input-type.enum';
import { InteractionDetail } from '../models/interaction-detail.enum';
import { InteractionType } from '../models/interaction-type.enum';
import { EventDispatchService } from '../services/event-dispatch.service';

@Directive({
  selector: '[oculrFocus]',
})
export class FocusDirective {
  @Input('oculrFocus') analyticEventInput: AnalyticEvent | '' = '';
  interactionDetail: InteractionDetail | undefined = undefined;

  @HostListener('focus', ['$event'])
  onFocus(): void {
    const analyticEvent = this.getAnalyticEvent();
    this.setId(analyticEvent);
    if (this.shouldDispatch(analyticEvent)) {
      analyticEvent.interactionType = InteractionType.focus;
      this.setInteractionDetail(analyticEvent);
      this.setElement(analyticEvent);
      this.setInputType(analyticEvent);
      this.setLabel(analyticEvent);
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

  constructor(private elementRef: ElementRef<HTMLElement>, private eventDispatchService: EventDispatchService) {}

  private getAnalyticEvent(): AnalyticEvent {
    return this.analyticEventInput ? { ...this.analyticEventInput } : { id: '' };
  }

  private getLabel(): string {
    const labels = (this.elementRef.nativeElement as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).labels;
    let labelText = '';
    if (labels) {
      labels.forEach((label) => (labelText += label.textContent));
    }
    return labelText;
  }

  private setId(analyticEvent: AnalyticEvent): void {
    const elementId = this.elementRef.nativeElement.getAttribute('id');
    if (elementId) {
      analyticEvent.id ||= elementId;
    }
  }

  private setInteractionDetail(analyticEvent: AnalyticEvent): void {
    this.interactionDetail ||= InteractionDetail.keyboard;
    analyticEvent.interactionDetail = this.interactionDetail;
  }

  private setElement(analyticEvent: AnalyticEvent): void {
    analyticEvent.element = this.elementRef.nativeElement.tagName.toLowerCase();
  }

  private setInputType(analyticEvent: AnalyticEvent): void {
    if (analyticEvent.element === 'input') {
      analyticEvent.inputType = this.elementRef.nativeElement.getAttribute('type') as InputType;
    }
  }

  private setLabel(analyticEvent: AnalyticEvent): void {
    if (analyticEvent.element && ['input', 'select', 'textarea'].includes(analyticEvent.element))
      analyticEvent.label ||= this.getLabel();
  }

  private handleEvent(analyticEvent: AnalyticEvent) {
    this.eventDispatchService.trackFocus(analyticEvent);
  }

  private resetInteractionDetail() {
    this.interactionDetail = undefined;
  }

  private shouldDispatch(analyticEvent: AnalyticEvent): boolean {
    if (!analyticEvent.id) {
      console.warn(`
The oculrFocus directive requires an identifier. This can be done with an id attribute on the
host element, or by binding an AnalyticEvent object. More information can be found here:
https://github.com/Progressive/oculr-ngx/blob/main/docs/focus-directive.md
      `);
      return false;
    }
    return true;
  }
}
