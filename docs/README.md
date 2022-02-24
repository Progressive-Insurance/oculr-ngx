[API](./README.md)

# API list

## Initialization and configuration

Setting up the Oculr library can be done in a [few simple steps](./init-and-config.md).

## Directives

Oculr has a set of directives that help capture various display or interaction events.
| | |
| --- | --- |
| [oculrChange](./change-directive.md) | A directive that captures input, select, and textarea changes. |
| [oculrClick](./click-directive.md) | A directive that captures button and anchor clicks. |
| [oculrDisplay](./display-directive.md) | A directive that captures when a host element is rendered. |
| [oculrFocus](./focus-directive.md) | A directive that captures when a host element gains focus. |
| [oculrTrackValidation](./track-validation-directive.md) | A directive that captures validation errors on a Reactive form control. |

## Page Views

Oculr allows you to easily [track the path](./page-views.md) a user navigates through while using your app.

## Interceptors

Oculr comes with an [HTTP interceptor](./http-interceptor.md) ready to go out of the box.

## Services

Oculr has a set of services that simplify library initionalization and capturing targeted analytic events.
| | |
| --- | --- |
| [EventDispatchService](./event-displace-service.md) | A service that allows client apps to target analytic events. |

## Interfaces

Oculr has a set of interfaces that ensure the shape of the objects being passed around are consistent.
| | |
| --- | --- |
| [DirectiveEvent](./directive-event.md) | An event interface used by directives. |
| [AppEvent](./app-event.md) | An interface used for tracking general application events |
| [AppErrorEvent](./app-error-event.md) | An interface used for tracking application errors |

## Feedback

Is something not working or unclear? Please create an [issue](https://github.com/progressive-insurance/oculr-ngx/issues/new/choose) or [PR](https://github.com/progressive-insurance/oculr-ngx/blob/main/CONTRIBUTING.md).
