[API]() > [Directives]()

# DisplayDirective

## Description

A directive that dispatches a display event when an element is rendered.

## Selector

```
mnclDisplay
```

## Properties

| Property                     | Description                                                                                                     |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `mcnlDisplay: AnalyticEvent` | **optional** </br> [AnalyticEvent]() holds useful identifiers and data determined by the consuming application. |

## Quick start

Add the directive `mnclDisplay` to a host element in an Angular component's template.

```html
<div mnclDisplay id="myDisplay">Something being displayed</div>
```

It is required to include an identifier with the display event to help with analysis later. By default the directive will use the host element's `id` attribute if no other identifier is provided.

Another way to include an identifier is by using property binding with the `mnclDisplay` directive.

```html
<div [mnclDispay]="{ id: 'myDisplay' }">Something being displayed</div>
```

An `AnalyticEvent` type object is being used in this property binding. There are other properties that can be set on the `AnalyticEvent` object, which you can read about more in the [AnalyticEvent]() documentation. To minimize the amount of content done in the component's template, it is recommended to prepare any `AnalyticEvent` objects in the `ngOnInit()` of the component.

```typescript
import { AnalyticEvent } from 'monocle-ngx';

@Component({
  template: `<div [mnclDispay]="myDisplayEvent">Something being displayed</div>`,
})
export class MyComponent {
  myDisplayEvent = { id: 'myDisplay' } as AnalyticEvent;
}
```

:stop_sign: Do not use on Angular's `ng-container`, `ng-content`, or `ng-template` elements as these do not render.

## Alternate methods

Some situations may require a consuming application to have more control when the display events are dispatched. Use the [EventDispatchService]() to have more control when dispatching display events.
