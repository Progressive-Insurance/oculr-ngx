# Task 16: Derive analytics URL prefixes from the location strategy

Priority: P2 - malformed analytics URLs. Difficulty: large. Prerequisite: task 01 establishes the baseline; retain task 06's repeated-query regression coverage. Source references describe commit `c82a646`.

## Bug and evidence

`projects/oculr-ngx/src/lib/services/location.service.ts:20-23` calculates `hostName` by subtracting the length of Angular's normalized `Location.path(true)` from the raw browser `location.href`, then calling `Location.stripTrailingSlash`. These strings are not guaranteed to have interchangeable suffix lengths. Angular normalizes base paths, trailing slashes, and terminal `/index.html`. Its slash helper can also remove the slash before a hash delimiter.

This was reproduced using the current service with real installed Angular `Location`, `PathLocationStrategy`, and `HashLocationStrategy`; only the underlying platform-location object was a fixture:

| Browser URL and strategy | Current result when reporting route `/home` | Expected URL |
| --- | --- | --- |
| `https://example.org/app/index.html`, path strategy, base `/app/` | `https://example.org/app/index.html/home` | `https://example.org/app/home` |
| `https://example.org/app/#/home`, hash strategy | `https://example.org/app#/home` | `https://example.org/app/#/home` |
| `https://example.org/app/#/home/`, hash strategy | `https://example.org/app#//home` | `https://example.org/app/#/home` |

The index-document prefix remains cached after navigation, so loading an application entry document can corrupt subsequent events. Existing specs mock `Location.path()` with a simple `/home` and never exercise strategy normalization.

## Minimal reproduction

Construct a platform fixture from `new URL('https://example.org/app/index.html')`, exposing pathname, search, hash, and no-op popstate/hashchange registrations. Create `new Location(new PathLocationStrategy(platform, '/app/'))`. Its `path(true)` is empty because Angular strips the index document and base path. Construct `LocationService` with that location and browser href, then report a `/home` route snapshot. The frozen prefix incorrectly still contains `/index.html`.

## Desired behavior and fix guidance

Generate the external route prefix using Angular's location-strategy URL preparation and the browser URL as the resolution base, rather than assuming normalized router text is a literal suffix of the raw href. Preserve deployment subpaths and hash delimiters. A strategy-aware external root or external route can be resolved with the platform URL API, followed by removal of only the intended route boundary. Do not apply a helper that strips a slash before `#` when that slash belongs to the application document path.

Retain the documented `hostName` meaning in `models/event-location.interface.ts:10`: the prefix up to the Angular route, including the deployment slot. Replacing it with `location.origin` loses required base paths. Also retain the existing parameterized route-template behavior: this task does not replace `/orders/:id` with `/orders/123`. `path`, `queryString`, and `virtualPageName` keep their current roles.

## Acceptance and validation

Add real-strategy fixture tests to `projects/oculr-ngx/src/lib/services/location.service.spec.ts` for all three table rows, asserting both `hostName` and final `url`. Include root deployment, a normal path beneath `/app/`, query parameters and a fragment, and navigation after construction from an index document. Existing normal-path and parameterized-route results must remain compatible. Hash routes must contain exactly the required route separator while preserving the slash in the document path before `#`.

Use actual Angular strategy objects for these regressions; mocking the normalized path alone can recreate the same false assumptions as the implementation. Run `npm test -- --watch=false --include='**/location.service.spec.ts'`, then `npm run build` and `npm run lint`, requiring lint to pass after the accepted Task 01 fix.

## Scope and evaluation

Repeated query values belong to task 06. Do not add SSR support or redesign routing. This task evaluates normalization boundaries, base-URL resolution, strategy-aware Angular integration, and regression fixtures that model framework behavior accurately.
