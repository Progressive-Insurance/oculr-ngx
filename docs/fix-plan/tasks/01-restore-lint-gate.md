# Task 01: Restore a usable lint gate

**Priority:** P2, development and release reliability. **Difficulty:** Small. **Prerequisites:** None. **Skills evaluated:** Tool diagnosis, restrained configuration changes, test semantics, CI wiring.

Implement only this task. Source references below describe baseline commit `c82a646455583e96cebf497276d8706d139e3eeb`; inspect the current files because earlier work may move lines.

## Bug and evidence

Running `npm run lint` at the baseline exits 1 with **79 errors**, while `npm run build` and `npm run test -- --watch=false` pass. The reported rule families are `@angular-eslint/prefer-inject`, `@typescript-eslint/await-thenable`, `@typescript-eslint/require-await`, and `@typescript-eslint/no-unnecessary-type-assertion`.

The TypeScript override in `.eslintrc.json:10-34` inherits current recommended Angular rules, including a preference for `inject()`. This codebase consistently uses constructor injection, and many unit tests instantiate those constructors directly. There are also real cleanup issues left in migrated tests: `await` on synchronous `fixture.detectChanges()` / DOM dispatch operations, and asynchronous functions with no asynchronous work. See `projects/oculr-ngx/src/lib/directives/change.directive.spec.ts:64`, `interceptors/analytics.interceptor.spec.ts:55-67`, and `services/page-view-timings.service.spec.ts:54` under the same library directory.

Both `.github/workflows/build.yml:30-35` and `.github/workflows/publish.yml:30-35` run build and tests but omit lint. Consequently the configured lint command cannot currently serve as a passing baseline, and CI does not enforce it.

## Reproduce

From the repository root, run `npm run lint`. Confirm the error families above. This is an observed command failure, not an assumption that ESLint 9 cannot load the legacy configuration: the installed Angular ESLint builder successfully loads `.eslintrc.json`.

## Proper fix

1. Explicitly disable only `@angular-eslint/prefer-inject` in the existing TypeScript rules, documenting that constructor injection remains the project convention. This keeps the task small and preserves direct-construction tests. A repository-wide DI migration is outside this task.
2. Remove unnecessary `await` expressions and `async` modifiers where the operation is synchronous. Preserve actual asynchronous waits, including component compilation, promises, and timer advancement. If a test really requires stabilization, await the appropriate Angular operation rather than merely removing its wait.
3. Remove the three unnecessary assertions reported by lint without broadening types or introducing `any`.
4. Add `npm run lint` to the existing build/test block in both workflows. Make the test invocation explicitly nonwatching (`npm run test -- --watch=false`) so local and automated gate commands are easy to reproduce.

Do not disable type-aware rules globally, exclude whole spec files, migrate ESLint config formats, update dependencies, or repair unrelated behavior. Task 04 repairs the independently broken unsupported-host fixture; this task must not skip it or remove its assertion.

## Acceptance and verification

- `npm run lint` exits 0 with the existing production and spec scope still checked.
- `npm run test -- --watch=false` retains all baseline tests: initially 124 passing and the two pre-existing retry skips. Do not increase skips. Subsequent tasks add tests and remove those skips.
- `npm run build` exits 0.
- Both workflows include lint before their build/test block can succeed; publish remains downstream of all checks. Inspect the YAML locally; do not publish a package or trigger a release.
- No runtime API change or constructor migration appears in the diff. Test edits preserve assertion intent and legitimate asynchronous work.

Report the changed rule, meaningful test cleanup, and all three command results. This task repairs the validation gate; it does not establish that the behavioral defects in later tasks are fixed.
