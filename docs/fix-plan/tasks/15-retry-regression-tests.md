# Task 15: Replace skipped HTTP retry tests with real error-channel coverage

Severity: medium verification gap; no runtime retry defect has been established. Difficulty: medium. Prerequisite: Task 01, the repository baseline. Source references describe commit `c82a646`. The intended change is to `projects/oculr-ngx/src/lib/destinations/http-api/http-api.service.spec.ts`; change production behavior only if a meaningful test demonstrates an additional defect.

## Problem and evidence

The baseline test run reports 124 passing tests and two skipped tests. Both skipped tests concern HTTP retries: an `it.skip` at line 141 and a `describe.skip` at line 166. Simply removing the skip markers will not create useful coverage. The first test calls `mockResponse.next(error)` at lines 148 and 153. This emits an ordinary value; `retryWhen` reacts to observable errors, not values whose class happens to be `HttpErrorResponse`. The second test initializes a `BehaviorSubject` with an error object, likewise emitting a value, and contains no behavioral assertion.

The first test also assumes status 500 is retried, whereas `http-api.service.ts:70` defaults the permitted status list to `[0]`. Its warning expectation does not match the two-argument `console.warn('Unable to reach destination', returnError)` call at line 61. These findings are directly supported by the source and the reported skipped baseline tests. The retry implementation itself has not been shown to fail.

## Reproduce the coverage defect

Temporarily inspect or unskip the existing tests in an isolated local run. Observe that sending `HttpErrorResponse` through `.next` never enters the retry error path. Replace that mock with a cold observable that actually errors and counts subscriptions: `defer` can increment an attempt counter and return `throwError(() => error)` or a successful response. Counting subscriptions matters because `retryWhen` resubscribes to the returned observable; it need not call the `HttpClient.request` mock again.

## Correct fix

Replace both skipped blocks with focused tests through `service.log`, using fake timers and controllable cold HTTP observables. Preserve the existing production contract: status 0 permits three retries after the original attempt, delayed by 1000, 2000, and 3000 milliseconds respectively. Other statuses fail immediately. Terminal failure emits one warning containing the configured method, endpoint, and original error message, and is swallowed through `EMPTY` rather than escaping as an unhandled error.

Use explicit timer advancement to verify the schedule and attempt count; `runAllTimersAsync` alone cannot prove intermediate delays. Restore timers and console spies in cleanup even if an assertion fails. Prefer observable behavior to assertions against the private retry-strategy function. Do not expand the retry policy to status 500 simply to satisfy the old test, and do not replace the tests with assertions that only prove an observable was created.

## Regression criteria and validation

- A status-0 failure produces one original attempt, then attempts at elapsed times 1000, 3000, and 6000 milliseconds, with no premature attempts.
- Four consecutive status-0 failures stop after the fourth subscription and warn once; advancing more time produces no new attempt.
- A success after one or more failures stops retrying and produces no warning.
- A status-500 error receives no retry and warns once. Assert both warning arguments and relevant error properties without depending on every framework-owned property.
- A successful first attempt neither retries nor warns. The previously skipped retry cases are replaced by active, meaningful tests.

Run `npm run test -- --watch=false --include="projects/oculr-ngx/src/lib/destinations/http-api/http-api.service.spec.ts"`, then `npm run build` and `npm run lint`. This task evaluates cold observables, error channels, deterministic timing, retry contracts, and correcting tests without inventing a production bug.
