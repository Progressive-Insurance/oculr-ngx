import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { EventDispatchService } from '../services/event-dispatch.service';
import { DisplayDirective } from './display.directive';

fdescribe('DisplayDirective', () => {
  let fixture: ComponentFixture<SimpleTestComponent>;
  let mockEventDispatchService: any;

  beforeEach(() => {
    mockEventDispatchService = {
      trackDisplay: jasmine.createSpy('trackDisplay'),
    };

    TestBed.configureTestingModule({
      declarations: [SimpleTestComponent, DisplayDirective],
      providers: [{ provide: EventDispatchService, useValue: mockEventDispatchService }],
    });
    fixture = TestBed.createComponent(SimpleTestComponent);
    fixture.detectChanges();
  });

  it('dispatches a display event when directive included with an id attribute', fakeAsync(() => {
    expect(mockEventDispatchService.trackDisplay).toHaveBeenCalledTimes(1);
    expect(mockEventDispatchService.trackDisplay).toHaveBeenCalledWith({ id: 'testId' });
  }));
});

fdescribe('DisplayDirective', () => {
  let fixture: ComponentFixture<ConditionalTestComponent>;
  let mockEventDispatchService: any;

  beforeEach(fakeAsync(() => {
    mockEventDispatchService = {
      trackDisplay: jasmine.createSpy('trackDisplay'),
    };

    TestBed.configureTestingModule({
      declarations: [ConditionalTestComponent, DisplayDirective],
      providers: [{ provide: EventDispatchService, useValue: mockEventDispatchService }],
    });
    fixture = TestBed.createComponent(ConditionalTestComponent);
    fixture.detectChanges();
    tick();
  }));

  it('does not dispatch a display event when ngIf is false', fakeAsync(() => {
    expect(mockEventDispatchService.trackDisplay).toHaveBeenCalledTimes(0);
  }));

  it('does dispatch a display event when ngIf is true', fakeAsync(() => {
    fixture.componentInstance.conditional.next(true);
    fixture.detectChanges();
    tick();
    expect(mockEventDispatchService.trackDisplay).toHaveBeenCalledTimes(1);
    expect(mockEventDispatchService.trackDisplay).toHaveBeenCalledWith({ id: 'testId' });
  }));

  it('does not dispatch a display event when no identifier is provided', fakeAsync(() => {
    console.warn = jasmine.createSpy('warn');
    fixture.componentInstance.missingId.next(true);
    fixture.detectChanges();
    tick();
    expect(mockEventDispatchService.trackDisplay).toHaveBeenCalledTimes(0);
    expect(console.warn).toHaveBeenCalled();
  }));

  it('does dispatch a display event when an Event object is provided with an id property', fakeAsync(() => {
    fixture.componentInstance.eventId.next(true);
    fixture.detectChanges();
    tick();
    expect(mockEventDispatchService.trackDisplay).toHaveBeenCalledTimes(1);
    expect(mockEventDispatchService.trackDisplay).toHaveBeenCalledWith({ id: 'eventId' });
  }));

  it('prioritizes Event id over host element id when both are provided', fakeAsync(() => {
    fixture.componentInstance.competingId.next(true);
    fixture.detectChanges();
    tick();
    expect(mockEventDispatchService.trackDisplay).toHaveBeenCalledTimes(1);
    expect(mockEventDispatchService.trackDisplay).toHaveBeenCalledWith({ id: 'eventId' });
  }));
});

@Component({
  template: `
    <div mnclDisplay id="testId" *ngIf="conditional | async">Conditional element</div>
    <div mnclDisplay *ngIf="missingId | async">Missing id element</div>
    <div [mnclDisplay]="{ id: 'eventId' }" *ngIf="eventId | async">Event id element</div>
    <div [mnclDisplay]="{ id: 'eventId' }" id="testId" *ngIf="competingId | async">Competing id element</div>
  `,
})
class ConditionalTestComponent {
  conditional = new Subject<boolean>();
  missingId = new Subject<boolean>();
  eventId = new Subject<boolean>();
  competingId = new Subject<boolean>();

  onInit() {
    this.conditional.next(false);
    this.missingId.next(false);
    this.eventId.next(false);
    this.competingId.next(false);
  }
}

@Component({
  template: `<div mnclDisplay id="testId">Standard element</div>`,
})
class SimpleTestComponent {}
