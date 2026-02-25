/*
 * @license
 * Copyright (c) 2025 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
*/

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormControl, UntypedFormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DirectiveEvent } from '../models/directive-event.interface';
import { DirectiveService } from '../services/directive.service';
import { DispatchService } from '../services/dispatch.service';
import { TrackValidationDirective } from './track-validation.directive';
import { OculrAngularModule } from 'dist/oculr-ngx/types/oculr-ngx';

function touchControl(id: string, fixture: ComponentFixture<TestComponent>): void {
    const input = fixture.nativeElement.querySelector(`#${id}`);
    input.dispatchEvent(new Event('focus'));
    input.dispatchEvent(new Event('blur'));
    input.dispatchEvent(new Event('focusout'));
    fixture.detectChanges();
}

describe('TrackValidationDirective', () => {
    let fixture: ComponentFixture<TestComponent>;
    let mockDispatchService: any;

    beforeEach(() => {
        mockDispatchService = {
            trackValidationError: vi.fn(),
        };

        TestBed.configureTestingModule({
            imports: [ReactiveFormsModule],
            declarations: [TestComponent, TrackValidationDirective],
            providers: [{ provide: DispatchService, useValue: mockDispatchService }, DirectiveService],
        });
        fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
    });

    it('allows a pre-built DirectiveEvent and dispatches a validation error event', () => {
        touchControl('first-name', fixture);

        expect(mockDispatchService.trackValidationError).toHaveBeenCalledTimes(1);

        expect(mockDispatchService.trackValidationError).toHaveBeenCalledWith({
            id: 'validation-error',
            element: 'firstName',
            validationErrors: { required: true },
        });
    });

    it('allows an inline object and dispatches a validation error event', () => {
        touchControl('last-name', fixture);

        expect(mockDispatchService.trackValidationError).toHaveBeenCalledTimes(1);

        expect(mockDispatchService.trackValidationError).toHaveBeenCalledWith({
            id: 'last-name',
            element: 'lastName',
            validationErrors: { required: true },
        });
    });

    it('allows for no input to be specified', () => {
        touchControl('address', fixture);

        expect(mockDispatchService.trackValidationError).toHaveBeenCalledTimes(1);

        expect(mockDispatchService.trackValidationError).toHaveBeenCalledWith({
            element: 'address',
            validationErrors: { required: true },
        });
    });

    it('will not fire if a control has not been touched yet', () => {
        const input = fixture.nativeElement.querySelector(`#address`);
        input.dispatchEvent(new Event('focus'));
        fixture.detectChanges();

        expect(mockDispatchService.trackValidationError).not.toHaveBeenCalled();
    });

    it('will not fire if there are no validation errors on the control', () => {
        touchControl('nickname', fixture);

        expect(mockDispatchService.trackValidationError).not.toHaveBeenCalled();
    });
});

@Component({
    template: `
    <form [formGroup]="testForm">
      <input id="first-name" type="text" formControlName="firstName" [oculrTrackValidation]="validationEventInput" />
      <input id="last-name" type="text" formControlName="lastName" [oculrTrackValidation]="{ id: 'last-name' }" />
      <input id="address" type="text" formControlName="address" oculrTrackValidation />
      <input id="nickname" type="text" formControlName="nickname" oculrTrackValidation />
    </form>
  `,
    standalone: true,
    imports: [OculrAngularModule, ReactiveFormsModule]
})
class TestComponent {
    testForm = new UntypedFormGroup({
        firstName: new UntypedFormControl('', Validators.required),
        lastName: new UntypedFormControl('', Validators.required),
        address: new UntypedFormControl('', Validators.required),
        nickname: new UntypedFormControl(''),
    });
    validationEventInput: DirectiveEvent = { id: 'validation-error' };
}
