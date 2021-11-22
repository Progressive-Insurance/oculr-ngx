[API](./README.md)

# Initialization and Configuration

After the library has been installed, it can be loaded into your application by importing it into your root module (typically an `AppModule`).

```typescript
imports: [
  ...
  OculrAngularModule.forRoot(),
  ...
]
```

The next thing you'll want to do is configure the library to meet your specific needs.

## Configuration

The library is configured using an `AppConfiguration` [object](#appconfiguration) that is injected at runtime. This is accomplished using the `ConfigurationService` and its `loadAppConfig` method.

```typescript
@Injectable()
export class AppInitializationService {
  constructor(private oculrConfigService: ConfigurationService) {}
  ...
  init() {
    ...
    this.oculrConfigService.loadAppConfig(yourConfig);
    ...
  }
}
```

### AppConfiguration

| Property | Description |
| -------- | ----------- |
| `destinations` | An array containing one to many `DestinationConfig` [objects](#destinationconfig). Each destination option is a pre-defined service that is responsible for forwarding on emitted events to another location. |

### DestinationConfig

| Property | Description |
| -------- | ----------- |
| `name`| Any available option defined by the `Destinations` [enum](../projects/oculr-ngx/src/lib/models/destinations.enum.ts). A basic description for each is listed [below](#available-destinations). |
| `sendCustomEvents` | A `boolean` value denoting whether you'd like your own custom event structure dispatched. [More information](#using-your-own-custom-event-object) can be found below on how this can be accomplished. |
| `endpoint` | The URL to send events to |
| `method` | The HTTP method (`POST` or `PUT`) to be used when calling `endpoint`. |
| `headers` | An `HttpHeaders` [object](https://angular.io/api/common/http/HttpHeaders) containing any required headers for calling `endpoint`. |

### Available destinations

| Name | Description | Required properties |
| ---- | ----------- | ------------------- |
| Console | Equivalent to sending every event to `console.log`. | `name` |
| HttpApi | Used for sending events to a single HTTP API endpoint. | `name`, `endpoint`, `method` |

## Using your own custom event object

For some, our standard `AnalyticEvent` [interface](../projects/oculr-ngx/src/lib/models/analytic-event.interface.ts) may be a perfectly acceptable data structure to log to your configured destinations. However, we realize that it's often necessary to create something different to meet your own requirements. You can do so in a couple of simple steps.

1. Subscribe to the `events$` Observable exposed by the `AnalyticsEventBusService`.
1. Transform the `AnalyticEvent` being emitted however you see fit.
1. Dispatch your custom object using the `dispatchCustomEvent` method on the `AnalyticsEventBusService`.
1. Set the `sendCustomEvents` property to `true` on any destinations where the custom event is desired.

```typescript
@Injectable()
export class AnalyticsService {
  constructor(private eventBus: AnalyticsEventBusService) {}
  ...
  init() {
    this.eventBus.events$
      .pipe(
        map((event: AnalyticEvent) => ...build custom event here...),
        tap((event: AppEvent) => this.eventBus.dispatchCustomEvent(event))
      )
      .subscribe();
  }
  ...
```
