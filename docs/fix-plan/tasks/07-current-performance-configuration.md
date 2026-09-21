# Task 07: Use current configuration in performance-event labels

Priority: P2 - incorrect application attribution. Difficulty: small to medium. Prerequisite: task 01 establishes the baseline; no other bug fix is required. Source references describe commit `c82a646`.

## Bug and evidence

`projects/oculr-ngx/src/lib/services/page-load-performance.service.ts:30-32` subscribes to `ConfigurationService.appConfig$` with `take(1)` in the constructor. `configuration.service.ts:19` seeds this observable with `{ logHttpTraffic: false }` using a `BehaviorSubject`. The subscription therefore immediately stores the seed and unsubscribes if the performance service is instantiated before application configuration loads.

Later calls to `loadAppConfig` cannot update the stored configuration. Initial-load and focus-transition labels at lines 47, 73, and 85 keep using the captured application name. This is an initialization-order bug even if runtime reconfiguration is uncommon.

An in-memory execution of the existing class reproduced the failure: construct the performance service; call `loadAppConfig({ applicationName: 'Test App', logHttpTraffic: false })`; then initialize it. The emitted label was `undefined - Focused App Initialization Complete`. Subsequent transition events also retained `undefined`. Existing tests load configuration before constructing the service, so they cover only the favorable ordering.

## Minimal reproduction

1. Create an unconfigured `ConfigurationService`.
2. Construct `PageLoadPerformanceService` using that configuration service and a dispatch spy.
3. Load a configuration with a known `applicationName`.
4. Set `window.pageLoadStartTime` and invoke `initialize()`.
5. Assert the event label; the current implementation uses the initial default object's missing name.

## Desired behavior and fix guidance

Every performance event should use the most recently emitted application configuration available when that event is generated. Construction order must not require consumers to configure the library before injecting this service. Preserve the existing behavior when a consumer omits the optional application name; deciding on a new fallback label is outside this task.

Replace the one-time constructor snapshot with a mechanism that remains current. A retained configuration subscription is a straightforward solution, provided the service unsubscribes when destroyed. Implement lifecycle cleanup that also works with the repository's directly constructed service tests, or update those fixtures deliberately if introducing Angular-managed destruction. Another valid design samples the current configuration at event generation without accumulating subscriptions or dispatching duplicate events.

Do not make the application name a filter condition that prevents legitimate unnamed configurations from being observed. Do not modify `ConfigurationService`'s public configuration contract or delay unrelated destinations waiting for performance metadata.

## Acceptance and validation

Extend `projects/oculr-ngx/src/lib/services/page-load-performance.service.spec.ts` to cover:

- Configuration loaded before construction continues to produce the configured name.
- Configuration loaded after construction but before initialization produces that name.
- Changing configuration after initialization changes the name on subsequent focus/blur events.
- Updating configuration alone emits no additional performance event.
- Destroying the service releases any long-lived subscription introduced by the fix.
- Existing missing-timestamp behavior and timing values remain unchanged.

Use distinct names such as `First App` and `Second App`, and assert complete event labels. Clean up global callbacks and clock spies so ordering-sensitive tests remain independent.

Run `npm test -- --watch=false --include='**/page-load-performance.service.spec.ts'`, then `npm run build` and `npm run lint`; require lint to pass after the accepted Task 01 fix.

## Scope and evaluation

Task 05 handles duration arithmetic, and task 12 handles browser listener ownership. Preserve those behaviors if already fixed. This task evaluates BehaviorSubject semantics, initialization ordering, configuration lifetimes, subscription cleanup, and regression tests that vary dependency-construction order.
