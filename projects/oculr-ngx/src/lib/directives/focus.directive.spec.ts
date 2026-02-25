/*
 * @license
 * Copyright (c) 2025 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
 */

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnalyticEvent } from '../models/analytic-event.interface';
import { InteractionDetail } from '../models/interaction-detail.enum';
import { InteractionType } from '../models/interaction-type.enum';
import { OculrAngularModule } from '../oculr-ngx.module';
import { DirectiveService } from '../services/directive.service';
import { DispatchService } from '../services/dispatch.service';
import { FocusDirective } from './focus.directive';

describe('FocusDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let mockDispatchService: any;
  let expectedEvent: AnalyticEvent;

  beforeEach(() => {
    mockDispatchService = {
      trackFocus: vi.fn(),
    };

    TestBed.configureTestingModule({
      declarations: [FocusDirective],
      providers: [{ provide: DispatchService, useValue: mockDispatchService }, DirectiveService],
      imports: [TestComponent],
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

  it('dispatches a focus event when clicked with a mouse', async () => {
    vi.useFakeTimers();
    expectedEvent.interactionDetail = InteractionDetail.mouse;
    const input = fixture.nativeElement.querySelector('#password');
    input.dispatchEvent(new Event('mousedown'));
    input.dispatchEvent(new Event('focus'));
    await vi.runAllTimersAsync();
    expect(mockDispatchService.trackFocus).toHaveBeenCalledTimes(1);
    expect(mockDispatchService.trackFocus).toHaveBeenCalledWith(expectedEvent);
    vi.useRealTimers();
  });

  it('dispatches a focus event when using a keyboard', async () => {
    vi.useFakeTimers();
    const input = fixture.nativeElement.querySelector('#password');
    input.dispatchEvent(new Event('focus'));
    await vi.runAllTimersAsync();
    expect(mockDispatchService.trackFocus).toHaveBeenCalledTimes(1);
    expect(mockDispatchService.trackFocus).toHaveBeenCalledWith(expectedEvent);
    vi.useRealTimers();
  });

  it('dispatches a focus event when using touch', async () => {
    vi.useFakeTimers();
    expectedEvent.interactionDetail = InteractionDetail.touch;
    const input = fixture.nativeElement.querySelector('#password');
    input.dispatchEvent(new Event('touchstart'));
    input.dispatchEvent(new Event('mousedown'));
    input.dispatchEvent(new Event('focus'));
    await vi.runAllTimersAsync();
    expect(mockDispatchService.trackFocus).toHaveBeenCalledTimes(1);
    expect(mockDispatchService.trackFocus).toHaveBeenCalledWith(expectedEvent);
    vi.useRealTimers();
  });

  it('prioritizes event properties over host element attributes', async () => {
    vi.useFakeTimers();
    expectedEvent.id = 'personalPhone';
    expectedEvent.inputType = 'tel';
    expectedEvent.label = 'Enter your phone number:';
    const input = fixture.nativeElement.querySelector('#phone');
    input.dispatchEvent(new Event('focus'));
    await vi.runAllTimersAsync();
    expect(mockDispatchService.trackFocus).toHaveBeenCalledTimes(1);
    expect(mockDispatchService.trackFocus).toHaveBeenCalledWith(expectedEvent);
    vi.useRealTimers();
  });

  it('elements that are not inputs do not include input type', async () => {
    vi.useFakeTimers();
    expectedEvent.id = 'continue';
    expectedEvent.element = 'button';
    expectedEvent.label = 'Continue';
    delete expectedEvent.inputType;
    const input = fixture.nativeElement.querySelector('#continue');
    input.dispatchEvent(new Event('focus'));
    await vi.runAllTimersAsync();
    expect(mockDispatchService.trackFocus).toHaveBeenCalledTimes(1);
    expect(mockDispatchService.trackFocus).toHaveBeenCalledWith(expectedEvent);
    vi.useRealTimers();
  });

  it('does not dispatch a focus event when an identifier is missing', async () => {
    vi.useFakeTimers();
    const warnSpy = vi.spyOn(console, 'warn');
    const input = fixture.nativeElement.querySelector('.email');
    input.dispatchEvent(new Event('focus'));
    await vi.runAllTimersAsync();
    expect(mockDispatchService.trackFocus).toHaveBeenCalledTimes(0);
    expect(warnSpy).toHaveBeenCalled();
    vi.useRealTimers();
  });
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
  standalone: true,
  imports: [OculrAngularModule],
})
class TestComponent {}
