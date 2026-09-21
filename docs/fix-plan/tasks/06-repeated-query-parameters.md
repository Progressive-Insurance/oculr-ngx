# Task 06: Preserve every repeated query-parameter value

Priority: P2 - loss of location data. Difficulty: small. Prerequisite: task 01 establishes the repository baseline; no other fix is required. Source references describe commit `c82a646`.

## Bug and evidence

`projects/oculr-ngx/src/lib/services/location.service.ts:70-80` reconstructs the query string by iterating `queryParamMap.keys` and appending `queryParamMap.get(key)` once per key. Angular's `ParamMap` can hold several values for the same key; `get` selects only one. Consequently a URL such as `/home?tag=alpha&tag=beta` becomes `/home?tag=alpha` in analytics.

The effect reaches `EventLocation.queryString`, `path`, and `url`, which are all assembled from this result at lines 28-36. It can also change the default page-view event ID, because `EventDispatchService.trackPageView` uses the location path when the caller supplies no ID. `virtualPageName` should remain independent of the query string.

This was reproduced with the existing `LocationService` class and real Angular `convertToParamMap({ tag: ['alpha', 'beta'] })`: the result contained `queryString: '?tag=alpha'` and omitted `beta`. The existing spec tests only one value for one key at `location.service.spec.ts:138-143`.

## Minimal reproduction

1. Build the same snapshot fixture used by `location.service.spec.ts`, with route path `home`.
2. Give the root snapshot `queryParamMap: convertToParamMap({ tag: ['alpha', 'beta'] })`.
3. Call the public `getLocation()` method.
4. Observe that `path` is `/home?tag=alpha`, rather than `/home?tag=alpha&tag=beta`.

## Desired behavior and fix guidance

Serialize every value exposed by `ParamMap.getAll(key)`, in its existing value order, using Angular `HttpParams` to retain the existing escaping rules. Remember that `HttpParams` is immutable: each append returns a new instance and must replace the accumulator. Preserve the leading question mark only for a nonempty serialized query string.

Retain the current order of keys exposed by `ParamMap`; do not promise restoration of arbitrary original cross-key ordering that the snapshot no longer represents. Empty strings are actual query-parameter values and should remain present. The task does not require decoding strings manually, changing the event-location model, or substituting route parameter values into route templates.

## Acceptance and validation

Extend `projects/oculr-ngx/src/lib/services/location.service.spec.ts` with public `getLocation()` assertions covering:

- A repeated key produces both values in `queryString`, `path`, and `url`.
- Multiple keys preserve all of their values, including repeated empty strings.
- Values containing spaces, Unicode, ampersands, and equals signs retain the serializer's correct escaping and round-trip through Angular `HttpParams`.
- `virtualPageName` still contains only the route template.
- Missing or empty parameter maps still produce an empty query string, with no trailing `?`.
- The existing single-value fixture keeps its current result.

A direct helper test is acceptable in addition to these public assertions, but helper-only coverage would miss broken assembly of `path` and `url`.

Run `npm test -- --watch=false --include='**/location.service.spec.ts'`, followed by `npm run build` and `npm run lint`. After the accepted Task 01 fix, lint must pass.

## Scope and evaluation

Keep URL-prefix construction and base-href handling outside this patch; task 16 covers them separately. This task evaluates understanding collection APIs and immutable builders, preserving data during serialization, and testing observable behavior at the public service boundary.
