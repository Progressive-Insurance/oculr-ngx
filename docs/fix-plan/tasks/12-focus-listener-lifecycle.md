# Task 12: Own and remove performance focus listeners safely

Priority: P2 - interference with host applications and unwanted events. Difficulty: medium. Prerequisite: task 01 establishes the baseline; no other fix is semantically required. Source references describe commit `c82a646`.

## Bug and evidence

`projects/oculr-ngx/src/lib/services/page-load-performance.service.ts:69` and `:81` assign directly to `window.onblur` and `window.onfocus`. These are shared handler properties. Enabling analytics replaces handlers previously installed by the host application. Conversely, subsequent application assignments can silently disable analytics.

The boolean flag is also ineffective when turned off after initialization. `initialize(false)` updates `_includeFocusUnfocusLogs` at line 41 and skips the block at lines 61-91, but it never removes the callbacks installed by an earlier `initialize(true)`. Those callbacks do not inspect the flag and continue publishing events.

Both failures were reproduced by executing the existing class with controlled window handlers. After `initialize(true)`, both original handler identities were replaced. After a subsequent `initialize(false)`, invoking blur and focus still produced `Focused Time` and `Unfocused Time` events. The service currently has no destruction cleanup.

## Minimal reproduction

1. Assign spy functions to `window.onblur` and `window.onfocus`.
2. Construct the service, configure it, and call `initialize(true)`.
3. Dispatch browser blur/focus events: the original application handlers no longer receive them.
4. Call `initialize(false)`, clear analytics calls, and dispatch the events again.
5. Analytics still publishes both transition events despite the disabled option.

## Desired behavior and fix guidance

Use service-owned event listeners registered through `addEventListener`, retaining callback references so they can be removed with `removeEventListener`. Do not take ownership of the host application's `onfocus` or `onblur` properties. Repeated enabling must leave exactly one listener for each transition. Disabling must remove this service's listeners, and destruction must also remove them.

When enabling after a disabled interval, initialize the relevant timing endpoint using the current focus state and current time. Disabled time must not leak into the next enabled interval. Define repeated `initialize(true)` as refreshing the timing baseline while retaining one pair of listeners, consistent with the method's existing initialization role.

Preserve initial page-load event behavior when `initialize` is invoked; this task does not redefine whether repeated explicit initialization emits that event again. If earlier tasks added subscription cleanup or corrected duration calculations, compose the new listener cleanup with that work.

## Acceptance and validation

Add tests to `projects/oculr-ngx/src/lib/services/page-load-performance.service.spec.ts` using dispatched DOM events rather than calling private listener functions:

- Existing `onfocus`/`onblur` handlers still run after analytics is enabled.
- Analytics emits one transition event per browser event after repeated enabling.
- Disabling stops transition events and preserves the application's handlers.
- Re-enabling resumes tracking with fresh interval timestamps.
- Destruction stops events, and repeated disable/destroy operations are harmless.
- Default `initialize()` installs no transition listeners.

Check event counts after excluding initialization events. Restore the original application handler properties in test cleanup, and destroy service instances so listeners cannot leak between specs.

Run `npm test -- --watch=false --include='**/page-load-performance.service.spec.ts'`, then `npm run build` and `npm run lint`. After the accepted Task 01 fix, lint must pass.

## Scope and evaluation

Do not add SSR support, global event abstractions, or automatic tracker startup. The task evaluates shared browser-resource ownership, idempotent initialization, opt-out behavior, lifecycle cleanup, and realistic event-based regression tests.
