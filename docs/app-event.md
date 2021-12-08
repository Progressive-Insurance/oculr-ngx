[API](./README.md) > [Interfaces](./README.md#Interfaces)

# AppEvent

## Description

An interface that is used when you want to track a general app event that isn't covered by any existing directives or services.

## Properties

| Property      | Desciption                                                     |
| ------------- | -------------------------------------------------------------- |
| `id: string`  | A useful identifier for the event.                             |
| `scopes?: []` | **optional** </br> A list of scopes to include with the event. |

## Example

In this example an `AppEvent` is built in the Angular base app component's `ngOnInit()` to track an initialization event. The event is then fed to the `trackAppEvent` method on the [EventDispatchService](./event-dispatch-service.md). The objects in `scopes` are completely customizable and determined by consuming applications.

```typescript
import { AppEvent, EventDispatchService } from 'oculr-ngx';

@Component()
export class AppComponent implements OnInit {
  constructor(private eventDispatchService: EventDispatchService) {}

  ngOnInit() {
    const appEvent: AppEvent = {
      id: 'app-initialized',
      scopes: [
        {
          // the following properties are for example only
          environment: 'production',
          server: 'east-one',
        },
      ],
    };
    this.eventDispatchService.trackAppEvent(appEvent);
  }
}
```

## Feedback

Is something not working or unclear? Please create an [issue](https://github.com/Progressive/oculr-ngx/issues/new/choose) or [PR](https://github.com/Progressive/oculr-ngx/blob/main/CONTRIBUTING.md).
