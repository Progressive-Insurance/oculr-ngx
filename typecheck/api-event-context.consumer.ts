/*
 * @license
 * Copyright (c) 2026 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
 */

/**
 * Consumer-facing type regression fixture for API_EVENT_CONTEXT (Task 17).
 *
 * This file is type-checked (never executed) against the *generated* public
 * declaration entry point of the built package
 * (`dist/oculr-ngx/types/oculr-ngx.d.ts`), so it verifies the published type
 * contract rather than an internal source annotation.
 *
 * Run from the repository root after `npm run build`:
 *
 *   npm run typecheck:consumer
 *
 * Failure modes this fixture catches:
 * - The token loses its `ApiEventContext` generic and the nested contexts
 *   degrade to `{}` (the original Task 17 defect): the positive reads below
 *   stop compiling.
 * - Invalid contexts become accepted: the `@ts-expect-error` directives below
 *   become unused and tsc fails with TS2578.
 */

import { HttpContext } from '@angular/common/http';
import { API_EVENT_CONTEXT, ApiEventContext } from 'oculr-ngx';

type Expect<T extends true> = T;
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false;

// The token must expose the full ApiEventContext shape, not inferred `{}` contexts.
const defaults = new HttpContext().get(API_EVENT_CONTEXT);
type _TokenExposesApiEventContext = Expect<Equal<typeof defaults, ApiEventContext>>;

// Valid code: `id` reads as `string | undefined` on all three contexts.
const startId: string | undefined = defaults.start.id;
const successId: string | undefined = defaults.success.id;
const failureId: string | undefined = defaults.failure.id;
const startScopes: any[] | undefined = defaults.start.scopes;
const successScopes: any[] | undefined = defaults.success.scopes;
const failureScopes: any[] | undefined = defaults.failure.scopes;

// Valid code: setting all three contexts with valid IDs and scopes remains accepted.
const context = new HttpContext().set(API_EVENT_CONTEXT, {
  start: { id: 'start-id', scopes: ['scope-a'] },
  success: { id: 'success-id', scopes: ['scope-b'] },
  failure: { id: 'failure-id', scopes: ['scope-c'] },
});
const set: ApiEventContext = context.get(API_EVENT_CONTEXT);

// Negative cases: invalid contexts must remain rejected. If these directives
// ever become unused, tsc fails with TS2578.
new HttpContext().set(API_EVENT_CONTEXT, {
  // @ts-expect-error: start.id must be a string, not a number
  start: { id: 42, scopes: ['scope-a'] },
  success: {},
  failure: {},
});
new HttpContext().set(API_EVENT_CONTEXT, {
  start: {},
  success: {},
  // @ts-expect-error: failure.scopes must be an array, not a string
  failure: { scopes: 'not-an-array' },
});

export { startId, successId, failureId, startScopes, successScopes, failureScopes, set };
