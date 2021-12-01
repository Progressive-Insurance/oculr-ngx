[API](./README.md) > [Directives](./README.md#Directives)

# ClickDirective

## Description

A directive that dispatches an interaction event when an element is clicked.

## Selector

```
oculrClick
```

## Properties

| Property                    | Description                                                                                                                        |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `oculrClick: AnalyticEvent` | **optional** </br> [AnalyticEvent](./analytic-event.md) holds useful identifiers and data determined by the consuming application. |

## Quick start

Add the directive `oculrClick` to a host button or anchor element in an Angular component's template.

### Button

```html
<button oculrClick id="myButton">Continue</button>
```

### Link

```html
<a oculrClick routerLink="/home" id="myLink">Cancel</a>
```

It is required to include an identifier with the interaction event to help with analysis later. By default the directive will use the host element's `id` attribute if no other identifier is provided.

Another way to include an identifier is by using property binding with the `oculrClick` directive.

```html
<button [oculrClick]="{ id: 'myButton' }">Continue</button>
```

An `AnalyticEvent` type object is being used in this property binding. There are other properties that can be set on the `AnalyticEvent` object, which you can read about more in the [AnalyticEvent](./analytic-event.md) documentation. To minimize the amount of content done in the component's template, it is recommended to prepare any `AnalyticEvent` objects in the `ngOnInit()` of the component.

```typescript
import { AnalyticEvent } from 'oculr-ngx';

@Component({
  template: `<button [oculrClick]="myButtonEvent">Continue</button>`,
})
export class MyComponent implements OnInit {
  myButtonEvent: AnalyticEvent;

  ngOnInit() {
    myButtonEvent = { id: 'myButton' };
  }
}
```

## Feedback

Is something not working or unclear? Please create an [issue](https://github.com/Progressive/oculr-ngx/issues/new/choose) or [PR](https://github.com/Progressive/oculr-ngx/blob/main/CONTRIBUTING.md).
