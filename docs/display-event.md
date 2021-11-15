[API](./README.md) > [Interfaces](./README.md#Interfaces)

# DisplayEvent

## Description

An interface that is used with dispatching display event using [DisplayDirective](./display-directive.md) or [EventDispatchService]().

## Properties

| Property         | Desciption                                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `id: string`     | A useful indentifier for the event.                                                                                                         |
| `label?: string` | **optional** </br> An easier to read description of the event.                                                                              |
| `scopes?: []`    | **optional** </br> A list of scopes to include with the event. See [initialization and configuration]() to setup up reusable custom scopes. |

## Example

In this example a `DisplayEvent` is built in the Angular component's `ngOnInit()` and then used by the [oculrDisplay](display-directive.md) directive. The objects in `scopes` are completely customizable and determined by consuming applications.

```typescript
import { DisplayEvent } from 'oculr-ngx';

@Component({
  template: `<div [oculrDisplay]="bannerEvent">Important banner message</div>`,
})
export class MyComponent implements OnInit {
  bannerEvent: DisplayEvent;

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
