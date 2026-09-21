# Task 11: Avoid replaying delivered events on unrelated configuration updates

Severity: medium (duplicate analytics and duplicate HTTP writes). Difficulty: large. Prerequisites: Task 01, the repository baseline, and Task 10, destination deactivation. References describe commit `c82a646`; Task 10 may move the cited subscription logic. This task updates the two destination services and tests.

## Bug and evidence

`projects/oculr-ngx/src/lib/services/analytics-event-bus.service.ts:21` creates a `ReplaySubject(25, 10000)` for each event stream. That replay buffer allows a destination initialized later to receive recent events. However, `switchMap` in `console.service.ts:31` and `http-api.service.ts:36` unsubscribes and resubscribes to the selected stream for every accepted application-configuration emission, even when the selected stream has not changed.

Each subscription replays up to 25 recent events. Updating only `applicationName`, resubmitting equivalent configuration, or changing HTTP headers can therefore repeat previously delivered events. A read-only in-memory execution of the actual services with real `ReplaySubject` instances dispatched `{ id: 'one' }`, changed only `applicationName`, and observed `['one', 'one']` in both the HTTP requests and console log capture. Existing destination specs use `BehaviorSubject` mocks and do not assert this configuration-update sequence.

## Minimal reproduction

1. Initialize both destinations with `sendCustomEvents: false` and a real event bus.
2. Dispatch one event and observe one console message and one HTTP request.
3. Call `loadAppConfig` with an equivalent destinations array and a changed `applicationName` within ten seconds.
4. Observe the same event delivered again without calling `dispatch` a second time.

The event bus is intentionally replaying to a new subscriber; repeated destination subscriptions are what create the duplicate delivery.

## Correct fix

Separate configuration updates from selection of the event stream. Derive a stable subscription mode such as disabled, standard events, or custom events. Change the event-bus subscription only when that mode changes. For the HTTP service, update the current validated endpoint, method, and headers on every configuration emission before suppressing redundant subscription changes, so the next new event uses the newest transport settings.

A suitable implementation can compare the derived mode with `distinctUntilChanged` before `switchMap`; another design is acceptable if it preserves these behaviors. An object-identity comparison of `DestinationConfig` is insufficient because callers may allocate equivalent objects. Comparing complete configurations still causes replay when only headers change. Do not remove the shared replay buffer or deduplicate events by ID: startup replay is useful, and legitimate distinct events may share an ID.

Keep Task 10's disabled transition intact. First activation must still receive buffered events. Preserve existing behavior when explicitly switching standard/custom modes; defining a new replay policy across disable/re-enable cycles is outside this task.

## Regression criteria and validation

- With the real event bus, dispatch one event, reload equivalent configuration, and change only `applicationName`; neither operation repeats delivery in either destination.
- Change HTTP endpoint, method, or headers while preserving event mode; no historical event is resent, and the next new event uses the replacement settings.
- Two separate dispatches with the same ID still produce two deliveries.
- Events emitted before first activation remain available through the startup replay buffer.
- Switching standard/custom modes selects the intended stream; removal still stops new delivery after Task 10.

Run `npm run test -- --watch=false --include="projects/oculr-ngx/src/lib/destinations/**/*.spec.ts"`, then `npm run build` and `npm run lint`. After the accepted Task 01 fix, lint must pass. This task evaluates replay semantics, stream identity, state comparison, and preserving transport updates without recreating subscriptions.
