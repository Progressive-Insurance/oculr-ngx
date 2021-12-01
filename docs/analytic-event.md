[API](./README.md) > [Interfaces](./README.md#Interfaces)

# AnalyticEvent

## Description

An interface that is used with dispatching analytic event using [ChangeDirective](./change-directive.md), [ClickDirective](./click-directive.md), [DisplayDirective](./display-directive.md), [FocusDirective](./focus-directive.md), and [EventDispatchService]().

## Properties

| Property             | Desciption                                                     |
| -------------------- | -------------------------------------------------------------- |
| `id: string`         | A useful indentifier for the event.                            |
| `label?: string`     | **optional** </br> An easier to read description of the event. |
| `element?: string`   | **optional** </br> The HTML element associated with the event. |
| `inputType?: string` | **optional** </br> The type of input HTML elements.            |
| `scopes?: []`        | **optional** </br> A list of scopes to include with the event. |

## Example

In this example an `AnalyticEvent` is built in the Angular component's `ngOnInit()` and then used by the [oculrDisplay](display-directive.md) directive. The objects in `scopes` are completely customizable and determined by consuming applications.

```typescript
import { AnalyticEvent } from 'oculr-ngx';

@Component({
  template: `<div [oculrDisplay]="bannerEvent">Important banner message</div>`,
})
export class MyComponent implements OnInit {
  bannerEvent: AnalyticEvent;

  ngOnInit() {
    this.bannerEvent = {
      id: 'bannerMessage',
      label: 'Display important banner message',
      scopes: [{
        // the following properties are for example only
        test: 'messagePosition'
        experience: 'A'
      }]
    };
  }
}
```

## Feedback

Is something not working or unclear? Please create an [issue](https://github.com/Progressive/oculr-ngx/issues/new/choose) or [PR](https://github.com/Progressive/oculr-ngx/blob/main/CONTRIBUTING.md).
