/*
 * @license
 * Copyright (c) 2025 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
 */

import { ElementRef } from '@angular/core';
import { AnalyticEvent } from '../models/analytic-event.interface';
import { DirectiveService } from './directive.service';

describe('DirectiveService', () => {
  let service: DirectiveService;

  beforeEach(() => (service = new DirectiveService()));

  describe('getAnalyticEvent', () => {
    it('should return a clone of the analytic event provided', () => {
      const event = { id: 'test', label: 'value' };
      const result = service.getAnalyticEvent(event);
      expect(result).toEqual(event);
    });
    it('should provide an empty event if one is not provided', () => {
      const result = service.getAnalyticEvent('');
      expect(result).toEqual({ id: '' });
    });
  });

  describe('getInputType', () => {
    it('should return the type attribute value of an element', () => {
      const nativeElement: HTMLInputElement = document.createElement('input');
      nativeElement.type = 'radio';
      const element: ElementRef<HTMLInputElement> = new ElementRef<HTMLInputElement>(nativeElement);

      const result = service.getInputType(element);

      expect(result).toEqual('radio');
    });

    it('should return an empty string when no type attribute is set', () => {
      const nativeElement: HTMLInputElement = document.createElement('input');
      const element: ElementRef<HTMLInputElement> = new ElementRef<HTMLInputElement>(nativeElement);

      const result = service.getInputType(element);

      expect(result).toEqual('');
    });
  });

  describe('getLabel', () => {
    let formElement: HTMLFormElement;
    let nativeElement: HTMLInputElement;
    let element: ElementRef<HTMLInputElement>;

    beforeEach(() => {
      nativeElement = document.createElement('input');
      nativeElement.id = 'target';
      formElement = document.createElement('form');
      formElement.appendChild(nativeElement);

      document.body.appendChild(formElement);

      element = new ElementRef<HTMLInputElement>(nativeElement);
    });

    it('should create a string of the label elements within an element', () => {
      const labelOne = document.createElement('label');
      labelOne.setAttribute('for', 'target');
      labelOne.textContent = ' hello ';
      formElement.appendChild(labelOne);

      const labelTwo = document.createElement('label');
      labelTwo.setAttribute('for', 'target');
      labelTwo.textContent = ' world ';
      formElement.appendChild(labelTwo);

      const result = service.getLabel(element);

      expect(result).toEqual(' hello  world ');
    });

    it('should return an empty string if no labels exist', () => {
      const result = service.getLabel(element);
      expect(result).toEqual('');
    });

    afterEach(() => {
      document.body.removeChild(formElement);
    });
  });

  describe('getElementName', () => {
    it('should return the lowercase representation of an element tag name', () => {
      const nativeElement: HTMLInputElement = document.createElement('input');
      const element: ElementRef<HTMLInputElement> = new ElementRef<HTMLInputElement>(nativeElement);

      const result = service.getElementName(element);

      expect(result).toEqual('input');
    });
  });

  describe('setElement', () => {
    it('should set the element property of an event to the element name', () => {
      const event: AnalyticEvent = { id: 'event' };
      const nativeElement: HTMLInputElement = document.createElement('input');
      const element: ElementRef<HTMLInputElement> = new ElementRef<HTMLInputElement>(nativeElement);

      service.setElement(event, element);

      expect(event.element).toEqual('input');
    });
  });

  describe('setInputType', () => {
    it('should set the inputType property of an event from an input element type', () => {
      const event: AnalyticEvent = { id: 'event' };
      const nativeElement: HTMLInputElement = document.createElement('input');
      nativeElement.type = 'radio';
      const element: ElementRef<HTMLInputElement> = new ElementRef<HTMLInputElement>(nativeElement);

      service.setInputType(event, element);

      expect(event.inputType).toEqual('radio');
    });

    it('should not set inputType when the element is not an input element', () => {
      const event: AnalyticEvent = { id: 'event' };
      const nativeElement: HTMLDivElement = document.createElement('div');
      const element: ElementRef<HTMLDivElement> = new ElementRef<HTMLDivElement>(nativeElement);

      service.setInputType(event, element);

      expect(event.inputType).not.toBeDefined();
    });
  });

  describe('setId', () => {
    let event: AnalyticEvent;

    beforeEach(() => (event = { label: 'label' }));

    it('should set the event id property to an element id property for non-radio elements', () => {
      const nativeElement: HTMLInputElement = document.createElement('input');
      nativeElement.id = 'input-id';
      const element: ElementRef<HTMLInputElement> = new ElementRef<HTMLInputElement>(nativeElement);

      service.setId(event, element);

      expect(event.id).toEqual('input-id');
    });

    it('should always leave an event id alone if it is preset', () => {
      event.id = 'pre-set';
      const nativeElement: HTMLInputElement = document.createElement('input');
      nativeElement.id = 'input-id';
      const element: ElementRef<HTMLInputElement> = new ElementRef<HTMLInputElement>(nativeElement);

      service.setId(event, element);

      expect(event.id).toEqual('pre-set');
    });

    describe('for radio inputs', () => {
      let nativeElement: HTMLInputElement;
      let element: ElementRef<HTMLInputElement>;

      beforeEach(() => {
        nativeElement = document.createElement('input');
        nativeElement.id = 'input-id';
        nativeElement.type = 'radio';
        element = new ElementRef<HTMLInputElement>(nativeElement);
      });

      it('should prefer the formControlName over the name or id props', () => {
        nativeElement.setAttribute('formControlName', 'form-control-name');
        nativeElement.name = 'control-name';

        service.setId(event, element);

        expect(event.id).toEqual('form-control-name');
      });

      it('should prefer the name prop over the id prop', () => {
        nativeElement.name = 'control-name';
        service.setId(event, element);
        expect(event.id).toEqual('control-name');
      });

      it('should use the id prop as a fallback when others are not set', () => {
        service.setId(event, element);
        expect(event.id).toEqual('input-id');
      });

      it('should always leave an event id alone if it is preset', () => {
        event.id = 'pre-set';
        nativeElement.setAttribute('formControlName', 'form-control-name');
        nativeElement.name = 'control-name';

        service.setId(event, element);

        expect(event.id).toEqual('pre-set');
      });
    });
  });

  describe('setLabel', () => {
    let event: AnalyticEvent;
    let formElement: HTMLFormElement;

    beforeEach(() => {
      event = { id: 'event' };
      formElement = document.createElement('form');
      document.body.appendChild(formElement);
    });

    it('should set an event label using an input labels property', () => {
      const nativeElement = document.createElement('input');
      nativeElement.id = 'target';
      formElement.appendChild(nativeElement);

      const label = document.createElement('label');
      label.setAttribute('for', 'target');
      label.textContent = 'input label';
      formElement.appendChild(label);

      const element = new ElementRef<HTMLInputElement>(nativeElement);

      service.setLabel(event, element);

      expect(event.label).toEqual('input label');
    });

    it('should set an event label using a select labels property', () => {
      const nativeElement = document.createElement('select');
      nativeElement.id = 'target';
      formElement.appendChild(nativeElement);

      const label = document.createElement('label');
      label.setAttribute('for', 'target');
      label.textContent = 'input label';
      formElement.appendChild(label);

      const element = new ElementRef<HTMLSelectElement>(nativeElement);

      service.setLabel(event, element);

      expect(event.label).toEqual('input label');
    });

    it('should set an event label using a textarea labels property', () => {
      const nativeElement = document.createElement('textarea');
      nativeElement.id = 'target';
      formElement.appendChild(nativeElement);

      const label = document.createElement('label');
      label.setAttribute('for', 'target');
      label.textContent = 'input label';
      formElement.appendChild(label);

      const element = new ElementRef<HTMLTextAreaElement>(nativeElement);

      service.setLabel(event, element);

      expect(event.label).toEqual('input label');
    });

    it('should keep a pre-existing label value if one is set for input, select and textarea controls', () => {
      const nativeElement = document.createElement('input');
      nativeElement.id = 'target';
      formElement.appendChild(nativeElement);

      const label = document.createElement('label');
      label.setAttribute('for', 'target');
      label.textContent = 'input label';
      formElement.appendChild(label);

      const element = new ElementRef<HTMLInputElement>(nativeElement);

      event.label = 'pre-existing';

      service.setLabel(event, element);

      expect(event.label).toEqual('pre-existing');
    });

    it('should set an event label using any other element labels property', () => {
      const nativeElement = document.createElement('div');
      nativeElement.textContent = 'text content';
      formElement.appendChild(nativeElement);

      const element = new ElementRef<HTMLDivElement>(nativeElement);

      service.setLabel(event, element);

      expect(event.label).toEqual('text content');
    });

    it('should safely handle the non-existence of a textContent property', () => {
      const nativeElement = document.createElement('div');
      formElement.appendChild(nativeElement);

      const element = new ElementRef<HTMLDivElement>(nativeElement);

      service.setLabel(event, element);

      expect(event.label).toBeUndefined();
    });

    it('should keep a pre-existing label value if one is set for any other type of control', () => {
      const nativeElement = document.createElement('div');
      nativeElement.textContent = 'text content';
      formElement.appendChild(nativeElement);

      const element = new ElementRef<HTMLDivElement>(nativeElement);

      event.label = 'pre-existing';

      service.setLabel(event, element);

      expect(event.label).toEqual('pre-existing');
    });

    afterEach(() => document.body.removeChild(formElement));
  });

  describe('shouldDispatch', () => {
    let event: AnalyticEvent;

    beforeEach(() => (event = { label: 'label' }));

    it('should return false and warn the user when the event id property is not set', () => {
      const directiveName = 'oculr-change';
      const docUrl = 'https://espn.com';
      vi.spyOn(console, 'warn');

      const result = service.shouldDispatch(event, directiveName, docUrl);

      expect(result).toBe(false);
      expect(console.warn).toHaveBeenCalled();
    });

    it('should return true when the event id property is set', () => {
      const directiveName = 'oculr-change';
      const docUrl = 'https://espn.com';
      vi.spyOn(console, 'warn');
      event.id = 'id';

      const result = service.shouldDispatch(event, directiveName, docUrl);

      expect(result).toBe(true);
      expect(console.warn).not.toHaveBeenCalled();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });
  });
});
