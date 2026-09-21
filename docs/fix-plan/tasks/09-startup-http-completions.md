# Task 09: Preserve HTTP completions that arrive after startup configuration

Severity: high (lost analytics and retained request/response objects). Difficulty: large. Prerequisite: Task 01, the repository baseline. Source references describe commit `c82a646`; resolve symbols again if earlier tasks move lines. This task changes the interceptor and its tests only.

## Bug and evidence

In `projects/oculr-ngx/src/lib/interceptors/analytics.interceptor.ts:40`, the constructor waits for the first configuration containing `destinations`, drains `queuedIntercepts`, and unsubscribes through `take(1)` at line 43. A request started before that configuration uses `queueIntercept` at line 97. Its success and error callbacks always append to the queue at lines 110 and 123, including after the constructor's only drain has finished.

Consequently, a request that starts before configuration but finishes afterward emits its start event and permanently loses its completion event. Its request and response remain referenced in the queue. A read-only probe transpiled the actual source in memory and exercised real RxJS subjects: both an HTTP 200 response and an HTTP 500 error produced `dispatched: ["start"]` and `stranded: 1`. These are observed results, not a prediction from inspection. Existing specs mostly use immediately emitting handlers and miss this ordering.

## Minimal reproduction

1. Construct the interceptor with a `BehaviorSubject` initially containing `{ logHttpTraffic: false }` and a backend represented by an uncompleted `Subject<HttpEvent<unknown>>`.
2. Subscribe to a GET request for `/app-data`; its start is buffered.
3. Publish `{ logHttpTraffic: true, destinations: [{ name: Destinations.Console, sendCustomEvents: false }] }`; the start is dispatched.
4. Emit `new HttpResponse({ status: 200 })` from the backend and complete it. The caller receives the response, but `trackApiComplete` is never called.

Replace step 4 with an `HttpErrorResponse` sent through the subject's error channel to reproduce the failure path.

## Correct fix

Give the startup capture path an explicit transition from buffering to configured dispatch. Centralize delivery of each captured start or completion: before readiness, buffer it; after readiness, dispatch or discard it according to the resolved logging flag and destination exclusions. Record readiness before draining, because dispatch can synchronously produce more events. A late completion must use that delivery path rather than blindly pushing into a queue that will never drain again.

Do not merely remove `take(1)`: a response arriving after the last configuration emission still would not trigger a flush. Preserve request forwarding, context selection, original start time, rounded duration, and existing URL exclusions. Do not block HTTP responses waiting for configuration or add timers. Keep broader decisions about never-configured applications and runtime configuration policy outside this task.

## Regression criteria and validation

- Success and error arriving after configuration each emit exactly one start and one completion, with the original context, request, response/error, and duration; no completion remains buffered.
- A response arriving before configuration still produces start then completion when the queue drains.
- Logging disabled by the first resolved configuration discards both buffered starts and later completions. Excluded destination requests likewise produce neither event.
- The handler runs once, and the subscriber receives the original success or error unchanged. Use a manually controlled subject and deterministic time values, rather than timer sleeps.

Run `npm run test -- --watch=false --include="projects/oculr-ngx/src/lib/interceptors/analytics.interceptor.spec.ts"`, then `npm run build` and `npm run lint`. After the accepted Task 01 fix, lint must pass; report any environment failure separately. This task evaluates asynchronous state transitions, RxJS timing, preserving observable behavior, and writing a regression test for an ordering bug.
