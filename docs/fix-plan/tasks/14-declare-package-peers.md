# Task 14: Declare every package imported by the distributed library

**Priority:** P1, consumer installation/build failures. **Difficulty:** Small to medium. **Prerequisites:** Task 01 for the validation baseline; no runtime-task dependency. **Skills evaluated:** Package boundaries, dependency contracts, artifact inspection, consumer testing.

Implement only this task. Source references describe baseline commit `c82a646455583e96cebf497276d8706d139e3eeb`.

## Bug and cause

`projects/oculr-ngx/package.json:16-22` declares peers for `@angular/common` and `@angular/core`, and a dependency on `tslib`. It does not declare `@angular/forms`, `@angular/router`, or `rxjs`, although the library imports all three.

The successful baseline build confirms that these imports remain external in `dist/oculr-ngx/fesm2022/oculr-ngx.mjs:7-11`. The emitted `dist/oculr-ngx/types/oculr-ngx.d.ts:4-6` also imports their public types. These are reachable through the package entry point; a consumer need not explicitly use a form directive to encounter the static forms import. Relevant source includes `src/lib/directives/track-validation.directive.ts:10`, `src/lib/services/location.service.ts:12`, `src/lib/services/analytics-event-bus.service.ts:10`, and `src/lib/models/analytic-event.interface.ts:10-12`, all under `projects/oculr-ngx/`.

The root `package.json:15-26` installs all these packages for repository development and masks the incomplete library manifest. The root package is private and is not the manifest published from `dist/oculr-ngx`. A consuming application without forms/router can therefore satisfy the advertised library peers and still fail resolution or declaration checking. RxJS may happen to arrive via Angular peers, but relying on another package to declare this library's direct requirement is incomplete metadata.

## Reproduce and evidence limits

Run `npm run build`, then compare the emitted bundle and declaration imports against `dist/oculr-ngx/package.json`. The audit performed this artifact comparison and confirmed the missing entries. It did **not** perform a network install into a fresh external application; do not describe such an install as already tested.

For a consumer reproduction, use an isolated fixture with Angular core/common and the built tarball but no explicitly installed forms/router. It must resolve through its own dependency tree, not this repository's ancestor `node_modules`. Strict dependency layouts or peer auto-install settings can change the exact error, so the deterministic first check is the emitted dependency manifest.

## Proper fix

1. Add `@angular/forms` and `@angular/router` to the **library** peer dependencies, consistently with its supported Angular 21 range (`^21.0.0`). Add an explicit RxJS peer range justified by this repository's supported versions; `^7.5.6` matches its declared development dependency and avoids claiming untested RxJS 6 support.
2. Keep framework packages as peers so consumers use a compatible shared Angular installation. These imports are currently unconditional; marking the peers optional without changing the package structure is not a fix.
3. Preserve existing peers and `tslib`. Do not edit generated `dist` files as the source of truth, copy every root dev dependency into the library, bump the release version, or upgrade Angular.
4. Document the peer requirements in installation documentation. Add a small package verification check that builds the artifact, examines its external package roots (including subpaths such as `rxjs/operators`), and verifies their declaration. Alternatively use an isolated consumer compilation smoke test that would catch the original omission.

## Acceptance and verification

- `npm run build` produces a manifest declaring all external runtime/type package roots used by its public entry point.
- `npm pack ./dist/oculr-ngx --dry-run` succeeds; inspect the built manifest, not just the root development manifest. This command does not publish anything.
- A meaningful artifact or isolated-consumer check fails against the original manifest and passes with the fix. When using a consumer, install compatible Angular peer versions and ensure it cannot fall back to this repo's `node_modules`.
- `npm run lint` and `npm run test -- --watch=false` pass after task 01.

Report the emitted peer list and exactly which consumer/artifact checks ran. No registry publishing is part of this task.
