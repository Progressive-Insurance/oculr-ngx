/*
 * @license
 * Copyright 2021-2022 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/progressive-insurance/oculr-ngx/blob/main/LICENSE.md
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

  @HostListener('change', ['$event'])
  onChange(): void {
    if (this.successfulInit) {
      const analyticEvent = this.directiveService.getAnalyticEvent(this.directiveEvent);
      this.directiveService.setId(analyticEvent, this.elementRef);
      if (this.shouldDispatch(analyticEvent)) {
        this.setInteractionType(analyticEvent);
        this.setInteractionDetail(analyticEvent);
        this.directiveService.setElement(analyticEvent, this.elementRef);
        this.directiveService.setInputType(analyticEvent, this.elementRef);
        this.directiveService.setLabel(analyticEvent, this.elementRef);
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
    private dispatchService: DispatchService,
    private directiveService: DirectiveService
  ) {}

  ngOnInit(): void {
    this.checkHost();
  }

  private setInteractionType(analyticEvent: AnalyticEvent): void {
    analyticEvent.interactionType = InteractionType.change;
  }

  private setInteractionDetail(analyticEvent: AnalyticEvent): void {
    analyticEvent.interactionDetail = this.interactionDetail;
  }

  private setValue(analyticEvent: AnalyticEvent): void {
    const elementName = this.directiveService.getElementName(this.elementRef);
    let element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    switch (elementName) {
      case 'input':
        this.setInputValue(analyticEvent);
        break;
      case 'select':
        element = this.elementRef.nativeElement as HTMLSelectElement;
        analyticEvent.value = element.value;
        analyticEvent.displayValue = element.options[element.selectedIndex].text;
        break;
      case 'textarea':
        element = this.elementRef.nativeElement as HTMLTextAreaElement;
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
    if (
      elementName !== 'select' &&
      elementName !== 'textarea' &&
      !this.supportedInputTypes.includes(
        this.directiveService.getInputType(this.elementRef as ElementRef<HTMLInputElement>)
      )
    ) {
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
