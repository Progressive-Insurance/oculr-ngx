/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';

import { AnalyticEvent } from '../models/analytic-event.interface';
import { InputType } from '../models/input-type.enum';
import { InteractionDetail } from '../models/interaction-detail.enum';
import { InteractionType } from '../models/interaction-type.enum';
import { EventDispatchService } from '../services/event-dispatch.service';

@Directive({
  selector: '[oculrChange]',
})
export class ChangeDirective implements OnInit {
  @Input('oculrChange') analyticEventInput: AnalyticEvent | '' = '';
  @Input() sensitiveData = false;
  successfulInit = true;
  interactionDetail: InteractionDetail | undefined = undefined;
  supportedInputTypes = [
    InputType.checkbox,
    InputType.date,
    InputType.number,
    InputType.radio,
    InputType.search,
    InputType.text,
  ];

  @HostListener('change', ['$event'])
  onChange(): void {
    if (this.successfulInit) {
      const analyticEvent = this.getAnalyticEvent();
      this.setId(analyticEvent);
      if (this.shouldDispatch(analyticEvent)) {
        analyticEvent.interactionType = InteractionType.change;
        this.setInteractionDetail(analyticEvent);
        this.setInput(analyticEvent);
        this.setLabel(analyticEvent);
        if (!this.sensitiveData) {
          this.setValue(analyticEvent);
        }
        this.handleEvent(analyticEvent);
      }
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
    private elementRef: ElementRef<HTMLSelectElement | HTMLTextAreaElement | HTMLInputElement>,
    private eventDispatchService: EventDispatchService
  ) {}

  ngOnInit(): void {
    this.checkHost();
  }

  private getAnalyticEvent(): AnalyticEvent {
    return this.analyticEventInput ? { ...this.analyticEventInput } : { id: '' };
  }

  private getLabel(): string {
    const labels = this.elementRef.nativeElement.labels;
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
    analyticEvent.interactionDetail = this.interactionDetail;
  }

  private setInput(analyticEvent: AnalyticEvent): void {
    const elementName = this.elementRef.nativeElement.tagName.toLowerCase();
    analyticEvent.inputType =
      elementName === 'input'
        ? (this.elementRef.nativeElement.getAttribute('type') as InputType)
        : (elementName as InputType);
  }

  private setLabel(analyticEvent: AnalyticEvent): void {
    analyticEvent.label ||= this.getLabel();
  }

  private setValue(analyticEvent: AnalyticEvent): void {
    let element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    switch (analyticEvent.inputType) {
      case InputType.checkbox:
        element = this.elementRef.nativeElement as HTMLInputElement;
        analyticEvent.value = element.checked ? 'checked' : 'cleared';
        analyticEvent.displayValue = this.getLabel();
        break;
      case InputType.date:
      case InputType.number:
      case InputType.search:
      case InputType.text:
        element = this.elementRef.nativeElement as HTMLInputElement;
        analyticEvent.value = element.value;
        break;
      case InputType.radio:
        element = this.elementRef.nativeElement as HTMLInputElement;
        analyticEvent.value = element.value;
        analyticEvent.displayValue = this.getLabel();
        break;
      case InputType.select:
        element = this.elementRef.nativeElement as HTMLSelectElement;
        analyticEvent.value = element.value;
        analyticEvent.displayValue = element.options[element.selectedIndex].text;
        break;
      case InputType.textarea:
        element = this.elementRef.nativeElement as HTMLTextAreaElement;
        analyticEvent.value = element.value;
        break;
      default:
        break;
    }
  }

  private handleEvent(analyticEvent: AnalyticEvent) {
    this.eventDispatchService.trackChange(analyticEvent);
  }

  private checkHost(): void {
    if (
      !['select', 'textarea'].includes(this.elementRef.nativeElement.tagName.toLowerCase()) &&
      !this.supportedInputTypes.includes((this.elementRef.nativeElement.getAttribute('type') || '') as InputType)
    ) {
      this.successfulInit = false;
      console.warn(`
The oculrChange directive only works with select, textarea, or input elements of the following types.
${this.supportedInputTypes.join('\r\n')}
More information can be found here: https://github.com/Progressive/oculr-ngx/blob/main/docs/change-directive.md
      `);
    }
  }

  private shouldDispatch(analyticEvent: AnalyticEvent): boolean {
    if (!analyticEvent.id) {
      console.warn(`
The oculrChange directive requires an identifier. This can be done with an id attribute on the
host element, or by binding an AnalyticEvent object. More information can be found here:
https://github.com/Progressive/oculr-ngx/blob/main/docs/change-directive.md
      `);
      return false;
    }
    return true;
  }
}
