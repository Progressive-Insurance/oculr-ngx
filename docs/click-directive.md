[API](./README.md) > [Directives](./README.md#Directives)

# ClickDirective

## Description

A directive that dispatches an interaction event when an element is clicked.

## Selector

```
mnclClick
```

## Properties

| Property                   | Description                                                                                                     |
| -------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `mcnlClick: AnalyticEvent` | **optional** </br> [AnalyticEvent]() holds useful identifiers and data determined by the consuming application. |

## Quick start

Add the directive `mnclClick` to a host button or anchor element in an Angular component's template.

### Button

```html
<button mnclClick id="myButton">Continue</button>
```

### Link

```html
<a mnclClick routerLink="/home" id="myLink">Cancel</a>
```

It is required to include an identifier with the interaction event to help with analysis later. By default the directive will use the host element's `id` attribute if no other identifier is provided.

Another way to include an identifier is by using property binding with the `mnclClick` directive.

```html
<button [mnclClick]="{ id: 'myButton' }">Continue</button>
```

An `AnalyticEvent` type object is being used in this property binding. There are other properties that can be set on the `AnalyticEvent` object, which you can read about more in the [AnalyticEvent]() documentation. To minimize the amount of content done in the component's template, it is recommended to prepare any `AnalyticEvent` objects in the `ngOnInit()` of the component.

```typescript
import { AnalyticEvent } from 'monocle-ngx';

@Component({
  template: `<button [mnclClick]="myButtonEvent">Continue</button>`,
})
export class MyComponent implements OnInit {
  myButtonEvent: AnalyticEvent;

  ngOnInit() {
    myButtonEvent = { id: 'myButton' };
  }
}
```

## Feedback

Is something not working or unclear? Please create an [issue](https://github.com/Progressive/monocle-ngx/issues/new/choose) or [PR](https://github.com/Progressive/monocle-ngx/blob/main/CONTRIBUTING.md).
