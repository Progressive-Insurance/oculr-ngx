# Task 17: Publish the correct generic type for API_EVENT_CONTEXT

Severity: low (incorrect public TypeScript inference). Difficulty: easy. Prerequisite: Task 01, the repository baseline. Source references describe commit `c82a646`. Scope is the exported context-token declaration and a consumer-facing type regression check; preserve runtime behavior.

## Bug and evidence

`projects/oculr-ngx/src/lib/interceptors/analytics.interceptor.ts:20` constructs `API_EVENT_CONTEXT` with `new HttpContextToken(() => ({ start: {}, success: {}, failure: {} }))`. Without an explicit generic argument, TypeScript infers the three nested contexts as `{}`. The exported token consequently loses the `ApiContext` properties declared in `models/api-context.interface.ts:9`, despite `ApiEventContext` already defining the intended structure in `models/api-event-context.interface.ts:11`.

The interceptor compensates internally with `request.context.get<ApiEventContext>(API_EVENT_CONTEXT)` at lines 65 and 99. A normal consumer should not need that override. The token is part of the package's public API through `projects/oculr-ngx/src/public-api.ts:17`, so the inference error is also reflected in generated declarations.

A read-only TypeScript compiler probe created a virtual consumer in memory and type-checked `new HttpContext().get(API_EVENT_CONTEXT).start.id`. It reported `Property 'id' does not exist on type '{}'`. This was an actual compiler diagnostic against the source, with no files added for the probe. The weak nested `{}` types also fail to express the intended restrictions when callers set a context.

## Minimal reproduction

Import `HttpContext` from `@angular/common/http` and `API_EVENT_CONTEXT` from the library. Evaluate `const value = new HttpContext().get(API_EVENT_CONTEXT)`, then read `value.start.id` or `value.success.scopes` in a type-checked consumer. Both are legitimate properties of `ApiContext`, but the inferred token type rejects them. Explicitly annotating the retrieval with `ApiEventContext` hides the declaration defect rather than repairing it.

## Correct fix

Declare the token with the explicit generic `HttpContextToken<ApiEventContext>` while preserving its existing factory. Keep `start`, `success`, and `failure` required, and keep their `id` and `scopes` properties optional according to the existing interfaces. Do not widen the token to `any`, relax the public interface, or require consumers to cast the result.

Retain a factory that allocates fresh defaults. Separate `HttpContext` instances must not share a mutable start/success/failure object. Do not replace the factory with a reused module-level object. The change must preserve the empty defaults, existing event contexts, exclusion behavior, and configuration handling; no interceptor lifecycle refactor belongs in this task.

## Regression criteria and validation

- Build the library and type-check a small consumer against its generated public `.d.ts` entry point, with `noEmit` enabled. This proves the package surface rather than only an internal annotation.
- Valid code reads `start.id` as `string | undefined`, reads the corresponding success/failure properties, and sets all three contexts with valid IDs and scopes.
- Negative cases use `@ts-expect-error` for a numeric ID and a non-array scopes value. Type checking must fail if these directives become unused, showing that invalid contexts remain rejected.
- Add or retain a runtime assertion that separate `HttpContext` instances receive independent default context objects and that normal start/success/failure dispatch remains unchanged.

Run the consumer type check, `npm run test -- --watch=false --include="projects/oculr-ngx/src/lib/interceptors/analytics.interceptor.spec.ts"`, `npm run build`, and `npm run lint`. Use a small documented fixture or script for the declaration check, not a second application or dependency installation. This task evaluates generic inference, published type contracts, positive and negative type tests, and avoiding shared mutable defaults.
