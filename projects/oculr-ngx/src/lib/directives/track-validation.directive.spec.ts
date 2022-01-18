/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AnalyticEvent } from '../models/analytic-event.interface';
import { DirectiveService } from '../services/directive.service';
import { DispatchService } from '../services/dispatch.service';
import { TrackValidationDirective } from './track-validation.directive';

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
      trackValidationError: jasmine.createSpy('trackValidationError'),
    };

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [TestComponent, TrackValidationDirective],
      providers: [{ provide: DispatchService, useValue: mockDispatchService }, DirectiveService],
    });
    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
  });

  it('allows a pre-built AnalyticEvent and dispatches a validation error event', () => {
    touchControl('first-name', fixture);

    expect(mockDispatchService.trackValidationError).toHaveBeenCalledOnceWith({
      id: 'validation-error',
      element: 'firstName',
      validationErrors: { required: true },
    });
  });

  it('allows an inline object and dispatches a validation error event', () => {
    touchControl('last-name', fixture);

    expect(mockDispatchService.trackValidationError).toHaveBeenCalledOnceWith({
      id: 'last-name',
      element: 'lastName',
      validationErrors: { required: true },
    });
  });

  it('allows for no input to be specified', () => {
    touchControl('address', fixture);

    expect(mockDispatchService.trackValidationError).toHaveBeenCalledOnceWith({
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
})
class TestComponent {
  testForm = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required),
    nickname: new FormControl(''),
  });
  validationEventInput: AnalyticEvent = { id: 'validation-error' };
}
