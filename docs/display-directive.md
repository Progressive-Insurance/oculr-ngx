[API](./README.md) > [Directives](./README.md#Directives)

# DisplayDirective

## Description

A directive that dispatches a display event when an element is rendered.

## Selector

```
oculrDisplay
```

## Properties

| Property                       | Description                                                                                                                        |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `oculrDisplay?: AnalyticEvent` | **optional** </br> [AnalyticEvent](./analytic-event.md) holds useful identifiers and data determined by the consuming application. |

## Quick start

Add the directive `oculrDisplay` to a host element in an Angular component's template.

```html
<div oculrDisplay id="saleMessage">Half off tacos today!</div>
```

It is required to include an identifier with the display event to help with analysis later. By default the directive will use the host element's `id` attribute if no other identifier is provided.

Another way to include an identifier is by using property binding with the `oculrDisplay` directive.

```html
<div [oculrDisplay]="{ id: 'saleMessage' }">Half off tacos today!</div>
```

An `AnalyticEvent` type object is being used in this property binding. There are other properties that can be set on the `AnalyticEvent` object, which you can read about more in the [AnalyticEvent](./analytic-event.md) documentation. To minimize the amount of content done in the component's template, it is recommended to prepare any `AnalyticEvent` objects in the `ngOnInit()` of the component.

```typescript
import { AnalyticEvent } from 'oculr-ngx';

@Component({
  template: `<div [oculrDisplay]="myAnalyticEvent">Half off tacos today!</div>`,
})
export class MyComponent implements OnInit {
  myAnalyticEvent: AnalyticEvent;

  ngOnInit() {
    this.myAnalyticEvent = { id: 'saleMessage' };
  }
}
```

:stop_sign: Do not use on Angular's `ng-container`, `ng-content`, or `ng-template` elements as these do not render.

## Example output

The following data is an example of the output when using the `oculrDisplay` directive.

```json
{
  "id": "saleMessage",
  "element": "div",
  "eventType": "DISPLAY_EVENT",
  "location": {
    "hostName": "http://example-site.com",
    "path": "/menu",
    "url": "http://example-site.com/menu",
    "queryString": "",
    "virtualPageName": "/menu"
  }
}
```

## Alternate methods

Some situations may require a consuming application to have more control when the display events are dispatched. Use the [EventDispatchService](.event-dispatch-service.md) to have more control when dispatching display events.

## Feedback

Is something not working or unclear? Please create an [issue](https://github.com/Progressive/oculr-ngx/issues/new/choose) or [PR](https://github.com/Progressive/oculr-ngx/blob/main/CONTRIBUTING.md).
