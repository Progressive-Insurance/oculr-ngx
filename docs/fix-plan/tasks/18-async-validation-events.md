# Task 18: Report asynchronous validation failures associated with blur

Severity: Medium. Difficulty: Large. Prerequisite: Task 01 baseline; retain earlier completed tasks. Skills evaluated: Angular reactive-form lifecycle, observable ownership, asynchronous race handling, cleanup, and distinguishing existing contract from newly specified edge behavior.

## Bug, contract, and evidence

At reviewed commit `c82a646`, `projects/oculr-ngx/src/lib/directives/track-validation.directive.ts:23-31` handles `focusout` by reading `control.touched` and `control.errors` once. If an asynchronous validator is still pending, `errors` is null at that instant. The method returns and nothing observes the validator's subsequent result. A validation error that becomes visible immediately after the user leaves the field is never reported unless the user focuses and blurs the field again.

The documentation describes a directive that dispatches validation events from a Reactive Forms control (`docs/track-validation-directive.md:7`) and says to apply it to "any Reactive Forms control" (line 23). It does not restrict the feature to synchronous validators. The existing tests cover synchronous `Validators.required` only. The broad control contract supports fixing this missing asynchronous case; detailed cancellation and deduplication semantics below are explicit acceptance choices, not behavior promised by the current documentation.

The audit probe used the installed Angular `FormControl` with a Subject-backed asynchronous validator, connected its actual state through a minimal NgControl adapter to the real transpiled directive, and marked the control touched. At `onBlur()`, the state was `PENDING`, `errors:null`, `touched:true`. Only after `onBlur()` returned did the probe emit `{notUnique:true}` and complete the Subject. The control then became `INVALID` with that error, but the dispatch count remained zero. There was no timer delay assumption: the validator was deliberately resolved after the handler.

## Minimal reproduction

Attach `oculrTrackValidation` to a reactive username input with an asynchronous uniqueness validator. Enter a rejected username and leave the field while the request is pending. Resolve validation with `{notUnique:true}`. Angular exposes the validation error, but the current directive sends no validation-error event for that blur.

## Proper fix

Preserve the current immediate path for touched controls whose synchronous validation has already settled. For a touched control pending at blur, observe status changes until that blur's validation settles, then dispatch once if the settled control is invalid and has errors. Preserve the existing event shape and DirectiveEvent overrides.

Own the observation explicitly. Replace an older pending blur observation when another blur occurs, and tear it down when it settles or the directive is destroyed. Do not attach a permanent subscription that reports every validation change merely because the control was once touched. Use control lifecycle signals rather than fixed waits or polling. A valid or disabled outcome must finish the observation without dispatching.

For this task, choose a conservative rule for intervening edits: returning focus or changing the value before pending validation settles cancels the outstanding blur report. A subsequent blur creates a fresh observation. Document this choice so its tests express an intentional policy, not an accidental race outcome.

Guard the value or validation generation again at settlement; cancellation through `valueChanges` alone is insufficient. A second probe confirmed that calling `setValue('new')` with a replacement async validator returning an immediate `of(error)` can emit `INVALID` before `valueChanges`. A status-only observer can therefore report the new edit against the old blur before its cancellation signal arrives. Account for this ordering without changing Angular's validator behavior. With `updateOn: 'blur'`, the value update caused by that same blur belongs to the new observation and must not be discarded as an intervening edit.

## Acceptance and verification

- Blur while touched and pending, then settle invalid: exactly one event with the final errors and existing metadata overrides.
- Settle valid or disabled instead: no event and no lingering observation.
- Synchronous invalid blur still emits once; synchronous valid blur and untouched controls emit nothing.
- Validation that fails while typing before any blur emits nothing.
- Repeated focusout while pending does not multiply emissions for the same settling result.
- Refocus or edit before settlement cancels the old observation; a later blur tracks its own validation.
- While an old blur is pending, replace the value with one whose async validator resolves synchronously: no old-blur event is emitted for the replacement result, even when `statusChanges` precedes `valueChanges`.
- A real form control using `updateOn: 'blur'` still reports that blur's eventual invalid result exactly once.
- Destroy the fixture while pending: subsequent validator completion emits nothing.
- Resolving or clearing errors after an observation finishes does not emit an extra event.

Use controllable asynchronous validators in `track-validation.directive.spec.ts`, real form bindings, and explicit focus/blur events. Assert dispatch counts and payloads. Avoid wall-clock sleeps.

```powershell
npm test -- --watch=false --include '**/track-validation.directive.spec.ts'
npm run build
npm run lint
```

Limit scope to this directive, its tests, and documentation of the chosen blur semantics. Do not change global dispatch behavior or emit analytics for every form status transition.
