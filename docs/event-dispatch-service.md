[API](./README.md) > [Interceptors](./README.md#Services)

# Event Dispatch Service

## Description

A service that allows for manual dispatching of page views, app events, and app errors.

## Quick start

Inject the service `EventDispatchService` in the constructor of you Angular components or services.

```typescript
  constructor(
    private eventDispatchService: EventDispatchService
  ) {}
```

### Method guides

Please check out the following for guidance on each method found on the `EventDispatchService`.

- [trackPageView()](./page-views.md)
- [trackAppEvent()](./app-event.md)
- [trackAppError()](./app-error-event.md)

## Feedback

Is something not working or unclear? Please create an [issue](https://github.com/progressive-insurance/oculr-ngx/issues/new/choose) or [PR](https://github.com/progressive-insurance/oculr-ngx/blob/main/CONTRIBUTING.md).
