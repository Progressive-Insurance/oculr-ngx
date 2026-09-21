# Task 13: Correlate navigation timings and cancel stale stability waits

Priority: P2 - duplicate and misattributed timing events. Difficulty: large. Prerequisite: task 01 establishes the baseline; no other fix is required. Source references describe commit `c82a646`.

## Bug and evidence

`projects/oculr-ngx/src/lib/services/page-view-timings.service.ts:28-49` keeps one mutable `startTime` and creates an independent subscription to application stability for every `NavigationEnd`. A later `NavigationStart` overwrites the start time without cancelling earlier pending subscriptions. When stability arrives, several subscribers calculate durations from the most recent start and publish against the current route.

This was reproduced against the existing class with real Angular event classes and RxJS subjects: navigation A starts at 1000 and ends at 1050; B starts at 1100 and ends at 1150; stability is delivered with the controlled clock at 1350. The service emitted two identical duration-250 events. A's start time and route ownership were lost. Router navigation itself need not overlap; only the post-navigation stability waits overlap.

The existing spec at `page-view-timings.service.spec.ts:71-80` places its assertion in an observable callback but never makes the application stable or advances the debounce timer. Its apparent dispatch check is therefore not executed. An unmatched `NavigationEnd` also currently subtracts the initial zero start time, producing an epoch-sized measurement.

## Minimal reproduction

Use a router-event `Subject`, an application-stability `BehaviorSubject(false)`, fake timers, and a dispatch spy. Emit A's start/end, then B's start/end before allowing the 200 ms stability debounce to finish. Emit stable=true and advance the timer. Observe two timing events attributed to B's current state.

## Desired contract and fix guidance

For this fix, measure the latest navigation that both completes successfully and remains current until application stability has held for the existing 200 ms debounce. A newer `NavigationStart` cancels an older pending measurement. Cancelled, errored, skipped, or unmatched navigations emit no timing event. This explicitly chooses cancellation of superseded measurements, rather than publishing stale page events after the user has left.

Correlate start and end using navigation IDs and capture the start timestamp for that navigation. Express the stability wait as a cancellable observable flow or explicitly managed subscription; a nested untracked subscription is insufficient. Cancellation must happen on a new start, not only on the next end. Handle terminal failure events and release both router and stability subscriptions when the service is destroyed. Preserve the public constructor-driven opt-in, event label, string `value`, numeric `duration`, and debounce interval.

## Acceptance and validation

Replace ineffective timing tests with awaited or synchronous fake-timer assertions:

- One matched successful navigation emits exactly once after stability's debounce, with the correct elapsed duration.
- A new start cancels an earlier wait even before the new navigation ends.
- Rapid A/B navigation emits only B's valid measurement; it never reuses A's subscriber.
- Unmatched end, cancellation, error, and skipped navigation emit nothing.
- A false stability emission interrupts a pending true debounce; later sustained stability can finish the active measurement.
- Destruction cancels pending work and prevents later dispatch.

Restore timers and dispose subjects/service instances. Assert that the test actually reaches each expected dispatch assertion; use no fire-and-forget subscription assertions.

Run `npm test -- --watch=false --include='**/page-view-timings.service.spec.ts'`, then `npm run build` and `npm run lint`, requiring lint to pass after the accepted Task 01 fix.

## Scope and evaluation

Do not change route-template semantics, introduce automatic service instantiation, or redesign all analytics dispatch. The task evaluates asynchronous state ownership, RxJS cancellation, navigation correlation, meaningful fake-timer tests, and an explicit contract for superseded work.
