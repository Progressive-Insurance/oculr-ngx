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

## Feedback

Is something not working or unclear? Please create an [issue](https://github.com/Progressive/oculr-ngx/issues/new/choose) or [PR](https://github.com/Progressive/oculr-ngx/blob/main/CONTRIBUTING.md).
