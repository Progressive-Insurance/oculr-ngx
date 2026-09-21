/*
 * @license
 * Copyright (c) 2025 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
*/

import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { AnalyticEvent } from '../models/analytic-event.interface';
import { DirectiveEvent } from '../models/directive-event.interface';
import { InteractionDetail } from '../models/interaction-detail.enum';
import { InteractionType } from '../models/interaction-type.enum';
import { DirectiveService } from '../services/directive.service';
import { DispatchService } from '../services/dispatch.service';

@Directive({
    selector: '[oculrChange]',
    standalone: false
})
export class ChangeDirective implements OnInit {
  @Input('oculrChange') directiveEvent: DirectiveEvent | '' = '';
  @Input() sensitiveData = false;
  successfulInit = true;
  interactionDetail: InteractionDetail | undefined = undefined;
  supportedInputTypes = ['checkbox', 'date', 'number', 'radio', 'search', 'text'];

  @HostListener('change')
  onChange(): void {
    try {
      if (this.successfulInit) {
        const analyticEvent = this.directiveService.getAnalyticEvent(this.directiveEvent);
        this.directiveService.setId(analyticEvent, this.elementRef);
        if (this.shouldDispatch(analyticEvent)) {
          this.setInteractionType(analyticEvent);
          this.setInteractionDetail(analyticEvent);
          this.directiveService.setElement(analyticEvent, this.elementRef);
          this.directiveService.setInputType(analyticEvent, this.elementRef);
          if (!this.isSensitiveAnswerControl()) {
            this.directiveService.setLabel(analyticEvent, this.elementRef);
          }
          if (!this.sensitiveData) {
            this.setValue(analyticEvent);
          }
          this.handleEvent(analyticEvent);
        }
      }
    } finally {
      this.resetInteractionDetail();
    }
  }

  @HostListener('keydown')
  onKeydown(): void {
    this.interactionDetail = InteractionDetail.keyboard;
  }

  @HostListener('mousedown')
  onMousedown(): void {
    if (this.interactionDetail !== InteractionDetail.touch) {
      this.interactionDetail = InteractionDetail.mouse;
    }
  }

  @HostListener('touchstart')
  onTouchstart(): void {
    this.interactionDetail = InteractionDetail.touch;
  }

  constructor(
    private elementRef: ElementRef<HTMLSelectElement | HTMLTextAreaElement | HTMLInputElement>,
    private dispatchService: DispatchService,
    private directiveService: DirectiveService
  ) {}

  ngOnInit(): void {
    this.checkHost();
  }

  private isSensitiveAnswerControl(): boolean {
    return (
      this.sensitiveData &&
      this.directiveService.getElementName(this.elementRef) === 'input' &&
      ['checkbox', 'radio'].includes(
        this.directiveService.getInputType(this.elementRef as ElementRef<HTMLInputElement>)
      )
    );
  }

  private setInteractionType(analyticEvent: AnalyticEvent): void {
    analyticEvent.interactionType = InteractionType.change;
  }

  private setInteractionDetail(analyticEvent: AnalyticEvent): void {
    analyticEvent.interactionDetail = this.interactionDetail;
  }

  private resetInteractionDetail(): void {
    this.interactionDetail = undefined;
  }

  private setValue(analyticEvent: AnalyticEvent): void {
    const elementName = this.directiveService.getElementName(this.elementRef);
    let element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    switch (elementName) {
      case 'input':
        this.setInputValue(analyticEvent);
        break;
      case 'select':
        if (this.elementRef.nativeElement instanceof HTMLSelectElement) {
          element = this.elementRef.nativeElement;
          analyticEvent.value = element.value;
          const selectedOption = element.options[element.selectedIndex];
          if (selectedOption) {
            analyticEvent.displayValue = selectedOption.text;
          }
        }
        break;
      case 'textarea':
        element = this.elementRef.nativeElement;
        analyticEvent.value = element.value;
        break;
      default:
        break;
    }
  }

  private setInputValue(analyticEvent: AnalyticEvent): void {
    const element = this.elementRef.nativeElement as HTMLInputElement;
    switch (this.directiveService.getInputType(this.elementRef as ElementRef<HTMLInputElement>)) {
      case 'checkbox':
        analyticEvent.value = element.checked ? 'checked' : 'cleared';
        analyticEvent.displayValue = this.directiveService.getLabel(this.elementRef);
        break;
      case 'date':
      case 'number':
      case 'search':
      case 'text':
        analyticEvent.value = element.value;
        break;
      case 'radio':
        analyticEvent.value = element.value;
        analyticEvent.displayValue = this.directiveService.getLabel(this.elementRef);
        break;
      default:
        break;
    }
  }

  private handleEvent(analyticEvent: AnalyticEvent) {
    this.dispatchService.trackChange(analyticEvent);
  }

  private checkHost(): void {
    const elementName = this.directiveService.getElementName(this.elementRef);
    const isSupportedInput =
      elementName === 'input' &&
      this.supportedInputTypes.includes(
        this.directiveService.getInputType(this.elementRef as ElementRef<HTMLInputElement>)
      );
    if (elementName !== 'select' && elementName !== 'textarea' && !isSupportedInput) {
      this.successfulInit = false;
      console.warn(`
The oculrChange directive only works with select, textarea, or input elements of the following types.
${this.supportedInputTypes.join('\r\n')}
More information can be found here: https://github.com/progressive-insurance/oculr-ngx/blob/main/docs/change-directive.md
      `);
    }
  }

  private shouldDispatch(analyticEvent: AnalyticEvent): boolean {
    return this.directiveService.shouldDispatch(
      analyticEvent,
      'oculrChange',
      'https://github.com/progressive-insurance/oculr-ngx/blob/main/docs/change-directive.md'
    );
  }
}
