[API](./README.md) > [Directives](./README.md#Directives)

# TrackValidationDirective

## Description

A directive that dispatches a validation error event from a Reactive Forms control.

## Selector

```
oculrTrackValidation
```

## Properties

| Property                               | Description                                                                                                       |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `oculrTrackValidation: DirectiveEvent` | [DirectiveEvent](./directive-event.md) holds useful identifiers and data determined by the consuming application. |

## Quick start

Add the `oculrTrackValidation` directive to any Reactive Forms control.

```html
<input oculrTrackValidation type="text" formControlName="projectUrl" />
```

It is possible to override any [DirectiveEvent](./directive-event.md) property value by passing it in. To minimize the amount of content done in the component's template, it is recommended to prepare any `DirectiveEvent` objects in the `ngOnInit()` of the component.

```html
<input [oculrTrackValidation]="validationEventInput" type="text" formControlName="projectUrl" />
```

```typescript
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DirectiveEvent } from 'oculr-ngx';

@Component()
export class FormComponent implements OnInit {
  validationEventInput: DirectiveEvent;
  contactForm: FormGroup;

  ngOnInit() {
    this.contactForm = new FormGroup({ projectUrl: new FormControl('', Validators.required) });
    this.validationEventInput = { id: 'validation-error' };
  }
}
```

## Asynchronous validation

The directive reports validation errors regardless of whether they are produced by
synchronous or asynchronous validators. When the control loses focus while an
asynchronous validation is still pending, the directive keeps a short-lived observation on
the control's status until that validation settles:

- If the settled result is invalid, exactly one event is dispatched with the final
  validation errors and any `DirectiveEvent` overrides.
- If the validation settles as valid, or the control is disabled, no event is dispatched
  and the observation ends.
- Repeated blurs while the same validation stays pending do not multiply the number of
  events for the single settling result.
- The observation also ends when the directive is destroyed; a validator that completes
  afterwards emits nothing.

### Blur semantics for a pending validation

If the user returns focus to the control, or changes its value, before the pending
validation settles, the outstanding report for the earlier blur is **canceled**. This is a
deliberate, conservative choice: because the editing session is active again, the earlier
blur is not reported. The next blur starts a fresh observation that tracks its own
validation result.

## Feedback

Is something not working or unclear? Please create an [issue](https://github.com/progressive-insurance/oculr-ngx/issues/new/choose) or [PR](https://github.com/progressive-insurance/oculr-ngx/blob/main/CONTRIBUTING.md).
