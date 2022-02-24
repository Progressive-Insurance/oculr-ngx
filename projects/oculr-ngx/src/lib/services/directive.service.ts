/*
 * @license
 * Copyright 2021-2022 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/progressive-insurance/oculr-ngx/blob/main/LICENSE.md
 */

import { ElementRef, Injectable } from '@angular/core';

import { AnalyticEvent } from '../models/analytic-event.interface';
import { DirectiveEvent } from '../models/directive-event.interface';

@Injectable()
export class DirectiveService {
  getAnalyticEvent(analyticEvent: DirectiveEvent | ''): AnalyticEvent {
    return analyticEvent ? { ...analyticEvent } : { id: '' };
  }

  getInputType(elementRef: ElementRef<HTMLInputElement>): string {
    return elementRef.nativeElement.getAttribute('type') || '';
  }

  getLabel(elementRef: ElementRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): string {
    const labels = elementRef.nativeElement.labels;
    let labelText = '';
    if (labels) {
      labels.forEach((label) => (labelText += label.textContent));
    }
    return labelText;
  }

  getElementName(elementRef: ElementRef<HTMLElement>): string {
    return elementRef.nativeElement.tagName.toLowerCase();
  }

  setElement(analyticEvent: AnalyticEvent, elementRef: ElementRef<HTMLElement>): void {
    analyticEvent.element = this.getElementName(elementRef);
  }

  setInputType(analyticEvent: AnalyticEvent, elementRef: ElementRef<HTMLElement>): void {
    if (this.getElementName(elementRef) === 'input') {
      analyticEvent.inputType = this.getInputType(elementRef as ElementRef<HTMLInputElement>);
    }
  }

  setId(analyticEvent: AnalyticEvent, elementRef: ElementRef<HTMLElement>): void {
    let elementId = elementRef.nativeElement.getAttribute('id');
    if (
      this.getElementName(elementRef) === 'input' &&
      this.getInputType(elementRef as ElementRef<HTMLInputElement>) === 'radio'
    ) {
      const elementName = elementRef.nativeElement.getAttribute('name');
      const reactiveFormName = elementRef.nativeElement.getAttribute('formControlName');
      elementId = reactiveFormName || elementName || elementId;
    }
    if (elementId) {
      analyticEvent.id ||= elementId;
    }
  }

  setLabel(analyticEvent: AnalyticEvent, elementRef: ElementRef<HTMLElement>): void {
    if (['input', 'select', 'textarea'].includes(this.getElementName(elementRef))) {
      analyticEvent.label ||= this.getLabel(
        elementRef as ElementRef<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
      );
    } else {
      const textContent = elementRef.nativeElement.textContent?.trim();
      if (textContent) {
        analyticEvent.label ||= textContent;
      }
    }
  }

  shouldDispatch(analyticEvent: AnalyticEvent, directiveName: string, docUrl: string): boolean {
    if (!analyticEvent.id) {
      console.warn(`
The ${directiveName} directive requires an identifier. This can be done with an id attribute on the
host element, or by binding an AnalyticEvent object. More information can be found here: ${docUrl}
      `);
      return false;
    }
    return true;
  }
}
