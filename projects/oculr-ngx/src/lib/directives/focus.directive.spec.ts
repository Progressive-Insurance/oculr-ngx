/*
 * @license
 * Copyright (c) 2025 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
*/

import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { AnalyticEvent } from '../models/analytic-event.interface';
import { InteractionDetail } from '../models/interaction-detail.enum';
import { InteractionType } from '../models/interaction-type.enum';
import { DirectiveService } from '../services/directive.service';
import { DispatchService } from '../services/dispatch.service';
import { FocusDirective } from './focus.directive';
import { OculrAngularModule } from 'dist/oculr-ngx/types/oculr-ngx';

describe('FocusDirective', () => {
    let fixture: ComponentFixture<TestComponent>;
    let mockDispatchService: any;
    let expectedEvent: AnalyticEvent;

    beforeEach(() => {
        mockDispatchService = {
            trackFocus: vi.fn(),
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
        const warnSpy = vi.spyOn(console, 'warn');
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
    standalone: true,
    imports: [OculrAngularModule]
})
class TestComponent {
}
