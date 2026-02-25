/*
 * @license
 * Copyright (c) 2025 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
 */

import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { OculrAngularModule } from '../oculr-ngx.module';
import { DirectiveService } from '../services/directive.service';
import { DispatchService } from '../services/dispatch.service';
import { DisplayDirective } from './display.directive';

describe('DisplayDirective', () => {
  let fixture: ComponentFixture<SimpleTestComponent>;
  let mockDispatchService: any;

  beforeEach(() => {
    mockDispatchService = {
      trackDisplay: vi.fn(),
    };

    TestBed.configureTestingModule({
      declarations: [DisplayDirective],
      providers: [{ provide: DispatchService, useValue: mockDispatchService }, DirectiveService],
      imports: [SimpleTestComponent],
    });
    fixture = TestBed.createComponent(SimpleTestComponent);
    fixture.detectChanges();
  });

  it('dispatches a display event when directive included with an id attribute', () => {
    expect(mockDispatchService.trackDisplay).toHaveBeenCalledTimes(1);
    expect(mockDispatchService.trackDisplay).toHaveBeenCalledWith({ id: 'testId', element: 'div' });
  });
});

@Component({
  template: `<div oculrDisplay id="testId"></div>`,
  standalone: true,
  imports: [OculrAngularModule],
})
class SimpleTestComponent {}

describe('DisplayDirective', () => {
  let fixture: ComponentFixture<ConditionalTestComponent>;
  let mockDispatchService: any;

  beforeEach(async () => {
    vi.useFakeTimers();
    mockDispatchService = {
      trackDisplay: vi.fn(),
    };

    TestBed.configureTestingModule({
      declarations: [DisplayDirective],
      providers: [{ provide: DispatchService, useValue: mockDispatchService }, DirectiveService],
      imports: [ConditionalTestComponent],
    });
    fixture = TestBed.createComponent(ConditionalTestComponent);
    fixture.detectChanges();
    await vi.runAllTimersAsync();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not dispatch a display event when ngIf is false', () => {
    expect(mockDispatchService.trackDisplay).toHaveBeenCalledTimes(0);
  });

  it('does dispatch a display event when ngIf is true', async () => {
    fixture.componentInstance.conditional.next(true);
    fixture.detectChanges();
    await vi.runAllTimersAsync();
    expect(mockDispatchService.trackDisplay).toHaveBeenCalledTimes(1);
    expect(mockDispatchService.trackDisplay).toHaveBeenCalledWith({ id: 'testId', element: 'div' });
  });

  it('does not dispatch a display event when no identifier is provided', async () => {
    const warnSpy = vi.spyOn(console, 'warn');
    fixture.componentInstance.missingId.next(true);
    fixture.detectChanges();
    await vi.runAllTimersAsync();
    expect(mockDispatchService.trackDisplay).toHaveBeenCalledTimes(0);
    expect(warnSpy).toHaveBeenCalled();
  });

  it('does dispatch a display event when an Event object is provided with an id property', async () => {
    fixture.componentInstance.eventId.next(true);
    fixture.detectChanges();
    await vi.runAllTimersAsync();
    expect(mockDispatchService.trackDisplay).toHaveBeenCalledTimes(1);
    expect(mockDispatchService.trackDisplay).toHaveBeenCalledWith({ id: 'eventId', element: 'div' });
  });

  it('prioritizes Event id over host element id when both are provided', async () => {
    fixture.componentInstance.competingId.next(true);
    fixture.detectChanges();
    await vi.runAllTimersAsync();
    expect(mockDispatchService.trackDisplay).toHaveBeenCalledTimes(1);
    expect(mockDispatchService.trackDisplay).toHaveBeenCalledWith({ id: 'eventId', element: 'div' });
  });
});

@Component({
  template: `
    @if (conditional | async) {
      <div oculrDisplay id="testId">Conditional element</div>
    }
    @if (missingId | async) {
      <div oculrDisplay>Missing id element</div>
    }
    @if (eventId | async) {
      <div [oculrDisplay]="{ id: 'eventId' }">Event id element</div>
    }
    @if (competingId | async) {
      <div [oculrDisplay]="{ id: 'eventId' }" id="testId">Competing id element</div>
    }
  `,
  standalone: true,
  imports: [AsyncPipe, OculrAngularModule],
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
