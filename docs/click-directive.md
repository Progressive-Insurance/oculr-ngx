[API](./README.md) > [Directives](./README.md#Directives)

# ClickDirective

## Description

A directive that dispatches an interaction event when an element is clicked.

## Selector

```
oculrClick
```

## Properties

| Property                     | Description                                                                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `oculrClick: DirectiveEvent` | **optional** </br> [DirectiveEvent](./directive-event.md) holds useful identifiers and data determined by the consuming application. |

## Quick start

Add the directive `oculrClick` to a host button or anchor element in an Angular component's template.

### Button

```html
<button oculrClick id="addToOrder">Add to order</button>
```

### Link

```html
<a oculrClick routerLink="/order" id="currentOrder">Order</a>
```

It is required to include an identifier with the interaction event to help with analysis later. By default the directive will use the host element's `id` attribute if no other identifier is provided.

Another way to include an identifier is by using property binding with the `oculrClick` directive.

```html
<button [oculrClick]="{ id: 'myButton' }">Continue</button>
```

An `DirectiveEvent` type object is being used in this property binding. There are other properties that can be set on the `DirectiveEvent` object, which you can read about more in the [DirectiveEvent](./directive-event.md) documentation. To minimize the amount of content done in the component's template, it is recommended to prepare any `DirectiveEvent` objects in the `ngOnInit()` of the component.

```typescript
import { DirectiveEvent } from 'oculr-ngx';

@Component({
  template: `<button [oculrClick]="addToOrderEvent">Add to order</button>`,
})
export class MyComponent implements OnInit {
  addToOrderEvent: DirectiveEvent;

  ngOnInit() {
    addToOrderEvent = { id: 'addToOrder' };
  }
}
```

## Example output

The following data is an example of the output when using the `oculrClick` directive on button element.

```json
{
  "id": "addToOrder",
  "interactionType": "click",
  "interactionDetail": "mouse",
  "element": "button",
  "label": "Add to order",
  "eventType": "CLICK_EVENT",
  "location": {
    "hostName": "http://example-site.com",
    "path": "/menu",
    "url": "http://example-site.com/menu",
    "queryString": "",
    "virtualPageName": "/menu"
  }
}
```

## Feedback

Is something not working or unclear? Please create an [issue](https://github.com/Progressive/oculr-ngx/issues/new/choose) or [PR](https://github.com/Progressive/oculr-ngx/blob/main/CONTRIBUTING.md).
