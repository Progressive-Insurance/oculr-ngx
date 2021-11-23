/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { EventDispatchService } from '../services/event-dispatch.service';
import { ClickDirective } from './click.directive';

describe('ClickDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let mockEventDispatchService: any;
  let mockActivatedRoute: any;

  beforeEach(() => {
    mockEventDispatchService = {
      trackClick: jasmine.createSpy('trackClick'),
    };
    mockActivatedRoute = {
      snapshot: { url: '/home' },
    };

    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([{ path: 'somewhere', component: AlternateRouteComponent }])],
      declarations: [TestComponent, AlternateRouteComponent, ClickDirective],
      providers: [
        { provide: EventDispatchService, useValue: mockEventDispatchService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    });
    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
  });

  it('dispatches a click event using host element attributes as defaults', fakeAsync(() => {
    const expectedEvent = {
      id: 'testId',
      interactionType: 'click',
      interactionDetail: 'keyboard',
      label: 'Simple button',
      activatedRoute: mockActivatedRoute.snapshot,
    };
    const button = fixture.nativeElement.querySelector('#testId');
    button.dispatchEvent(new Event('keydown'));
    button.click();
    tick();
    expect(mockEventDispatchService.trackClick).toHaveBeenCalledTimes(1);
    expect(mockEventDispatchService.trackClick).toHaveBeenCalledWith(expectedEvent);
  }));

  it('dispatches a click event when using a mouse', fakeAsync(() => {
    const expectedEvent = {
      id: 'testId',
      interactionType: 'click',
      interactionDetail: 'mouse',
      label: 'Simple button',
      activatedRoute: mockActivatedRoute.snapshot,
    };
    const button = fixture.nativeElement.querySelector('#testId');
    button.dispatchEvent(new Event('mousedown'));
    button.click();
    tick();
    expect(mockEventDispatchService.trackClick).toHaveBeenCalledTimes(1);
    expect(mockEventDispatchService.trackClick).toHaveBeenCalledWith(expectedEvent);
  }));

  it('dispatches a click event when using touch', fakeAsync(() => {
    const expectedEvent = {
      id: 'testId',
      interactionType: 'click',
      interactionDetail: 'touch',
      label: 'Simple button',
      activatedRoute: mockActivatedRoute.snapshot,
    };
    const button = fixture.nativeElement.querySelector('#testId');
    button.dispatchEvent(new Event('touchstart'));
    button.dispatchEvent(new Event('mousedown'));
    button.click();
    tick();
    expect(mockEventDispatchService.trackClick).toHaveBeenCalledTimes(1);
    expect(mockEventDispatchService.trackClick).toHaveBeenCalledWith(expectedEvent);
  }));

  it('dispatches a click event with a url when host element is a link', fakeAsync(() => {
    const expectedEvent = {
      id: 'linkWithRouterLink',
      interactionType: 'click',
      interactionDetail: 'keyboard',
      label: 'Simple routerLink',
      activatedRoute: mockActivatedRoute.snapshot,
      linkUrl: '/somewhere',
    };
    const link = fixture.nativeElement.querySelector('#linkWithRouterLink');
    link.dispatchEvent(new Event('keydown'));
    link.click();
    tick();
    expect(mockEventDispatchService.trackClick).toHaveBeenCalledTimes(1);
    expect(mockEventDispatchService.trackClick).toHaveBeenCalledWith(expectedEvent);
  }));

  it('prioritizes bound properties over host element attributes when both are provided', fakeAsync(() => {
    const expectedEvent = {
      id: 'eventId',
      interactionType: 'click',
      interactionDetail: 'keyboard',
      label: 'Event label',
      activatedRoute: mockActivatedRoute.snapshot,
    };
    const button = fixture.nativeElement.querySelector('#useEventId');
    button.dispatchEvent(new Event('keydown'));
    button.click();
    tick();
    expect(mockEventDispatchService.trackClick).toHaveBeenCalledTimes(1);
    expect(mockEventDispatchService.trackClick).toHaveBeenCalledWith(expectedEvent);
  }));

  it('does not dispatch a click event when an identifier is missing', fakeAsync(() => {
    console.warn = jasmine.createSpy('warn');
    const button = fixture.nativeElement.querySelector('.someClass');
    button.dispatchEvent(new Event('keydown'));
    button.click();
    tick();
    expect(mockEventDispatchService.trackClick).toHaveBeenCalledTimes(0);
    expect(console.warn).toHaveBeenCalled();
  }));
});

@Component({
  template: `
    <button oculrClick id="testId">Simple button</button>
    <a oculrClick routerLink="/somewhere" id="linkWithRouterLink">Simple routerLink</a>
    <button [oculrClick]="{ id: 'eventId', label: 'Event label' }" id="useEventId">Event object button</button>
    <button oculrClick class="someClass">Missing id button</button>
    <router-outlet></router-outlet>
  `,
})
class TestComponent {}

@Component({
  template: '',
})
class AlternateRouteComponent {}
