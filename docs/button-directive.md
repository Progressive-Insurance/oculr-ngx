[API](./README.md) > [Directives](./README.md#Directives)

# ButtonDirective

## Description

A directive that dispatches an interaction event when a button element is clicked.

## Selector

```
mnclButton
```

## Properties

| Property                    | Description                                                                                                     |
| --------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `mcnlButton: AnalyticEvent` | **optional** </br> [AnalyticEvent]() holds useful identifiers and data determined by the consuming application. |

## Quick start

Add the directive `mnclButton` to a host button element in an Angular component's template.

```html
<button mnclButton id="myButton">Continue</button>
```

It is required to include an identifier with the interaction event to help with analysis later. By default the directive will use the host button element's `id` attribute if no other identifier is provided.

Another way to include an identifier is by using property binding with the `mnclButton` directive.

```html
<button [mnclButton]="{ id: 'myButton' }">Continue</button>
```

An `AnalyticEvent` type object is being used in this property binding. There are other properties that can be set on the `AnalyticEvent` object, which you can read about more in the [AnalyticEvent]() documentation. To minimize the amount of content done in the component's template, it is recommended to prepare any `AnalyticEvent` objects in the `ngOnInit()` of the component.

```typescript
import { AnalyticEvent } from 'monocle-ngx';

@Component({
  template: `<button [mnclBUtton]="myButtonEvent">Continue</button>`,
})
export class MyComponent {
  myButtonEvent = { id: 'myButton' } as AnalyticEvent;
}
```

## Feedback

Is something not working or unclear? Please create an [issue](https://github.com/Progressive/monocle-ngx/issues/new/choose) or [PR](https://github.com/Progressive/monocle-ngx/blob/main/CONTRIBUTING.md).
