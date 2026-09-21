import type { Mock } from 'vitest';
/*
 * @license
 * Copyright (c) 2025 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
 */

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ReactiveFormsModule, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { AnalyticEvent } from '../models/analytic-event.interface';
import { DirectiveEvent } from '../models/directive-event.interface';
import { InteractionDetail } from '../models/interaction-detail.enum';
import { InteractionType } from '../models/interaction-type.enum';
import { OculrAngularModule } from '../oculr-ngx.module';
import { DirectiveService } from '../services/directive.service';
import { DispatchService } from '../services/dispatch.service';
import { ChangeDirective } from './change.directive';

describe('ChangeDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let mockDispatchService: any;
  let warnSpy: Mock;

  beforeEach(() => {
    mockDispatchService = {
      trackChange: vi.fn(),
    };
    warnSpy = vi.spyOn(console, 'warn');

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, TestComponent, NotSupportedComponent],
      declarations: [ChangeDirective],
      providers: [{ provide: DispatchService, useValue: mockDispatchService }, DirectiveService],
    });
    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('input checkbox', () => {
    let expectedEvent: AnalyticEvent;

    beforeEach(() => {
      expectedEvent = {
        id: 'attestation',
        element: 'input',
        interactionType: InteractionType.change,
        interactionDetail: InteractionDetail.mouse,
        inputType: 'checkbox',
        label: 'Do you agree to the terms?',
        value: 'checked',
        displayValue: 'Do you agree to the terms?',
      };
    });

    it('dispatches a change event when clicked with a mouse', async () => {
      vi.useFakeTimers();
      const input = fixture.nativeElement.querySelector('#attestation');
      input.dispatchEvent(new Event('mousedown'));
      input.click();
      await vi.runAllTimersAsync();
      expect(mockDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockDispatchService.trackChange).toHaveBeenCalledWith(expectedEvent);
      vi.useRealTimers();
    });

    it('dispatches a change event when using a keyboard', async () => {
      vi.useFakeTimers();
      expectedEvent.interactionDetail = InteractionDetail.keyboard;
      const input = fixture.nativeElement.querySelector('#attestation');
      input.dispatchEvent(new Event('keydown'));
      input.click();
      await vi.runAllTimersAsync();
      expect(mockDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockDispatchService.trackChange).toHaveBeenCalledWith(expectedEvent);
      vi.useRealTimers();
    });

    it('dispatches a change event when using touch', async () => {
      vi.useFakeTimers();
      expectedEvent.interactionDetail = InteractionDetail.touch;
      const input = fixture.nativeElement.querySelector('#attestation');
      input.dispatchEvent(new Event('touchstart'));
      input.dispatchEvent(new Event('mousedown'));
      input.click();
      await vi.runAllTimersAsync();
      expect(mockDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockDispatchService.trackChange).toHaveBeenCalledWith(expectedEvent);
      vi.useRealTimers();
    });

    it('prioritizes event properties over host element attributes', async () => {
      vi.useFakeTimers();
      expectedEvent.id = 'updates';
      expectedEvent.label = 'Update notification';
      expectedEvent.displayValue = 'Yes';
      const input = fixture.nativeElement.querySelector('#notify');
      input.dispatchEvent(new Event('mousedown'));
      input.click();
      await vi.runAllTimersAsync();
      expect(mockDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockDispatchService.trackChange).toHaveBeenCalledWith(expectedEvent);
      vi.useRealTimers();
    });

    it('dispatches a change event when cleared', async () => {
      vi.useFakeTimers();
      expectedEvent.id = 'feedback';
      expectedEvent.label = 'Would you like to provide feedback?';
      expectedEvent.displayValue = 'Would you like to provide feedback?';
      expectedEvent.value = 'cleared';
      const input = fixture.nativeElement.querySelector('#feedback');
      input.dispatchEvent(new Event('mousedown'));
      input.click();
      await vi.runAllTimersAsync();
      expect(mockDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockDispatchService.trackChange).toHaveBeenCalledWith(expectedEvent);
      vi.useRealTimers();
    });
  });

  describe('input date', () => {
    let expectedEvent: AnalyticEvent;

    beforeEach(() => {
      expectedEvent = {
        id: 'return',
        element: 'input',
        interactionType: InteractionType.change,
        interactionDetail: InteractionDetail.keyboard,
        inputType: 'date',
        label: 'Return date:',
      };
    });

    it('dispatches a change event when changed', async () => {
      vi.useFakeTimers();
      expectedEvent.value = '2021-11-16';
      const input = fixture.nativeElement.querySelector('#return');
      input.dispatchEvent(new Event('keydown'));
      input.value = '2021-11-16';
      input.dispatchEvent(new Event('change'));
      await vi.runAllTimersAsync();
      expect(mockDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockDispatchService.trackChange).toHaveBeenCalledWith(expectedEvent);
      vi.useRealTimers();
    });

    it('does not dispatch a change event due to sensitive data', async () => {
      vi.useFakeTimers();
      expectedEvent.id = 'dob';
      expectedEvent.label = 'Date of birth:';
      const input = fixture.nativeElement.querySelector('#dob');
      input.dispatchEvent(new Event('keydown'));
      input.value = '2001-11-16';
      input.dispatchEvent(new Event('change'));
      await vi.runAllTimersAsync();
      expect(mockDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockDispatchService.trackChange).toHaveBeenCalledWith(expectedEvent);
      vi.useRealTimers();
    });
  });

  describe('input number', () => {
    let expectedEvent: AnalyticEvent;

    beforeEach(() => {
      expectedEvent = {
        id: 'weekDays',
        element: 'input',
        interactionType: InteractionType.change,
        interactionDetail: InteractionDetail.keyboard,
        inputType: 'number',
        label: 'How many weekdays?',
        value: '5',
      };
    });

    it('dispatches a change event when changed', async () => {
      vi.useFakeTimers();
      const input = fixture.nativeElement.querySelector('#weekDays');
      input.dispatchEvent(new Event('keydown'));
      input.value = '5';
      input.dispatchEvent(new Event('change'));
      await vi.runAllTimersAsync();
      expect(mockDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockDispatchService.trackChange).toHaveBeenCalledWith(expectedEvent);
      vi.useRealTimers();
    });
  });

  describe('input search', () => {
    let expectedEvent: AnalyticEvent;

    beforeEach(() => {
      expectedEvent = {
        id: 'search',
        element: 'input',
        interactionType: InteractionType.change,
        interactionDetail: InteractionDetail.keyboard,
        inputType: 'search',
        label: 'What are you looking for?',
        value: 'things',
      };
    });

    it('dispatches a change event when changed', async () => {
      vi.useFakeTimers();
      const input = fixture.nativeElement.querySelector('#search');
      input.dispatchEvent(new Event('keydown'));
      input.value = 'things';
      input.dispatchEvent(new Event('change'));
      await vi.runAllTimersAsync();
      expect(mockDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockDispatchService.trackChange).toHaveBeenCalledWith(expectedEvent);
      vi.useRealTimers();
    });
  });

  describe('input text', () => {
    let expectedEvent: AnalyticEvent;

    beforeEach(() => {
      expectedEvent = {
        id: 'petName',
        element: 'input',
        interactionType: InteractionType.change,
        interactionDetail: InteractionDetail.keyboard,
        inputType: 'text',
        label: `Your pet's name:`,
        value: 'Spot',
      };
    });

    it('dispatches a change event when changed', async () => {
      vi.useFakeTimers();
      const input = fixture.nativeElement.querySelector('#petName');
      input.dispatchEvent(new Event('keydown'));
      input.value = 'Spot';
      input.dispatchEvent(new Event('change'));
      await vi.runAllTimersAsync();
      expect(mockDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockDispatchService.trackChange).toHaveBeenCalledWith(expectedEvent);
      vi.useRealTimers();
    });
  });

  describe('input with an effective type', () => {
    let expectedEvent: AnalyticEvent;

    beforeEach(() => {
      expectedEvent = {
        element: 'input',
        interactionType: InteractionType.change,
        interactionDetail: InteractionDetail.keyboard,
        inputType: 'text',
      };
    });

    it('dispatches a change event when the type attribute is missing', async () => {
      vi.useFakeTimers();
      expectedEvent.id = 'noType';
      expectedEvent.label = 'No type attribute:';
      expectedEvent.value = 'hello';
      const input = fixture.nativeElement.querySelector('#noType');
      input.dispatchEvent(new Event('keydown'));
      input.value = 'hello';
      input.dispatchEvent(new Event('change'));
      await vi.runAllTimersAsync();
      expect(mockDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockDispatchService.trackChange).toHaveBeenCalledWith(expectedEvent);
      vi.useRealTimers();
    });

    it('dispatches a change event when the type attribute is uppercase', async () => {
      vi.useFakeTimers();
      expectedEvent.id = 'upperText';
      expectedEvent.label = 'Uppercase type:';
      expectedEvent.value = 'hello';
      const input = fixture.nativeElement.querySelector('#upperText');
      input.dispatchEvent(new Event('keydown'));
      input.value = 'hello';
      input.dispatchEvent(new Event('change'));
      await vi.runAllTimersAsync();
      expect(mockDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockDispatchService.trackChange).toHaveBeenCalledWith(expectedEvent);
      vi.useRealTimers();
    });

    it('dispatches a change event when the type attribute is browser-invalid', async () => {
      vi.useFakeTimers();
      expectedEvent.id = 'invalidType';
      expectedEvent.label = 'Invalid type:';
      expectedEvent.value = 'hello';
      const input = fixture.nativeElement.querySelector('#invalidType');
      input.dispatchEvent(new Event('keydown'));
      input.value = 'hello';
      input.dispatchEvent(new Event('change'));
      await vi.runAllTimersAsync();
      expect(mockDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockDispatchService.trackChange).toHaveBeenCalledWith(expectedEvent);
      vi.useRealTimers();
    });
  });

  describe('input radio', () => {
    let expectedEvent: AnalyticEvent;

    beforeEach(() => {
      expectedEvent = {
        id: 'dragon',
        element: 'input',
        interactionType: InteractionType.change,
        interactionDetail: InteractionDetail.mouse,
        inputType: 'radio',
        label: 'Dragon',
        value: 'dragon',
        displayValue: 'Dragon',
      };
    });

    it('dispatches a change event when changed', async () => {
      vi.useFakeTimers();
      const input = fixture.nativeElement.querySelector('#dragon');
      input.dispatchEvent(new Event('mousedown'));
      input.click();
      await vi.runAllTimersAsync();
      expect(mockDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockDispatchService.trackChange).toHaveBeenCalledWith(expectedEvent);
      vi.useRealTimers();
    });

    it('uses the reactive form attribute formControlName for id', async () => {
      vi.useFakeTimers();
      expectedEvent.id = 'favoriteSeason';
      expectedEvent.label = 'Summer';
      expectedEvent.value = 'summer';
      expectedEvent.displayValue = 'Summer';
      const input = fixture.nativeElement.querySelector('#summer');
      input.dispatchEvent(new Event('mousedown'));
      input.click();
      await vi.runAllTimersAsync();
      expect(mockDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockDispatchService.trackChange).toHaveBeenCalledWith(expectedEvent);
      vi.useRealTimers();
    });

    it('uses the attribute name for id', async () => {
      vi.useFakeTimers();
      expectedEvent.id = 'favoriteCookie';
      expectedEvent.label = 'Chocolate chip';
      expectedEvent.value = 'chocolateChip';
      expectedEvent.displayValue = 'Chocolate chip';
      const input = fixture.nativeElement.querySelector('#chocolateChip');
      input.dispatchEvent(new Event('mousedown'));
      input.click();
      await vi.runAllTimersAsync();
      expect(mockDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockDispatchService.trackChange).toHaveBeenCalledWith(expectedEvent);
      vi.useRealTimers();
    });

    it('uses the attribute name for id when the type attribute is uppercase', async () => {
      vi.useFakeTimers();
      expectedEvent.id = 'upperRadioName';
      expectedEvent.label = 'Upper radio';
      expectedEvent.value = 'upper';
      expectedEvent.displayValue = 'Upper radio';
      const input = fixture.nativeElement.querySelector('#upperRadio');
      input.dispatchEvent(new Event('mousedown'));
      input.click();
      await vi.runAllTimersAsync();
      expect(mockDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockDispatchService.trackChange).toHaveBeenCalledWith(expectedEvent);
      vi.useRealTimers();
    });
  });

  describe('sensitive checkbox and radio', () => {
    it('does not capture the linked label, value, or display value for a sensitive checkbox', async () => {
      vi.useFakeTimers();
      const input = fixture.nativeElement.querySelector('#sensitiveAttestation');
      input.dispatchEvent(new Event('mousedown'));
      input.click();
      await vi.runAllTimersAsync();
      expect(mockDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockDispatchService.trackChange).toHaveBeenCalledWith({
        id: 'sensitiveAttestation',
        element: 'input',
        interactionType: InteractionType.change,
        interactionDetail: InteractionDetail.mouse,
        inputType: 'checkbox',
      });
      vi.useRealTimers();
    });

    it('does not capture the linked label, value, or display value for a sensitive radio', async () => {
      vi.useFakeTimers();
      const input = fixture.nativeElement.querySelector('#sensitiveDragon');
      input.dispatchEvent(new Event('mousedown'));
      input.click();
      await vi.runAllTimersAsync();
      expect(mockDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockDispatchService.trackChange).toHaveBeenCalledWith({
        id: 'sensitiveDragon',
        element: 'input',
        interactionType: InteractionType.change,
        interactionDetail: InteractionDetail.mouse,
        inputType: 'radio',
      });
      vi.useRealTimers();
    });

    it('retains an explicitly supplied label for a sensitive radio', async () => {
      vi.useFakeTimers();
      const input = fixture.nativeElement.querySelector('#sensitiveFavoriteFood');
      input.dispatchEvent(new Event('mousedown'));
      input.click();
      await vi.runAllTimersAsync();
      expect(mockDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockDispatchService.trackChange).toHaveBeenCalledWith({
        id: 'sensitiveFavoriteFood',
        label: 'What is your favorite food?',
        element: 'input',
        interactionType: InteractionType.change,
        interactionDetail: InteractionDetail.mouse,
        inputType: 'radio',
      });
      vi.useRealTimers();
    });

    it('does not mutate the supplied DirectiveEvent object', async () => {
      vi.useFakeTimers();
      const input = fixture.nativeElement.querySelector('#sensitiveFavoriteFood');
      input.dispatchEvent(new Event('mousedown'));
      input.click();
      await vi.runAllTimersAsync();
      expect(mockDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(fixture.componentInstance.sensitiveFavoriteFoodEvent).toEqual({
        id: 'sensitiveFavoriteFood',
        label: 'What is your favorite food?',
      });
      vi.useRealTimers();
    });
  });

  describe('sensitive text and select', () => {
    it('retains the field label and suppresses the value for a sensitive text input', async () => {
      vi.useFakeTimers();
      const input = fixture.nativeElement.querySelector('#sensitivePetName');
      input.dispatchEvent(new Event('keydown'));
      input.value = 'Spot';
      input.dispatchEvent(new Event('change'));
      await vi.runAllTimersAsync();
      expect(mockDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockDispatchService.trackChange).toHaveBeenCalledWith({
        id: 'sensitivePetName',
        element: 'input',
        interactionType: InteractionType.change,
        interactionDetail: InteractionDetail.keyboard,
        inputType: 'text',
        label: `Your pet's name:`,
      });
      vi.useRealTimers();
    });

    it('retains the field label and suppresses the value and display value for a sensitive select', async () => {
      vi.useFakeTimers();
      const input = fixture.nativeElement.querySelector('#sensitiveFavoriteFoodSelect');
      input.dispatchEvent(new Event('mousedown'));
      input.value = 'ramen';
      input.dispatchEvent(new Event('change'));
      await vi.runAllTimersAsync();
      expect(mockDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockDispatchService.trackChange).toHaveBeenCalledWith({
        id: 'sensitiveFavoriteFoodSelect',
        element: 'select',
        interactionType: InteractionType.change,
        interactionDetail: InteractionDetail.mouse,
        label: 'What is your favorite food?',
      });
      vi.useRealTimers();
    });

    it('retains the field label and suppresses the value and display value for a sensitive select with no selected option', async () => {
      vi.useFakeTimers();
      const select = fixture.nativeElement.querySelector('#sensitiveFavoriteFoodSelect');
      select.dispatchEvent(new Event('mousedown'));
      select.selectedIndex = -1;
      select.dispatchEvent(new Event('change'));
      await vi.runAllTimersAsync();
      expect(mockDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockDispatchService.trackChange).toHaveBeenCalledWith({
        id: 'sensitiveFavoriteFoodSelect',
        element: 'select',
        interactionType: InteractionType.change,
        interactionDetail: InteractionDetail.mouse,
        label: 'What is your favorite food?',
      });
      expect(mockDispatchService.trackChange.mock.calls[0][0].value).toBeUndefined();
      expect(mockDispatchService.trackChange.mock.calls[0][0].displayValue).toBeUndefined();
      vi.useRealTimers();
    });
  });

  describe('select', () => {
    let expectedEvent: AnalyticEvent;

    beforeEach(() => {
      expectedEvent = {
        id: 'favoriteFood',
        element: 'select',
        interactionType: InteractionType.change,
        interactionDetail: InteractionDetail.mouse,
        label: 'What is your favorite food?',
        value: 'ramen',
        displayValue: 'Ramen',
      };
    });

    it('dispatches a change event when changed', async () => {
      vi.useFakeTimers();
      const input = fixture.nativeElement.querySelector('#favoriteFood');
      input.dispatchEvent(new Event('mousedown'));
      input.value = 'ramen';
      input.dispatchEvent(new Event('change'));
      await vi.runAllTimersAsync();
      expect(mockDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockDispatchService.trackChange).toHaveBeenCalledWith(expectedEvent);
      vi.useRealTimers();
    });
  });

  describe('select with no selected option', () => {
    it('dispatches a change event with an empty value and no display value for an empty select', async () => {
      vi.useFakeTimers();
      const select = fixture.nativeElement.querySelector('#emptyChoice');
      select.dispatchEvent(new Event('mousedown'));
      select.dispatchEvent(new Event('change'));
      await vi.runAllTimersAsync();
      expect(mockDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockDispatchService.trackChange).toHaveBeenCalledWith({
        id: 'emptyChoice',
        element: 'select',
        interactionType: InteractionType.change,
        interactionDetail: InteractionDetail.mouse,
        label: 'Choose an option:',
        value: '',
      });
      expect(mockDispatchService.trackChange.mock.calls[0][0].displayValue).toBeUndefined();
      vi.useRealTimers();
    });

    it('dispatches a change event with an empty value and no display value when the selection is cleared', async () => {
      vi.useFakeTimers();
      const select = fixture.nativeElement.querySelector('#clearedChoice');
      select.dispatchEvent(new Event('mousedown'));
      select.selectedIndex = -1;
      select.dispatchEvent(new Event('change'));
      await vi.runAllTimersAsync();
      expect(mockDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockDispatchService.trackChange).toHaveBeenCalledWith({
        id: 'clearedChoice',
        element: 'select',
        interactionType: InteractionType.change,
        interactionDetail: InteractionDetail.mouse,
        label: 'Choose an option:',
        value: '',
      });
      expect(mockDispatchService.trackChange.mock.calls[0][0].displayValue).toBeUndefined();
      vi.useRealTimers();
    });

    it('dispatches a change event with an empty value and no display value when the final selection of a multiple select is cleared', async () => {
      vi.useFakeTimers();
      const select = fixture.nativeElement.querySelector('#toppings');
      const mushroom = select.querySelector('option[value="mushroom"]');
      mushroom.selected = true;
      select.dispatchEvent(new Event('mousedown'));
      mushroom.selected = false;
      select.dispatchEvent(new Event('change'));
      await vi.runAllTimersAsync();
      expect(mockDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockDispatchService.trackChange).toHaveBeenCalledWith({
        id: 'toppings',
        element: 'select',
        interactionType: InteractionType.change,
        interactionDetail: InteractionDetail.mouse,
        label: 'Choose toppings:',
        value: '',
      });
      expect(mockDispatchService.trackChange.mock.calls[0][0].displayValue).toBeUndefined();
      vi.useRealTimers();
    });

    it('reports the actual text of a selected blank placeholder option', async () => {
      vi.useFakeTimers();
      const select = fixture.nativeElement.querySelector('#placeholderChoice');
      select.dispatchEvent(new Event('mousedown'));
      select.value = '';
      select.dispatchEvent(new Event('change'));
      await vi.runAllTimersAsync();
      expect(mockDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockDispatchService.trackChange).toHaveBeenCalledWith({
        id: 'placeholderChoice',
        element: 'select',
        interactionType: InteractionType.change,
        interactionDetail: InteractionDetail.mouse,
        label: 'Choose an option:',
        value: '',
        displayValue: '',
      });
      vi.useRealTimers();
    });
  });

  describe('textarea', () => {
    let expectedEvent: AnalyticEvent;

    beforeEach(() => {
      expectedEvent = {
        id: 'story',
        element: 'textarea',
        interactionType: InteractionType.change,
        interactionDetail: InteractionDetail.keyboard,
        label: 'Tell us a story:',
        value: 'Once upon a time...',
      };
    });

    it('dispatches a change event when changed', async () => {
      vi.useFakeTimers();
      const input = fixture.nativeElement.querySelector('#story');
      input.dispatchEvent(new Event('keydown'));
      input.value = 'Once upon a time...';
      input.dispatchEvent(new Event('change'));
      await vi.runAllTimersAsync();
      expect(mockDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockDispatchService.trackChange).toHaveBeenCalledWith(expectedEvent);
      vi.useRealTimers();
    });
  });

  describe('warnings', () => {
    it('does not dispatch a change event when an identifier is missing', async () => {
      vi.useFakeTimers();
      const input = fixture.nativeElement.querySelector('.unicorn-background');
      input.dispatchEvent(new Event('mousedown'));
      input.dispatchEvent(new Event('keydown'));
      input.value = 'Spot';
      input.dispatchEvent(new Event('change'));
      await vi.runAllTimersAsync();
      expect(mockDispatchService.trackChange).toHaveBeenCalledTimes(0);
      expect(warnSpy).toHaveBeenCalled();
      vi.useRealTimers();
    });

    it('does not dispatch a change event with an unsupported host element', async () => {
      vi.useFakeTimers();
      const notSupportedFixture = TestBed.createComponent(NotSupportedComponent);
      const directive = notSupportedFixture.debugElement
        .query(By.css('#password'))
        .injector.get(ChangeDirective);
      expect(directive).toBeTruthy();
      warnSpy.mockClear();
      notSupportedFixture.detectChanges();
      expect(directive.successfulInit).toBe(false);
      const input = notSupportedFixture.nativeElement.querySelector('#password');
      input.dispatchEvent(new Event('keydown'));
      input.value = '123';
      input.dispatchEvent(new Event('change'));
      await vi.runAllTimersAsync();
      expect(mockDispatchService.trackChange).toHaveBeenCalledTimes(0);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('The oculrChange directive only works with select, textarea, or input elements')
      );
      vi.useRealTimers();
    });

    it('does not dispatch a change event for an unrelated element with a supported-looking type', async () => {
      vi.useFakeTimers();
      const notSupportedFixture = TestBed.createComponent(NotSupportedComponent);
      const directive = notSupportedFixture.debugElement
        .query(By.css('#typedDiv'))
        .injector.get(ChangeDirective);
      expect(directive).toBeTruthy();
      warnSpy.mockClear();
      notSupportedFixture.detectChanges();
      expect(directive.successfulInit).toBe(false);
      const div = notSupportedFixture.nativeElement.querySelector('#typedDiv');
      div.dispatchEvent(new Event('change'));
      await vi.runAllTimersAsync();
      expect(mockDispatchService.trackChange).toHaveBeenCalledTimes(0);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('The oculrChange directive only works with select, textarea, or input elements')
      );
      vi.useRealTimers();
    });
  });

  describe('interaction attribution sequences', () => {
    it('attributes a touch gesture followed by a separate mouse gesture correctly on the same element', async () => {
      vi.useFakeTimers();
      const input = fixture.nativeElement.querySelector('#attestation');
      input.dispatchEvent(new Event('touchstart'));
      input.dispatchEvent(new Event('mousedown'));
      input.click();
      await vi.runAllTimersAsync();
      input.dispatchEvent(new Event('mousedown'));
      input.click();
      await vi.runAllTimersAsync();
      expect(mockDispatchService.trackChange).toHaveBeenCalledTimes(2);
      expect(mockDispatchService.trackChange).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          id: 'attestation',
          interactionDetail: InteractionDetail.touch,
          value: 'checked',
        })
      );
      expect(mockDispatchService.trackChange).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          id: 'attestation',
          interactionDetail: InteractionDetail.mouse,
          value: 'cleared',
        })
      );
      vi.useRealTimers();
    });

    it('retains correct attribution across keyboard-to-mouse and mouse-to-keyboard sequences', async () => {
      vi.useFakeTimers();
      const input = fixture.nativeElement.querySelector('#petName');
      input.dispatchEvent(new Event('keydown'));
      input.value = 'Spot';
      input.dispatchEvent(new Event('change'));
      await vi.runAllTimersAsync();
      input.dispatchEvent(new Event('mousedown'));
      input.value = 'Rex';
      input.dispatchEvent(new Event('change'));
      await vi.runAllTimersAsync();
      input.dispatchEvent(new Event('keydown'));
      input.value = 'Max';
      input.dispatchEvent(new Event('change'));
      await vi.runAllTimersAsync();
      expect(mockDispatchService.trackChange).toHaveBeenCalledTimes(3);
      expect(mockDispatchService.trackChange).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ interactionDetail: InteractionDetail.keyboard, value: 'Spot' })
      );
      expect(mockDispatchService.trackChange).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ interactionDetail: InteractionDetail.mouse, value: 'Rex' })
      );
      expect(mockDispatchService.trackChange).toHaveBeenNthCalledWith(
        3,
        expect.objectContaining({ interactionDetail: InteractionDetail.keyboard, value: 'Max' })
      );
      vi.useRealTimers();
    });

    it('retains touch attribution across repeated touch gestures', async () => {
      vi.useFakeTimers();
      const input = fixture.nativeElement.querySelector('#attestation');
      for (let i = 0; i < 2; i++) {
        input.dispatchEvent(new Event('touchstart'));
        input.dispatchEvent(new Event('mousedown'));
        input.click();
        await vi.runAllTimersAsync();
      }
      expect(mockDispatchService.trackChange).toHaveBeenCalledTimes(2);
      expect(mockDispatchService.trackChange).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ interactionDetail: InteractionDetail.touch })
      );
      expect(mockDispatchService.trackChange).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ interactionDetail: InteractionDetail.touch })
      );
      vi.useRealTimers();
    });

    it('does not inherit a completed gesture detail for a change event with no initiating event', async () => {
      vi.useFakeTimers();
      const input = fixture.nativeElement.querySelector('#petName');
      input.dispatchEvent(new Event('touchstart'));
      input.dispatchEvent(new Event('mousedown'));
      input.value = 'Spot';
      input.dispatchEvent(new Event('change'));
      await vi.runAllTimersAsync();
      input.value = 'Rex';
      input.dispatchEvent(new Event('change'));
      await vi.runAllTimersAsync();
      expect(mockDispatchService.trackChange).toHaveBeenCalledTimes(2);
      expect(mockDispatchService.trackChange).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ interactionDetail: InteractionDetail.touch, value: 'Spot' })
      );
      expect(mockDispatchService.trackChange.mock.calls[1][0].interactionDetail).toBeUndefined();
      vi.useRealTimers();
    });

    it('resets attribution after a rejected event so the next gesture is classified independently', async () => {
      vi.useFakeTimers();
      const input = fixture.nativeElement.querySelector('.unicorn-background');
      input.dispatchEvent(new Event('touchstart'));
      input.dispatchEvent(new Event('mousedown'));
      input.value = 'Spot';
      input.dispatchEvent(new Event('change'));
      await vi.runAllTimersAsync();
      expect(mockDispatchService.trackChange).toHaveBeenCalledTimes(0);
      expect(warnSpy).toHaveBeenCalled();
      input.setAttribute('id', 'lateId');
      input.dispatchEvent(new Event('mousedown'));
      input.value = 'Rex';
      input.dispatchEvent(new Event('change'));
      await vi.runAllTimersAsync();
      expect(mockDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockDispatchService.trackChange).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'lateId', interactionDetail: InteractionDetail.mouse, value: 'Rex' })
      );
      vi.useRealTimers();
    });
  });
});

@Component({
  template: `
    <!-- checkbox -->
    <input oculrChange type="checkbox" id="attestation" />
    <label for="attestation">Do you agree to the terms?</label>

    <input [oculrChange]="{ id: 'updates', label: 'Update notification' }" type="checkbox" id="notify" />
    <label for="notify">Yes</label>

    <input oculrChange type="checkbox" id="feedback" checked />
    <label for="feedback">Would you like to provide feedback?</label>

    <!-- date -->
    <label for="return">Return date:</label>
    <input oculrChange type="date" id="return" />

    <label for="dob">Date of birth:</label>
    <input oculrChange [sensitiveData]="true" type="date" id="dob" />

    <!-- number -->
    <label for="weekDays">How many weekdays?</label>
    <input oculrChange type="number" id="weekDays" />

    <!-- search -->
    <label for="search">What are you looking for?</label>
    <input oculrChange type="search" id="search" />

    <!-- text -->
    <label for="petName">Your pet's name:</label>
    <input oculrChange type="text" id="petName" />

    <label for="unicornName">Your unicorn's name:</label>
    <input oculrChange class="unicorn-background" type="text" />

    <!-- effective type: missing, uppercase, and browser-invalid type attributes -->
    <label for="noType">No type attribute:</label>
    <input oculrChange id="noType" />

    <label for="upperText">Uppercase type:</label>
    <input oculrChange type="TEXT" id="upperText" />

    <label for="invalidType">Invalid type:</label>
    <input oculrChange type="bogus" id="invalidType" />

    <!-- radio -->
    <input oculrChange type="radio" id="dragon" value="dragon" />
    <label for="dragon">Dragon</label>

    <form [formGroup]="seasonsForm">
      <input oculrChange type="radio" id="summer" value="summer" formControlName="favoriteSeason" />
      <label for="summer">Summer</label>
    </form>

    <input oculrChange type="radio" id="chocolateChip" value="chocolateChip" name="favoriteCookie" />
    <label for="chocolateChip">Chocolate chip</label>

    <input oculrChange type="RADIO" id="upperRadio" value="upper" name="upperRadioName" />
    <label for="upperRadio">Upper radio</label>

    <!-- sensitive checkbox and radio -->
    <label for="sensitiveAttestation">Private condition answer</label>
    <input oculrChange [sensitiveData]="true" type="checkbox" id="sensitiveAttestation" />

    <label for="sensitiveDragon">Private condition answer</label>
    <input oculrChange [sensitiveData]="true" type="radio" id="sensitiveDragon" value="dragon" />

    <input
      [oculrChange]="sensitiveFavoriteFoodEvent"
      [sensitiveData]="true"
      type="radio"
      id="sensitiveFavoriteFood"
      value="pizza"
    />
    <label for="sensitiveFavoriteFood">Pizza</label>

    <!-- sensitive text -->
    <label for="sensitivePetName">Your pet's name:</label>
    <input oculrChange [sensitiveData]="true" type="text" id="sensitivePetName" />

    <!-- sensitive select -->
    <label for="sensitiveFavoriteFoodSelect">What is your favorite food?</label>
    <select oculrChange [sensitiveData]="true" id="sensitiveFavoriteFoodSelect">
      <option value="pizza">Pizza</option>
      <option value="tacos">Tacos</option>
      <option value="ramen">Ramen</option>
    </select>

    <!-- select -->
    <label for="favoriteFood">What is your favorite food?</label>
    <select oculrChange id="favoriteFood">
      <option value="pizza">Pizza</option>
      <option value="tacos">Tacos</option>
      <option value="ramen">Ramen</option>
    </select>

    <!-- select with no options -->
    <label for="emptyChoice">Choose an option:</label>
    <select oculrChange id="emptyChoice"></select>

    <!-- select with options but no selected option -->
    <label for="clearedChoice">Choose an option:</label>
    <select oculrChange id="clearedChoice">
      <option value="pizza">Pizza</option>
      <option value="tacos">Tacos</option>
    </select>

    <!-- multiple select -->
    <label for="toppings">Choose toppings:</label>
    <select oculrChange id="toppings" multiple>
      <option value="mushroom">Mushroom</option>
      <option value="olive">Olive</option>
    </select>

    <!-- select with a blank placeholder option -->
    <label for="placeholderChoice">Choose an option:</label>
    <select oculrChange id="placeholderChoice">
      <option value=""></option>
      <option value="pizza">Pizza</option>
    </select>

    <!-- textarea -->
    <label for="story">Tell us a story:</label>
    <textarea oculrChange id="story"></textarea>
  `,
  standalone: true,
  imports: [OculrAngularModule, ReactiveFormsModule],
})
class TestComponent {
  seasonsForm = new UntypedFormGroup({
    favoriteSeason: new UntypedFormControl(''),
  });
  sensitiveFavoriteFoodEvent: DirectiveEvent = {
    id: 'sensitiveFavoriteFood',
    label: 'What is your favorite food?',
  };
}

@Component({
  template: `
    <!-- password, not supported -->
    <label for="password">Password:</label>
    <input oculrChange type="password" id="password" />

    <!-- unrelated element with a supported-looking type, not supported -->
    <div oculrChange type="text" id="typedDiv"></div>
  `,
  standalone: true,
  imports: [OculrAngularModule],
})
class NotSupportedComponent {}
