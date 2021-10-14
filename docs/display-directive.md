[API]() > [Directives]()

# DisplayDirective

## Description

A directive that dispatches a display event when an element is rendered.

## Selector

```
mnclDisplay
```

## Properties

| Property             | Description                                                                                           |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| `mcnlDisplay: Event` | **optional** </br> [Event]() holds useful indefiers and data determined by the consuming application. |

## Quick start

Add the directive `mnclDisplay` to a host element in an Angular component's template.

```html
<div mnclDisplay>Something being displayed</div>
```

It is recommended to include an identifier with the display event to help with analysis later. By default the directive will use the host element's `id` attribute if no other identifier is provided.

```html
<div id="myDisplay" mnclDisplay>Something being displayed</div>
```

Another way to include an identifier is by using property binding with the `mnclDisplay` directive.

```html
<div [mnclDispay]="{ eventId: 'myDisplay' }">Something being displayed</div>
```

An `Event` type object is being used in this property binding. There are other properties that can be set on the `Event` object, which you can read about more in the [deeper dive section](#deeper-dive) below. To minimize the amount of content done in the component's template, it is recommended to prepare any analytic `Event` objects in the `ngOnInit()` of the component.

```typescript
import { Event } from 'monocle-ngx';

@Component({
  template: `<div [mnclDispay]="myDisplayEvent">Something being displayed</div>`,
})
export class MyComponent {
  myDisplayEvent = { eventId: 'myDisplay' } as Event;
}
```

:stop_sign: Do not use on Angular's `ng-container`, `ng-content`, or `ng-template` elements as these do not render.

## Deeper dive
