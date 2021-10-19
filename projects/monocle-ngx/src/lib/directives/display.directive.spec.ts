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

  it('dispatches a display event when directive included', fakeAsync(() => {
    expect(mockEventDispatchService.trackDisplay).toHaveBeenCalledTimes(1);
    expect(mockEventDispatchService.trackDisplay).toHaveBeenCalledWith(undefined, undefined);
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

  it('does not dispatch a display event when ngIf is true', fakeAsync(() => {
    fixture.componentInstance.conditional.next(true);
    fixture.detectChanges();
    tick();
    expect(mockEventDispatchService.trackDisplay).toHaveBeenCalledTimes(1);
    expect(mockEventDispatchService.trackDisplay).toHaveBeenCalledWith(undefined, undefined);
  }));

  it('uses the id attribute when provided', fakeAsync(() => {
    fixture.componentInstance.useId.next(true);
    fixture.detectChanges();
    tick();
    expect(mockEventDispatchService.trackDisplay).toHaveBeenCalledTimes(1);
    expect(mockEventDispatchService.trackDisplay).toHaveBeenCalledWith(undefined, 'testId');
  }));
});

@Component({
  template: `<div mnclDisplay *ngIf="conditional | async">Conditional element</div>
    <div mnclDisplay id="testId" *ngIf="useId | async">Conditional element</div>`,
})
class ConditionalTestComponent {
  conditional = new Subject<boolean>();
  useId = new Subject<boolean>();

  onInit() {
    this.conditional.next(false);
    this.useId.next(false);
  }
}

@Component({
  template: `<div mnclDisplay>Standard element</div>`,
})
class SimpleTestComponent {}
