[API](./README.md) > [Interceptors](./README.md#Interceptors)

# HTTP Interceptor

## Description

The `AnalyticsInterceptor` implements Angular's `HttpInterceptor` [interface](https://angular.io/api/common/http/HttpInterceptor) and injects itself into your app's request-response chain. It will begin emitting events once you have [initialized the library](./init-and-config.md) with a configuration that contains at least one destination.

The interceptor will dispatch an event for the start and completion (successful or not) for any HTTP call except for any destination URLs contained in your [app configuration](./init-and-config.md#appconfiguration).

## Event types

### ApiStartEvent

An `ApiStartEvent` is dispatched when an HTTP request is sent. It is made up of the following properties.

| Event property | Description                                                                                                                                                    |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| request        | The `HttpRequest` [object](https://angular.io/api/common/http/HttpRequest) received by the interceptor.                                                        |
| id             | A string identifier that defaults to the target URL. This can be overridden by [attaching an ApiEventContext](#providing-context-to-an-api-call) to your call. |
| scopes         | An array of custom objects passed by [attaching an ApiEventContext](#providing-context-to-an-api-call) to your call.                                           |
| eventType      | Always set to a value of 'API_START_EVENT'.                                                                                                                    |
| location       | The current location found in the Angular router when the call was made.                                                                                       |

### ApiCompleteEvent

An `ApiCompleteEvent` is dispatched when an HTTP response is returned - successful or not. It is made up of the following properties.

| Event property | Description                                                                                                                                                    |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| response       | The response received as a result of the `request`.                                                                                                            |
| request        | The `HttpRequest` [object](https://angular.io/api/common/http/HttpRequest) received by the interceptor.                                                        |
| duration       | The length of the call in milliseconds.                                                                                                                        |
| id             | A string identifier that defaults to the target URL. This can be overridden by [attaching an ApiEventContext](#providing-context-to-an-api-call) to your call. |
| scopes         | An array of custom objects passed by [attaching an ApiEventContext](#providing-context-to-an-api-call) to your call.                                           |
| eventType      | Always set to a value of 'API_COMPLETE_EVENT'.                                                                                                                 |
| location       | The current location found in the Angular router when the call was made.                                                                                       |

## Providing context to an API call

When there is a need to associate more data to an API call, an `ApiEventContext` object can be set on the `HttpRequest.context` property and it will be dispatched with the different API events.

### ApiEventContext

| Property | Description                                                         |
| -------- | ------------------------------------------------------------------- |
| start    | An `ApiContext` object to send with an `ApiStartEvent`              |
| success  | An `ApiContext` object to send with a successful `ApiCompleteEvent` |
| failure  | An `ApiContext` object to send with a failed `ApiCompleteEvent`     |

### ApiContext

| Property | Description                                                     |
| -------- | --------------------------------------------------------------- |
| id       | An identifier to use for the API call instead of the target URL |
| scopes   | An array of custom objects to attach to the event               |

## Feedback

Is something not working or unclear? Please create an [issue](https://github.com/progressive-insurance/oculr-ngx/issues/new/choose) or [PR](https://github.com/progressive-insurance/oculr-ngx/blob/main/CONTRIBUTING.md).
