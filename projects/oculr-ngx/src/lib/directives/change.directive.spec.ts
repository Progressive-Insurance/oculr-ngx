/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { InteractionDetail } from '../models/interaction-detail.enum';
import { InteractionType } from '../models/interaction-type.enum';
import { AnalyticEvent } from 'oculr-ngx';
import { InputType } from '../models/input-type.enum';
import { EventDispatchService } from '../services/event-dispatch.service';
import { ChangeDirective } from './change.directive';

describe('ChangeDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let mockEventDispatchService: any;

  beforeEach(() => {
    mockEventDispatchService = {
      trackChange: jasmine.createSpy('trackChange'),
    };
    console.warn = jasmine.createSpy('warn');

    TestBed.configureTestingModule({
      declarations: [TestComponent, NotSupportedComponent, ChangeDirective],
      providers: [{ provide: EventDispatchService, useValue: mockEventDispatchService }],
    });
    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
  });

  describe('input checkbox', () => {
    let expectedEvent: AnalyticEvent;

    beforeEach(() => {
      expectedEvent = {
        id: 'attestation',
        interactionType: InteractionType.change,
        interactionDetail: InteractionDetail.mouse,
        inputType: InputType.checkbox,
        label: 'Do you agree to the terms?',
        value: 'checked',
        displayValue: 'Do you agree to the terms?',
      };
    });

    it('dispatches a change event when clicked with a mouse', fakeAsync(() => {
      const input = fixture.nativeElement.querySelector('#attestation');
      input.dispatchEvent(new Event('mousedown'));
      input.click();
      tick();
      expect(mockEventDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockEventDispatchService.trackChange).toHaveBeenCalledWith(expectedEvent);
    }));

    it('dispatches a change event when using a keyboard', fakeAsync(() => {
      expectedEvent.interactionDetail = InteractionDetail.keyboard;
      const input = fixture.nativeElement.querySelector('#attestation');
      input.dispatchEvent(new Event('keydown'));
      input.click();
      tick();
      expect(mockEventDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockEventDispatchService.trackChange).toHaveBeenCalledWith(expectedEvent);
    }));

    it('dispatches a change event when using touch', fakeAsync(() => {
      expectedEvent.interactionDetail = InteractionDetail.touch;
      const input = fixture.nativeElement.querySelector('#attestation');
      input.dispatchEvent(new Event('touchstart'));
      input.dispatchEvent(new Event('mousedown'));
      input.click();
      tick();
      expect(mockEventDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockEventDispatchService.trackChange).toHaveBeenCalledWith(expectedEvent);
    }));

    it('prioritizes event properties over host element attributes', fakeAsync(() => {
      expectedEvent.id = 'updates';
      expectedEvent.label = 'Update notification';
      expectedEvent.displayValue = 'Yes';
      const input = fixture.nativeElement.querySelector('#notify');
      input.dispatchEvent(new Event('mousedown'));
      input.click();
      tick();
      expect(mockEventDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockEventDispatchService.trackChange).toHaveBeenCalledWith(expectedEvent);
    }));

    it('dispatches a change event when cleared', fakeAsync(() => {
      expectedEvent.id = 'feedback';
      expectedEvent.label = 'Would you like to provide feedback?';
      expectedEvent.displayValue = 'Would you like to provide feedback?';
      expectedEvent.value = 'cleared';
      const input = fixture.nativeElement.querySelector('#feedback');
      input.dispatchEvent(new Event('mousedown'));
      input.click();
      tick();
      expect(mockEventDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockEventDispatchService.trackChange).toHaveBeenCalledWith(expectedEvent);
    }));
  });

  describe('input date', () => {
    let expectedEvent: AnalyticEvent;

    beforeEach(() => {
      expectedEvent = {
        id: 'return',
        interactionType: InteractionType.change,
        interactionDetail: InteractionDetail.keyboard,
        inputType: InputType.date,
        label: 'Return date:',
      };
    });

    it('dispatches a change event when changed', fakeAsync(() => {
      expectedEvent.value = '2021-11-16';
      const input = fixture.nativeElement.querySelector('#return');
      input.dispatchEvent(new Event('keydown'));
      input.value = '2021-11-16';
      input.dispatchEvent(new Event('change'));
      tick();
      expect(mockEventDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockEventDispatchService.trackChange).toHaveBeenCalledWith(expectedEvent);
    }));

    it('does not dispatch a change event due to sensitive data', fakeAsync(() => {
      expectedEvent.id = 'dob';
      expectedEvent.label = 'Date of birth:';
      const input = fixture.nativeElement.querySelector('#dob');
      input.dispatchEvent(new Event('keydown'));
      input.value = '2001-11-16';
      input.dispatchEvent(new Event('change'));
      tick();
      expect(mockEventDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockEventDispatchService.trackChange).toHaveBeenCalledWith(expectedEvent);
    }));
  });

  describe('input number', () => {
    let expectedEvent: AnalyticEvent;

    beforeEach(() => {
      expectedEvent = {
        id: 'weekDays',
        interactionType: InteractionType.change,
        interactionDetail: InteractionDetail.keyboard,
        inputType: InputType.number,
        label: 'How many weekdays?',
        value: '5',
      };
    });

    it('dispatches a change event when changed', fakeAsync(() => {
      const input = fixture.nativeElement.querySelector('#weekDays');
      input.dispatchEvent(new Event('keydown'));
      input.value = '5';
      input.dispatchEvent(new Event('change'));
      tick();
      expect(mockEventDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockEventDispatchService.trackChange).toHaveBeenCalledWith(expectedEvent);
    }));
  });

  describe('input search', () => {
    let expectedEvent: AnalyticEvent;

    beforeEach(() => {
      expectedEvent = {
        id: 'search',
        interactionType: InteractionType.change,
        interactionDetail: InteractionDetail.keyboard,
        inputType: InputType.search,
        label: 'What are you looking for?',
        value: 'things',
      };
    });

    it('dispatches a change event when changed', fakeAsync(() => {
      const input = fixture.nativeElement.querySelector('#search');
      input.dispatchEvent(new Event('keydown'));
      input.value = 'things';
      input.dispatchEvent(new Event('change'));
      tick();
      expect(mockEventDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockEventDispatchService.trackChange).toHaveBeenCalledWith(expectedEvent);
    }));
  });

  describe('input text', () => {
    let expectedEvent: AnalyticEvent;

    beforeEach(() => {
      expectedEvent = {
        id: 'petName',
        interactionType: InteractionType.change,
        interactionDetail: InteractionDetail.keyboard,
        inputType: InputType.text,
        label: `Your pet's name:`,
        value: 'Spot',
      };
    });

    it('dispatches a change event when changed', fakeAsync(() => {
      const input = fixture.nativeElement.querySelector('#petName');
      input.dispatchEvent(new Event('keydown'));
      input.value = 'Spot';
      input.dispatchEvent(new Event('change'));
      tick();
      expect(mockEventDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockEventDispatchService.trackChange).toHaveBeenCalledWith(expectedEvent);
    }));
  });

  describe('input radio', () => {
    let expectedEvent: AnalyticEvent;

    beforeEach(() => {
      expectedEvent = {
        id: 'dragon',
        interactionType: InteractionType.change,
        interactionDetail: InteractionDetail.mouse,
        inputType: InputType.radio,
        label: 'Dragon',
        value: 'dragon',
        displayValue: 'Dragon',
      };
    });

    it('dispatches a change event when changed', fakeAsync(() => {
      const input = fixture.nativeElement.querySelector('#dragon');
      input.dispatchEvent(new Event('mousedown'));
      input.click();
      tick();
      expect(mockEventDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockEventDispatchService.trackChange).toHaveBeenCalledWith(expectedEvent);
    }));
  });

  describe('select', () => {
    let expectedEvent: AnalyticEvent;

    beforeEach(() => {
      expectedEvent = {
        id: 'favoriteFood',
        interactionType: InteractionType.change,
        interactionDetail: InteractionDetail.mouse,
        inputType: InputType.select,
        label: 'What is your favorite food?',
        value: 'ramen',
        displayValue: 'Ramen',
      };
    });

    it('dispatches a change event when changed', fakeAsync(() => {
      const input = fixture.nativeElement.querySelector('#favoriteFood');
      input.dispatchEvent(new Event('mousedown'));
      input.value = 'ramen';
      input.dispatchEvent(new Event('change'));
      tick();
      expect(mockEventDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockEventDispatchService.trackChange).toHaveBeenCalledWith(expectedEvent);
    }));
  });

  describe('textarea', () => {
    let expectedEvent: AnalyticEvent;

    beforeEach(() => {
      expectedEvent = {
        id: 'story',
        interactionType: InteractionType.change,
        interactionDetail: InteractionDetail.keyboard,
        inputType: InputType.textarea,
        label: 'Tell us a story:',
        value: 'Once upon a time...',
      };
    });

    it('dispatches a change event when changed', fakeAsync(() => {
      const input = fixture.nativeElement.querySelector('#story');
      input.dispatchEvent(new Event('keydown'));
      input.value = 'Once upon a time...';
      input.dispatchEvent(new Event('change'));
      tick();
      expect(mockEventDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockEventDispatchService.trackChange).toHaveBeenCalledWith(expectedEvent);
    }));
  });

  describe('warnings', () => {
    beforeEach(() => {
      console.warn = jasmine.createSpy('warn');
    });

    it('does not dispatch a change event when an identifier is missing', fakeAsync(() => {
      const input = fixture.nativeElement.querySelector('.unicorn-background');
      input.dispatchEvent(new Event('mousedown'));
      input.click();
      tick();
      expect(mockEventDispatchService.trackChange).toHaveBeenCalledTimes(0);
      expect(console.warn).toHaveBeenCalled();
    }));

    it('does not dispatch a change event with an unsupported host element', fakeAsync(() => {
      const notSupportedFixture = TestBed.createComponent(NotSupportedComponent);
      notSupportedFixture.detectChanges();
      const input = notSupportedFixture.nativeElement.querySelector('#password');
      input.dispatchEvent(new Event('keydown'));
      input.value = '123';
      input.dispatchEvent(new Event('change'));
      tick();
      expect(mockEventDispatchService.trackChange).toHaveBeenCalledTimes(0);
      expect(console.warn).toHaveBeenCalled();
    }));
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

    <!-- radio -->
    <input oculrChange type="radio" id="dragon" value="dragon" />
    <label for="dragon">Dragon</label>

    <input oculrChange class="unicorn-background" type="radio" value="unicorn" />
    <label>Unicorn</label>

    <!-- select -->
    <label for="favoriteFood">What is your favorite food?</label>
    <select oculrChange id="favoriteFood">
      <option value="pizza">Pizza</option>
      <option value="tacos">Tacos</option>
      <option value="ramen">Ramen</option>
    </select>

    <!-- textarea -->
    <label for="story">Tell us a story:</label>
    <textarea oculrChange id="story"></textarea>
  `,
})
class TestComponent {}

@Component({
  template: `
    <!-- password, not supported -->
    <label for="password">Password:</label>
    <input oculrChange type="password" id="password" />
  `,
})
class NotSupportedComponent {}
