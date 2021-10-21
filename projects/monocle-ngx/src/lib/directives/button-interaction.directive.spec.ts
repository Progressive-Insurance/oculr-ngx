import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { EventDispatchService } from '../services/event-dispatch.service';
import { ButtonDirective } from './button-interaction.directive';

describe('ButtonDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let mockEventDispatchService: any;

  beforeEach(() => {
    mockEventDispatchService = {
      trackButtonInteraction: jasmine.createSpy('trackButtonInteraction'),
    };

    TestBed.configureTestingModule({
      declarations: [TestComponent, ButtonDirective],
      providers: [{ provide: EventDispatchService, useValue: mockEventDispatchService }],
    });
    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
  });

  it('dispatches a button event using host element attributes as defaults', fakeAsync(() => {
    const expectedEvent = {
      id: 'testId',
      interactionType: 'click',
      interactionDetail: 'keyboard',
      label: 'Simple button',
    };
    const button = fixture.debugElement.nativeElement.querySelector('#testId');
    button.click();
    tick();
    expect(mockEventDispatchService.trackButtonInteraction).toHaveBeenCalledTimes(1);
    expect(mockEventDispatchService.trackButtonInteraction).toHaveBeenCalledWith(expectedEvent);
  }));

  it('prioritizes Event properties over host element attributes when both are provided', fakeAsync(() => {
    const expectedEvent = {
      id: 'eventId',
      interactionType: 'click',
      interactionDetail: 'keyboard',
      label: 'Event label',
    };
    const button = fixture.debugElement.nativeElement.querySelector('#useEventId');
    button.click();
    tick();
    expect(mockEventDispatchService.trackButtonInteraction).toHaveBeenCalledTimes(1);
    expect(mockEventDispatchService.trackButtonInteraction).toHaveBeenCalledWith(expectedEvent);
  }));

  it('does not dispatch a button event when no identifier is provided', fakeAsync(() => {
    console.warn = jasmine.createSpy('warn');
    const button = fixture.debugElement.nativeElement.querySelector('.someClass');
    button.click();
    tick();
    expect(mockEventDispatchService.trackButtonInteraction).toHaveBeenCalledTimes(0);
    expect(console.warn).toHaveBeenCalled();
  }));
});

@Component({
  template: `
    <button mnclButton id="testId">Simple button</button>
    <button [mnclButton]="{ id: 'eventId', label: 'Event label' }" id="useEventId">Event object button</button>
    <button mnclButton class="someClass">Missing id button</button>
  `,
})
class TestComponent {}
