import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { EventDispatchService } from '../services/event-dispatch.service';
import { ChangeDirective } from './change.directive';

fdescribe('ChangeDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let mockEventDispatchService: any;

  beforeEach(() => {
    mockEventDispatchService = {
      trackChange: jasmine.createSpy('trackChange'),
    };

    TestBed.configureTestingModule({
      declarations: [TestComponent, ChangeDirective],
      providers: [{ provide: EventDispatchService, useValue: mockEventDispatchService }],
    });
    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
  });

  it('dispatches a change event using host element attributes as defaults when clicked with a mouse', fakeAsync(() => {
    const expectedEvent = {
      id: 'checkboxId',
      interactionType: 'change',
      interactionDetail: 'mouse',
      label: 'My default answer',
      value: 'checked',
      displayValue: 'My default answer',
    };
    const input = fixture.nativeElement.querySelector('#checkboxId');
    input.dispatchEvent(new Event('mousedown'));
    input.click();
    tick();
    expect(mockEventDispatchService.trackChange).toHaveBeenCalledTimes(1);
    expect(mockEventDispatchService.trackChange).toHaveBeenCalledWith(expectedEvent);
  }));

  it('dispatches a change event using keyboard input', fakeAsync(() => {
    const expectedEvent = {
      id: 'checkboxId',
      interactionType: 'change',
      interactionDetail: 'keyboard',
      label: 'My default answer',
      value: 'checked',
      displayValue: 'My default answer',
    };
    const input = fixture.nativeElement.querySelector('#checkboxId');
    input.dispatchEvent(new Event('keydown'));
    input.click();
    tick();
    expect(mockEventDispatchService.trackChange).toHaveBeenCalledTimes(1);
    expect(mockEventDispatchService.trackChange).toHaveBeenCalledWith(expectedEvent);
  }));

  describe('input checkbox', () => {
    it('prioritizes event properties over host element attributes when both are provided', fakeAsync(() => {
      const expectedEvent = {
        id: 'eventId',
        interactionType: 'change',
        interactionDetail: 'mouse',
        label: 'Event label',
        value: 'checked',
        displayValue: 'Use event object',
      };
      const input = fixture.nativeElement.querySelector('#useEventId');
      input.dispatchEvent(new Event('mousedown'));
      input.click();
      tick();
      expect(mockEventDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockEventDispatchService.trackChange).toHaveBeenCalledWith(expectedEvent);
    }));
  });

  describe('input radio', () => {
    it('prioritizes event properties over host element attributes when both are provided', fakeAsync(() => {
      const expectedEvent = {
        id: 'radioYesId',
        interactionType: 'change',
        interactionDetail: 'mouse',
        label: 'Yes',
        value: 'yes',
        displayValue: 'Yes',
      };
      const input = fixture.nativeElement.querySelector('#radioYesId');
      input.dispatchEvent(new Event('mousedown'));
      input.click();
      tick();
      expect(mockEventDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockEventDispatchService.trackChange).toHaveBeenCalledWith(expectedEvent);
    }));
  });

  describe('select', () => {
    it('creates an event with a unique label and display value', fakeAsync(() => {
      const expectedEvent = {
        id: 'selectId',
        interactionType: 'change',
        interactionDetail: 'mouse',
        label: 'What is your favorite food?',
        value: 'ramen',
        displayValue: 'Ramen',
      };
      const input = fixture.nativeElement.querySelector('#selectId');
      input.dispatchEvent(new Event('mousedown'));
      input.value = 'ramen';
      input.dispatchEvent(new Event('change'));
      tick();
      expect(mockEventDispatchService.trackChange).toHaveBeenCalledTimes(1);
      expect(mockEventDispatchService.trackChange).toHaveBeenCalledWith(expectedEvent);
    }));
  });
});

@Component({
  template: `
    <input mnclChange type="checkbox" id="checkboxId" />
    <label for="checkboxId">My default answer</label>

    <input
      [mnclChange]="{ id: 'eventId', label: 'Event label' }"
      type="checkbox"
      id="useEventId"
      formControlName="myCheckbox"
    />
    <label for="useEventId">Use event object</label>

    <input mnclChange type="radio" id="radioYesId" value="yes" />
    <label for="radioYesId">Yes</label>
    <input mnclChange type="radio" id="radioNoId" value="no" />
    <label for="radioNoId">No</label>

    <label for="selectId">What is your favorite food?</label>
    <select mnclChange id="selectId">
      <option value="pizza">Pizza</option>
      <option value="tacos">Tacos</option>
      <option value="ramen">Ramen</option>
    </select>
  `,
})
class TestComponent {}
