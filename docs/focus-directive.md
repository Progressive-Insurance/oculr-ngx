[API](./README.md) > [Directives](./README.md#Directives)

# FocusDirective

## Description

A directive that dispatches an interaction event when an element gains focus.

## Selector

```
oculrFocus
```

## Properties

| Property                    | Description                                                                                                                        |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `oculrFocus: AnalyticEvent` | **optional** </br> [AnalyticEvent](./analytic-event.md) holds useful identifiers and data determined by the consuming application. |

## Quick start

Add the directive `oculrFocus` to any host elements in an Angular component's template that can gain focus. This directive never captures the value of an input element and was specifically created for the input elements types of `email`, `password`, and `tel` that would contain sensitive information. To get the most information from interactions with input elements we recommend using [oculrChange](./change-directive.md).

### Radio input

```html
<label for="password">Password:</label> <input oculrFocus type="password" id="password" formControlName="password" />
```

It is required to include an identifier with the interaction event to help with analysis later. By default the directive will use the host element's `id` attribute if no other identifier is provided.

Another way to include an identifier is by using property binding with the `oculrFocus` directive.

```html
<label for="password">Confirm password:</label>
<input [oculrFocus]="{ id: 'confirmPassword' }" type="password" id="password" formControlName="password" />
```

An `AnalyticEvent` type object is being used in this property binding, where `confirmPassword` will be used as the identifier since it takes priority over the host element's `id` attribute. It is recommended to still include an `id` attribute in this scenario as it is used for linking the label to the form control. There are other properties that can be set on the `AnalyticEvent` object, which you can read about more in the [AnalyticEvent](./analytic-event.md) documentation.

To minimize the amount of content done in the component's template, it is recommended to prepare any `AnalyticEvent` objects in the `ngOnInit()` of the component.

```typescript
import { AnalyticEvent } from 'oculr-ngx';

@Component({
  template: `
    <label for="password">Confirm password:</label>
    <input [oculrFocus]="passwordEvent" type="password" id="password" formControlName="password" />
  `,
})
export class FormComponent implements OnInit {
  passwordEvent: AnalyticEvent;

  ngOnInit() {
    passwordEvent = { id: 'confirmPassword' };
  }
}
```

## Feedback

Is something not working or unclear? Please create an [issue](https://github.com/Progressive/oculr-ngx/issues/new/choose) or [PR](https://github.com/Progressive/oculr-ngx/blob/main/CONTRIBUTING.md).
