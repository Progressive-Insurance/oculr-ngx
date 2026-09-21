/*
 * @license
 * Copyright (c) 2025 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
 */

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ReactiveFormsModule,
  UntypedFormControl,
  UntypedFormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { of, Subject } from 'rxjs';
import { DirectiveEvent } from '../models/directive-event.interface';
import { OculrAngularModule } from '../oculr-ngx.module';
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

function typeValue(id: string, fixture: ComponentFixture<AsyncValidationTestComponent>, value: string): void {
  const input = fixture.nativeElement.querySelector(`#${id}`);
  input.value = value;
  input.dispatchEvent(new Event('input'));
  fixture.detectChanges();
}

function blurElement(id: string, fixture: ComponentFixture<AsyncValidationTestComponent>): void {
  const input = fixture.nativeElement.querySelector(`#${id}`);
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
      imports: [ReactiveFormsModule, TestComponent],
      declarations: [TrackValidationDirective],
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

describe('TrackValidationDirective asynchronous validation', () => {
  let fixture: ComponentFixture<AsyncValidationTestComponent>;
  let mockDispatchService: any;

  beforeEach(() => {
    mockDispatchService = {
      trackValidationError: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, AsyncValidationTestComponent],
      declarations: [TrackValidationDirective],
      providers: [{ provide: DispatchService, useValue: mockDispatchService }, DirectiveService],
    });
    fixture = TestBed.createComponent(AsyncValidationTestComponent);
    fixture.detectChanges();
  });

  it('reports a blur whose asynchronous validation settles invalid after the blur', () => {
    typeValue('async-username', fixture, 'taken');
    blurElement('async-username', fixture);

    expect(mockDispatchService.trackValidationError).not.toHaveBeenCalled();

    fixture.componentInstance.usernameSubject.next({ notUnique: true });
    fixture.componentInstance.usernameSubject.complete();

    expect(mockDispatchService.trackValidationError).toHaveBeenCalledTimes(1);
    expect(mockDispatchService.trackValidationError).toHaveBeenCalledWith({
      id: 'username-unique',
      element: 'username',
      validationErrors: { notUnique: true },
    });

    // The observation must be finished: a later error change emits nothing.
    fixture.componentInstance.usernameControl.setErrors({ late: true });
    expect(mockDispatchService.trackValidationError).toHaveBeenCalledTimes(1);
  });

  it('does not report a blur whose asynchronous validation settles valid', () => {
    typeValue('async-username', fixture, 'available');
    blurElement('async-username', fixture);

    fixture.componentInstance.usernameSubject.next(null);
    fixture.componentInstance.usernameSubject.complete();

    expect(mockDispatchService.trackValidationError).not.toHaveBeenCalled();

    // The observation must be finished: a later error change emits nothing.
    fixture.componentInstance.usernameControl.setErrors({ late: true });
    expect(mockDispatchService.trackValidationError).not.toHaveBeenCalled();
  });

  it('does not report a blur whose control is disabled before its asynchronous validation settles', () => {
    typeValue('async-username', fixture, 'taken');
    blurElement('async-username', fixture);

    fixture.componentInstance.usernameControl.disable();
    expect(mockDispatchService.trackValidationError).not.toHaveBeenCalled();

    // The validator may still complete after the observation has ended.
    fixture.componentInstance.usernameSubject.next({ notUnique: true });
    fixture.componentInstance.usernameSubject.complete();
    expect(mockDispatchService.trackValidationError).not.toHaveBeenCalled();
  });

  it('does not report a failure that settles while typing before any blur', () => {
    typeValue('async-username', fixture, 'taken');
    fixture.componentInstance.usernameSubject.next({ notUnique: true });
    fixture.componentInstance.usernameSubject.complete();

    expect(mockDispatchService.trackValidationError).not.toHaveBeenCalled();
  });

  it('emits once when focusout repeats while the same validation stays pending', () => {
    typeValue('async-username', fixture, 'taken');
    for (let i = 0; i < 3; i++) {
      blurElement('async-username', fixture);
    }

    fixture.componentInstance.usernameSubject.next({ notUnique: true });
    fixture.componentInstance.usernameSubject.complete();

    expect(mockDispatchService.trackValidationError).toHaveBeenCalledTimes(1);
  });

  it('cancels the pending blur report when focus returns, and reports the next blur', () => {
    typeValue('async-username', fixture, 'taken');
    blurElement('async-username', fixture);

    fixture.nativeElement.querySelector('#async-username').dispatchEvent(new Event('focusin'));

    fixture.componentInstance.usernameSubject.next({ notUnique: true });
    expect(mockDispatchService.trackValidationError).not.toHaveBeenCalled();

    typeValue('async-username', fixture, 'other');
    blurElement('async-username', fixture);

    fixture.componentInstance.usernameSubject.next({ notUnique: true });
    fixture.componentInstance.usernameSubject.complete();

    expect(mockDispatchService.trackValidationError).toHaveBeenCalledTimes(1);
  });

  it('cancels the pending blur report when the value changes before settlement', () => {
    typeValue('async-username', fixture, 'taken');
    blurElement('async-username', fixture);

    fixture.nativeElement.querySelector('#async-username').dispatchEvent(new Event('focusin'));
    typeValue('async-username', fixture, 'other');

    fixture.componentInstance.usernameSubject.next({ notUnique: true });
    fixture.componentInstance.usernameSubject.complete();

    expect(mockDispatchService.trackValidationError).not.toHaveBeenCalled();
  });

  it('does not attribute a synchronous replacement validation to an older pending blur', () => {
    const control = fixture.componentInstance.usernameControl;
    typeValue('async-username', fixture, 'taken');
    blurElement('async-username', fixture);

    const order: string[] = [];
    const statusSub = control.statusChanges.subscribe((status: string) => order.push(`status:${status}`));
    const valueSub = control.valueChanges.subscribe((value: string) => order.push(`value:${value}`));
    control.setAsyncValidators(() => of({ notUnique: true }));
    control.setValue('replacement');
    statusSub.unsubscribe();
    valueSub.unsubscribe();

    // The replacement's statusChange lands before its valueChange, which is the ordering
    // that must not be misattributed to the older blur.
    expect(order[0]).toBe('status:INVALID');
    expect(order[1]).toBe('value:replacement');
    expect(mockDispatchService.trackValidationError).not.toHaveBeenCalled();

    blurElement('async-username', fixture);
    expect(mockDispatchService.trackValidationError).toHaveBeenCalledTimes(1);
    expect(mockDispatchService.trackValidationError).toHaveBeenCalledWith({
      id: 'username-unique',
      element: 'username',
      validationErrors: { notUnique: true },
    });
  });

  it('reports an updateOn:blur control when its blur-driven validation settles invalid', () => {
    const input = fixture.nativeElement.querySelector('#blur-username');
    const control = fixture.componentInstance.blurUsernameControl;
    input.value = 'taken';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // updateOn: 'blur' defers the value update until the control loses focus.
    expect(control.value).toBe('');

    input.dispatchEvent(new Event('blur'));
    expect(control.value).toBe('taken');
    expect(control.pending).toBe(true);
    expect(mockDispatchService.trackValidationError).not.toHaveBeenCalled();

    input.dispatchEvent(new Event('focusout'));
    fixture.detectChanges();
    fixture.componentInstance.blurUsernameSubject.next({ notUnique: true });
    fixture.componentInstance.blurUsernameSubject.complete();

    expect(mockDispatchService.trackValidationError).toHaveBeenCalledTimes(1);
    expect(mockDispatchService.trackValidationError).toHaveBeenCalledWith({
      id: 'blur-username',
      element: 'username',
      validationErrors: { notUnique: true },
    });
  });

  it('emits nothing when the fixture is destroyed while validation is pending', () => {
    typeValue('async-username', fixture, 'taken');
    blurElement('async-username', fixture);

    fixture.destroy();

    fixture.componentInstance.usernameSubject.next({ notUnique: true });
    fixture.componentInstance.usernameSubject.complete();

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
  imports: [OculrAngularModule, ReactiveFormsModule],
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

@Component({
  template: `
    <form [formGroup]="asyncForm">
      <input id="async-username" type="text" formControlName="username" [oculrTrackValidation]="usernameEvent" />
    </form>
    <form [formGroup]="blurForm">
      <input id="blur-username" type="text" formControlName="username" [oculrTrackValidation]="{ id: 'blur-username' }" />
    </form>
  `,
  standalone: true,
  imports: [OculrAngularModule, ReactiveFormsModule],
})
class AsyncValidationTestComponent {
  usernameSubject = new Subject<ValidationErrors | null>();
  blurUsernameSubject = new Subject<ValidationErrors | null>();
  usernameEvent: DirectiveEvent = { id: 'username-unique' };

  usernameControl = new UntypedFormControl('', {
    asyncValidators: () => this.usernameSubject.asObservable(),
  });
  blurUsernameControl = new UntypedFormControl('', {
    updateOn: 'blur',
    asyncValidators: () => this.blurUsernameSubject.asObservable(),
  });

  asyncForm = new UntypedFormGroup({ username: this.usernameControl });
  blurForm = new UntypedFormGroup({ username: this.blurUsernameControl });
}
