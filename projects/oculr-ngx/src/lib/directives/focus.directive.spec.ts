/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { AnalyticEvent } from '../models/analytic-event.interface';
import { InteractionDetail } from '../models/interaction-detail.enum';
import { InteractionType } from '../models/interaction-type.enum';
import { DirectiveService } from '../services/directive.service';
import { DispatchService } from '../services/dispatch.service';
import { FocusDirective } from './focus.directive';

describe('FocusDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let mockDispatchService: any;
  let expectedEvent: AnalyticEvent;

  beforeEach(() => {
    mockDispatchService = {
      trackFocus: jasmine.createSpy('trackFocus'),
    };

    TestBed.configureTestingModule({
      declarations: [TestComponent, FocusDirective],
      providers: [{ provide: DispatchService, useValue: mockDispatchService }, DirectiveService],
    });
    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    expectedEvent = {
      id: 'password',
      element: 'input',
      inputType: 'password',
      interactionType: InteractionType.focus,
      interactionDetail: InteractionDetail.keyboard,
      label: 'Password:',
    };
  });

  it('dispatches a focus event when clicked with a mouse', fakeAsync(() => {
    expectedEvent.interactionDetail = InteractionDetail.mouse;
    const input = fixture.nativeElement.querySelector('#password');
    input.dispatchEvent(new Event('mousedown'));
    input.dispatchEvent(new Event('focus'));
    expect(mockDispatchService.trackFocus).toHaveBeenCalledTimes(1);
    expect(mockDispatchService.trackFocus).toHaveBeenCalledWith(expectedEvent);
  }));

  it('dispatches a focus event when using a keyboard', fakeAsync(() => {
    const input = fixture.nativeElement.querySelector('#password');
    input.dispatchEvent(new Event('focus'));
    expect(mockDispatchService.trackFocus).toHaveBeenCalledTimes(1);
    expect(mockDispatchService.trackFocus).toHaveBeenCalledWith(expectedEvent);
  }));

  it('dispatches a focus event when using touch', fakeAsync(() => {
    expectedEvent.interactionDetail = InteractionDetail.touch;
    const input = fixture.nativeElement.querySelector('#password');
    input.dispatchEvent(new Event('touchstart'));
    input.dispatchEvent(new Event('mousedown'));
    input.dispatchEvent(new Event('focus'));
    expect(mockDispatchService.trackFocus).toHaveBeenCalledTimes(1);
    expect(mockDispatchService.trackFocus).toHaveBeenCalledWith(expectedEvent);
  }));

  it('prioritizes event properties over host element attributes', fakeAsync(() => {
    expectedEvent.id = 'personalPhone';
    expectedEvent.inputType = 'tel';
    expectedEvent.label = 'Enter your phone number:';
    const input = fixture.nativeElement.querySelector('#phone');
    input.dispatchEvent(new Event('focus'));
    expect(mockDispatchService.trackFocus).toHaveBeenCalledTimes(1);
    expect(mockDispatchService.trackFocus).toHaveBeenCalledWith(expectedEvent);
  }));

  it('elements that are not inputs do not include input type', fakeAsync(() => {
    expectedEvent.id = 'continue';
    expectedEvent.element = 'button';
    expectedEvent.label = 'Continue';
    delete expectedEvent.inputType;
    const input = fixture.nativeElement.querySelector('#continue');
    input.dispatchEvent(new Event('focus'));
    expect(mockDispatchService.trackFocus).toHaveBeenCalledTimes(1);
    expect(mockDispatchService.trackFocus).toHaveBeenCalledWith(expectedEvent);
  }));

  it('does not dispatch a focus event when an identifier is missing', fakeAsync(() => {
    const warnSpy = spyOn(console, 'warn');
    const input = fixture.nativeElement.querySelector('.email');
    input.dispatchEvent(new Event('focus'));
    expect(mockDispatchService.trackFocus).toHaveBeenCalledTimes(0);
    expect(warnSpy).toHaveBeenCalled();
  }));
});

@Component({
  template: `
    <label for="password">Password:</label>
    <input oculrFocus type="password" id="password" />

    <label for="phone">Enter your phone number:</label>
    <input [oculrFocus]="{ id: 'personalPhone' }" type="tel" id="phone" />

    <input oculrFocus type="email" class="email" />

    <button oculrFocus id="continue">Continue</button>
  `,
})
class TestComponent {}
