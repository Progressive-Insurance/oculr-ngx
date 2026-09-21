# Task 04: Recognize effective input types and repair host-validation coverage

Severity: Medium. Difficulty: Medium. Prerequisite: Task 01 baseline; retain Tasks 02-03. Skills evaluated: DOM attributes versus properties, shared-helper impact analysis, Angular standalone test imports, and detecting order-dependent tests.

## Bug and evidence

At reviewed commit `c82a646`, `projects/oculr-ngx/src/lib/services/directive.service.ts:19-20` returns the raw `type` attribute or `''`. `ChangeDirective.checkHost()` at `projects/oculr-ngx/src/lib/directives/change.directive.ts:129-145` compares that raw string with lowercase supported input types. `setInputValue()` at lines 103-122 uses the same helper.

For `<input id="name" oculrChange>`, the browser's effective type is `text`, but the helper returns `''` and initialization disables tracking. For `type="TEXT"`, the browser again reports `text`, while the helper returns `TEXT` and rejects the control. An in-memory probe using the actual directive and jsdom observed `native type=text` and `successfulInit=false` for both cases. Uppercase radio types also miss the shared service's radio identifier handling at lines 48-54.

There is a related coverage defect. `change.directive.spec.ts:377-389` claims to test an unsupported password host, but its standalone `NotSupportedComponent` at lines 459-468 does not import the analytics module. Consequently, no `ChangeDirective` instance exists there. A `console.warn` spy created repeatedly at line 31 retains earlier warning calls, allowing the whole suite to pass. Running only that test fails at line 387 because no warning occurs.

## Minimal reproduction

Render an input with no type attribute, and another with `type="TEXT"`. Change their values and emit native `change` events. Neither currently dispatches analytics, although their native `type` properties are `text`.

Independently reproduce the misleading test result with:

```powershell
npm test -- --watch=false --include '**/change.directive.spec.ts' --filter 'unsupported host element'
```

The reviewed baseline produces one failed test and sixteen skipped tests, despite the full baseline passing.

## Proper fix

Return the effective normalized `HTMLInputElement.type` from the shared input-type helper. Update the existing service test at `directive.service.spec.ts:41` that currently expects an empty string for an omitted type. Verify all consumers: event input metadata, radio identifier precedence, supported-host validation, and input value extraction.

Make host validation explicitly require an `input` tag for the supported-input-types branch. The current condition can accept an unrelated element merely carrying `type="text"`; reading a typed property must not become a substitute for checking the actual tag. Select and textarea remain independently supported. Continue rejecting actual password, email, and telephone input types.

Import `OculrAngularModule` into the unsupported-host standalone fixture and assert that its directive is present. Restore spies and timer state in teardown so failures cannot contaminate subsequent tests. Clear warning history immediately before the initialization being asserted, then verify the unsupported-host warning specifically.

## Acceptance and verification

- Missing, uppercase, and browser-invalid type attributes follow the effective native input type and capture supported text changes.
- Uppercase radio inputs retain formControlName/name/id precedence.
- Password/email/tel inputs remain unsupported; unrelated hosts with a supported-looking `type` remain unsupported.
- Select and textarea behavior is unchanged.
- The unsupported-host test passes in isolation and as part of the suite because the directive actually runs.
- Focus input metadata reports the normalized type.

Run the isolated command above, then:

```powershell
npm test -- --watch=false --include '**/directive.service.spec.ts' --include '**/change.directive.spec.ts' --include '**/focus.directive.spec.ts'
npm run build
npm run lint
```

Limit changes to the shared helper, host validation, and directly relevant fixtures/tests. Do not add new supported semantic input types.
