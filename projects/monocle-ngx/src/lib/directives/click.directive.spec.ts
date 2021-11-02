import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { EventDispatchService } from '../services/event-dispatch.service';
import { ClickDirective } from './click.directive';

describe('ClickDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let mockEventDispatchService: any;

  beforeEach(() => {
    mockEventDispatchService = {
      trackClick: jasmine.createSpy('trackClick'),
    };

    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([{ path: 'somewhere', component: DummyRouteComponent }])],
      declarations: [TestComponent, DummyRouteComponent, ClickDirective],
      providers: [{ provide: EventDispatchService, useValue: mockEventDispatchService }],
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
    };
    const button = fixture.debugElement.nativeElement.querySelector('#testId');
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
      linkUrl: '/somewhere',
    };
    const link = fixture.debugElement.nativeElement.querySelector('#linkWithRouterLink');
    link.click();
    tick();
    expect(mockEventDispatchService.trackClick).toHaveBeenCalledTimes(1);
    expect(mockEventDispatchService.trackClick).toHaveBeenCalledWith(expectedEvent);
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
    expect(mockEventDispatchService.trackClick).toHaveBeenCalledTimes(1);
    expect(mockEventDispatchService.trackClick).toHaveBeenCalledWith(expectedEvent);
  }));

  it('does not dispatch a click event when no identifier is provided', fakeAsync(() => {
    console.warn = jasmine.createSpy('warn');
    const button = fixture.debugElement.nativeElement.querySelector('.someClass');
    button.click();
    tick();
    expect(mockEventDispatchService.trackClick).toHaveBeenCalledTimes(0);
    expect(console.warn).toHaveBeenCalled();
  }));
});

@Component({
  template: `
    <button mnclClick id="testId">Simple button</button>
    <a mnclClick routerLink="/somewhere" id="linkWithRouterLink">Simple routerLink</a>
    <button [mnclClick]="{ id: 'eventId', label: 'Event label' }" id="useEventId">Event object button</button>
    <button mnclClick class="someClass">Missing id button</button>
    <router-outlet></router-outlet>
  `,
})
class TestComponent {}

@Component({
  template: '',
})
class DummyRouteComponent {}
