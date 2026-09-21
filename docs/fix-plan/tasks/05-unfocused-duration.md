# Task 05: Correct negative unfocused durations

Priority: P2 - incorrect analytics data. Difficulty: small. Prerequisite: task 01 establishes the repository baseline; this task otherwise stands alone. Source references describe commit `c82a646`.

## Bug and evidence

`projects/oculr-ngx/src/lib/services/page-load-performance.service.ts:81-88` handles a window focus event by recording the current time in `focused`, then publishing `blurred - focused`. The recorded blur precedes the new focus, so ordinary unfocused intervals become negative. The adjacent blur handler at lines 69-77 correctly uses `blurred - focused` for the opposite transition, which likely explains the copied expression.

This was reproduced against the existing class by transpiling its TypeScript in memory, using real RxJS configuration delivery, a controlled clock, and a mock browser window. Starting focused, blurring at timestamp 2000, and focusing at 3500 produced an `Unfocused Time` event with `value: '-1500'`. The expected duration is 1500 milliseconds. The existing spec only checks initial page-load dispatch and missing-timestamp logging, so it never exercises either focus transition.

## Minimal reproduction

1. Construct `ConfigurationService`, load an application name, and construct `PageLoadPerformanceService` with a dispatch spy.
2. Set `window.pageLoadStartTime`, make `document.hasFocus()` return true, and call `initialize(true)` at time 1000.
3. Invoke the installed blur callback at time 2000, then the focus callback at time 3500.
4. Inspect the second transition's dispatched event: its label ends in `Unfocused Time`, but its value is negative.

## Desired behavior and fix guidance

An unfocused duration is the elapsed interval from the recorded blur to the subsequent focus: `focused - blurred`. A focused duration remains the interval from focus to blur. Compute each duration using the corresponding interval endpoints, and preserve the existing event label, event type, and string representation of `value`.

Check endpoint availability explicitly instead of using the existing truthiness guard: a timestamp of zero is a valid controlled-clock value and must not be mistaken for a missing timestamp. Do not solve the sign bug with `Math.abs`; that hides incorrect ordering and does not document which transition starts an interval. No public API change or replacement of the clock abstraction is required.

## Acceptance and validation

Add deterministic cases to `projects/oculr-ngx/src/lib/services/page-load-performance.service.spec.ts`:

- Initially focused: blur after 1000 ms emits focused time `1000`; focus 1500 ms later emits unfocused time `1500`.
- Initially unfocused: the first focus emits the interval measured since initialization.
- Two complete focus/blur cycles calculate each interval from its own preceding transition.
- An interval whose starting timestamp is zero retains its measured elapsed time.
- Existing initialization dispatch and missing-page-load-timestamp behavior still pass.

Restore mocked clocks, document methods, global timestamps, and any installed callbacks after each test. Assert the actual event value, label, and type rather than merely checking that dispatch occurred.

Run `npm test -- --watch=false --include='**/page-load-performance.service.spec.ts'`, then `npm run build` and `npm run lint`. After the accepted Task 01 fix, lint must pass; do not treat its original 79 errors as an allowed final result.

## Scope and evaluation

Keep this change about interval arithmetic and its regression coverage. Listener ownership and disabling are covered by task 12; configuration freshness is covered by task 07. The task evaluates reading paired event handlers, deriving elapsed-time formulas, controlling browser time in tests, and making a small fix without changing unrelated behavior.
