[API](./README.md) > [Interfaces](./README.md#Interfaces)

# AppErrorEvent

## Description

An interface that is used when tracking application errors.

## Properties

| Property       | Desciption                                                     |
| -------------- | -------------------------------------------------------------- |
| `error: Error` | The error object being thrown.                                 |
| `id: string`   | **optional** </br> A useful identifier for the event.          |
| `scopes?: []`  | **optional** </br> A list of scopes to include with the event. |

## Example

In this example an `AppErrorEvent` is being tracked via a custom error handler. The event is then fed to the `trackAppError` method on the [EventDispatchService](./event-dispatch-service.md). The objects in `scopes` are completely customizable and determined by consuming applications.

```typescript
import { AppErrorEvent, EventDispatchService } from 'oculr-ngx';

@Injectable()
export class AppErrorHandler implements ErrorHandler {
  constructor(private eventDispatchService: EventDispatchService) {}

  handleError(error: AppError | HttpErrorResponse): void {
    const event: AppErrorEvent = {
      error,
      id: error instanceof AppError ? error.name : error.status?.toString(),
      scopes: [
        {
          // the following property is only an example
          level: 'application',
        },
      ],
    };
    this.eventDispatchService.trackAppError(event);
  }
}
```

## Feedback

Is something not working or unclear? Please create an [issue](https://github.com/Progressive/oculr-ngx/issues/new/choose) or [PR](https://github.com/Progressive/oculr-ngx/blob/main/CONTRIBUTING.md).
