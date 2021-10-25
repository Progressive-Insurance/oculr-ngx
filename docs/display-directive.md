[API](./README.md) > [Directives](./README.md#Directives)

# DisplayDirective

## Description

A directive that dispatches a display event when an element is rendered.

## Selector

```
mnclDisplay
```

## Properties

| Property                     | Description                                                                                                                      |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `mcnlDisplay?: DisplayEvent` | **optional** </br> [DisplayEvent](./display-event.md) holds useful identifiers and data determined by the consuming application. |

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

A `DisplayEvent` type object is being used in this property binding. There are other properties that can be set on the `DisplayEvent` object, which you can read about more in the [DisplayEvent](./display-event.md) documentation. To minimize the amount of content done in the component's template, it is recommended to prepare any `DisplayEvent` objects in the `ngOnInit()` of the component.

```typescript
import { DisplayEvent } from 'monocle-ngx';

@Component({
  template: `<div [mnclDisplay]="myDisplayEvent">Something being displayed</div>`,
})
export class MyComponent implements OnInit {
  myDisplayEvent: DisplayEvent;

  ngOnInit() {
    this.myDisplayEvent = { id: 'myDisplay' };
  }
}
```

:stop_sign: Do not use on Angular's `ng-container`, `ng-content`, or `ng-template` elements as these do not render.

## Alternate methods

Some situations may require a consuming application to have more control when the display events are dispatched. Use the [EventDispatchService]() to have more control when dispatching display events.

## Feedback

Is something not working or unclear? Please create an [issue](https://github.com/Progressive/monocle-ngx/issues/new/choose) or [PR](https://github.com/Progressive/monocle-ngx/blob/main/CONTRIBUTING.md).
