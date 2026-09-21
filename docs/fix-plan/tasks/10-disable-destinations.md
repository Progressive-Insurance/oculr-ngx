# Task 10: Stop delivery when a configured destination is removed or invalidated

Severity: high (delivery continues to a disabled endpoint; HTTP feedback is possible). Difficulty: medium to large. Prerequisite: Task 01, the repository baseline. Source references describe commit `c82a646`. Modify both destination services and their regression specs; do not change the public configuration shape.

## Bug and evidence

`projects/oculr-ngx/src/lib/destinations/console/console.service.ts:30` filters out missing console configurations before `switchMap`. `projects/oculr-ngx/src/lib/destinations/http-api/http-api.service.ts:35` does the same through `loadAndValidateConfig`. When an active destination is removed, the new configuration never reaches `switchMap`, so its previous subscription to the event bus stays active. HTTP validation also retains `this.config` when the replacement is invalid, continuing delivery with obsolete settings.

A read-only probe using the actual services and RxJS subjects enabled both destinations, removed them with `destinations: []`, and then emitted `after-disable`. Both services still delivered that event. A second probe connected the HTTP service to the actual analytics interceptor: after removal with `logHttpTraffic: true`, one input event caused 11 nested HTTP request attempts before an artificial recursion guard stopped the probe. The removed endpoint is no longer excluded by `AnalyticsInterceptor.isUrlIncluded` at line 159, so telemetry can generate more telemetry. No real requests were sent.

## Minimal reproduction

Initialize `HttpApiService` with a configuration subject and event-bus subjects. Enable `{ name: Destinations.HttpApi, method: 'POST', endpoint: '/telemetry', sendCustomEvents: false }`, emit one event, and verify one request. Publish `{ logHttpTraffic: true, destinations: [] }`, then emit another event. The request count incorrectly increases. Substitute the console destination and a `console.log` spy to reproduce its equivalent failure. Replacing HTTP configuration with one missing `endpoint` or `method` also leaves the old destination active.

## Correct fix

Ensure every destination state transition reaches the subscription-switching logic. An absent or invalid destination must switch to an empty observable and release the previous event-bus subscription. Clear the HTTP service's stored configuration when it becomes invalid or absent; validation must not preserve a formerly valid endpoint by accident. Retain the existing warning messages for invalid present configurations, and keep absent destinations silent.

Make `log` safe when no valid configuration is available if clearing state exposes that path. Re-enabling a valid destination must restore delivery exactly once. Preserve the selection of standard versus custom events and existing retry behavior. Do not add endpoint exclusion hacks to hide this bug: the obsolete delivery subscription is the cause. This task concerns new event delivery; changing cancellation policy for requests already in flight is outside its scope.

## Regression criteria and validation

- In each service, enable, emit, remove, and emit again; the second event produces no delivery.
- Cover both `destinations: []` and an omitted destinations property after activation, plus invalid HTTP replacements missing endpoint and missing method.
- Verify removal from custom-event mode unsubscribes that stream as well. Re-enable and assert exactly one delivery for a newly emitted event.
- Add a bounded integration regression for the HTTP service/interceptor feedback path if the existing fixture can express it. A disabled destination must make zero new requests.
- Preserve initial disabled behavior and valid configuration warnings without depending only on private-field assertions.

Run `npm run test -- --watch=false --include="projects/oculr-ngx/src/lib/destinations/**/*.spec.ts"`, followed by `npm run build` and `npm run lint`. After the accepted Task 01 fix, lint must pass; report any environment failure separately. This task evaluates subscription lifecycles, reactive filtering, configuration transitions, and tracing a feedback loop across services.
