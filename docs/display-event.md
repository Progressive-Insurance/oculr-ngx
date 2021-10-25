[API](./README.md) > [Interfaces](./README.md#Interfaces)

# DisplayEvent

## Description

An interface that is used with dispatching display event using [DisplayDirective](./display-directive.md) or [EventDispatchService]().

## Properties

| Property                                | Desciption                                                                                                                                                |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id: string`                            | A useful indentifier for the event.                                                                                                                       |
| `label?: string`                        | **optional** </br> An easier to read description of the event.                                                                                            |
| `customScope?: Record<string, unknown>` | **optional** </br> A custom object containing any other useful information.                                                                               |
| `configuredScopes?: string[]`           | **optional** </br> A list of preconfigured scopes to include with the event. See [initialization and configuration]() to setup up reusable custom scopes. |

## Example

In this example a `DisplayEvent` is built in the Angular component's `ngOnInit()` and then used by the [mnclDisplay](display-directive.md) directive. The properties in `customScope` are completely customizable and determined by consuming applications.

```typescript
import { DisplayEvent } from 'monocle-ngx';

@Component({
  template: `<div [mnclDisplay]="bannerEvent">Important banner message</div>`,
})
export class MyComponent implements OnInit {
  bannerEvent: DisplayEvent;

  ngOnInit() {
    this.bannerEvent = {
      id: 'bannerMessage',
      label: 'Display important banner message',
      customScope: {
        // the following properties are for example only
        test: 'messagePosition'
        experience: 'A'
      }
    };
  }
}
```

## Feedback

Is something not working or unclear? Please create an [issue](https://github.com/Progressive/monocle-ngx/issues/new/choose) or [PR](https://github.com/Progressive/monocle-ngx/blob/main/CONTRIBUTING.md).
