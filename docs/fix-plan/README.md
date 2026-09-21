# Repository fix plan for sequential model evaluation

This plan contains independent task prompts for a local coding model, with explicit dependencies where fixes overlap. Feed **one task file at a time**, in the order below. Each file explains the observed problem, its cause, the proper fix, regression cases, and what the task evaluates. The application has not been fixed as part of preparing this plan.

For automated feeding, [manifest.json](manifest.json) lists the task files in order, their categories, difficulty, and accepted earlier work to retain. The Markdown task files contain the full prompts.

Audit date: **2026-09-17**. Baseline commit: **`c82a646455583e96cebf497276d8706d139e3eeb`**. Repository: `oculr-ngx`, an Angular analytics library. Source paths and line numbers in the cards refer to this commit; after preceding fixes, locate the named symbol rather than relying on unchanged line numbers.

## Observed baseline

Checks ran in `C:\temp\oculr-ngx` using the already installed dependencies, Node **22.20.0**, and npm **10.9.3**. These are observations from this checkout, not a claim that a fresh install or hosted CI was tested.

| Check | Result |
| --- | --- |
| `npm run build` | Passed, including package generation and postbuild asset copying. |
| `npm run test -- --watch=false` | 18 test files passed; **124 tests passed, 2 skipped**. |
| `npm run lint` | Failed with **79 errors**. Task 01 establishes a usable gate. |
| Isolated unsupported-host test | Failed: expected warning was absent. The full suite masks this; task 04 addresses it. |
| Built package imports versus peer metadata | Missing direct peers for Angular forms/router and RxJS; task 14 addresses them. |

The isolated test command was:

```powershell
node node_modules/@angular/cli/bin/ng.js test --watch=false --include '**/change.directive.spec.ts' --filter 'unsupported host element' --progress=false
```

Runtime findings were checked with targeted probes using the repository classes, installed Angular/RxJS, and DOM/form fixtures where appropriate. Some probes transpiled TypeScript in memory; these are distinct from new committed Angular regression tests. Each card states its evidence. No production source or existing test file was edited for the audit. The pre-existing untracked `PR_BODY.md` was left untouched.

## Execution order

The order first restores verification, then exercises local data handling, then subscription/timing behavior, followed by package/API boundaries and asynchronous forms. It is an evaluation sequence, not a production incident triage order: privacy and continued delivery to removed destinations would deserve early attention in a production remediation effort.

P1 means a high-impact privacy, delivery, or consumer failure. P2 means incorrect behavior or an important verification gap. Difficulty is a rough comparison of the reasoning and implementation required, not a time commitment.

| Task | Problem | Difficulty | Main skill evaluated |
| --- | --- | --- | --- |
| [01](tasks/01-restore-lint-gate.md) | Lint fails and CI does not enforce it | Small | Tool diagnosis and restrained changes |
| [02](tasks/02-sensitive-control-labels.md) | Sensitive checkbox/radio labels leak into events | Small | Privacy contract and data flow |
| [03](tasks/03-empty-select.md) | A select with no selection throws during change tracking | Small | DOM boundary conditions |
| [04](tasks/04-normalized-input-types.md) | Valid text inputs are rejected; a test passes only in the full suite | Medium | Browser semantics and test isolation |
| [05](tasks/05-unfocused-duration.md) | Unfocused duration has the wrong sign | Small | Numerical invariants and fake clocks |
| [06](tasks/06-repeated-query-parameters.md) | Repeated query parameter values are dropped | Small | Serialization fidelity |
| [07](tasks/07-current-performance-configuration.md) | Performance labels retain configuration captured too early | Medium | Initialization order and state ownership |
| [08](tasks/08-interaction-attribution.md) | A touch interaction contaminates later mouse attribution | Medium | Input-event sequences |
| [09](tasks/09-startup-http-completions.md) | HTTP completion events are lost across configuration startup | Large | Asynchronous race conditions |
| [10](tasks/10-disable-destinations.md) | Removed destinations continue logging | Medium to large | Subscription lifecycle and disable behavior |
| [11](tasks/11-destination-replay.md) | Configuration reloads resend already delivered events | Large | Replay semantics and duplicate prevention |
| [12](tasks/12-focus-listener-lifecycle.md) | Performance tracking overwrites host handlers and stays enabled | Medium | Browser lifecycle and cleanup |
| [13](tasks/13-navigation-timing-lifecycle.md) | Overlapping stability waits misattribute page timings | Large | Router event correlation and cancellation |
| [14](tasks/14-declare-package-peers.md) | Distributed package omits required peer declarations | Small to medium | Consumer package boundaries |
| [15](tasks/15-retry-regression-tests.md) | Skipped retry tests do not exercise observable errors | Medium | Error-channel and scheduler testing |
| [16](tasks/16-location-base-url.md) | URL prefixes break for normalized paths and hash routing | Large | Framework integration and URL semantics |
| [17](tasks/17-api-context-type.md) | Public HTTP context token infers unusably narrow types | Small | Public TypeScript API design |
| [18](tasks/18-async-validation-events.md) | Validation completing after blur is never reported | Large | Async form state and lifecycle |

Task 01 is a gate prerequisite for all later tasks. Task 11 builds on task 10; task 12 must preserve 05 and 07; task 16 must preserve 06. Other cards name related regression coverage to rerun. If an earlier attempt is rejected, restore or supply an accepted prerequisite before evaluating dependent work. Do not silently make a later model repair a failed earlier attempt.

## How to run each evaluation

1. Begin from the accepted result of the preceding task. Give the model the complete next task file, repository access, and the common instruction below. Keep subsequent task files out of its supplied prompt if measuring task isolation.
2. Require the model to reproduce the defect or verification gap before fixing it. Prefer a focused regression that fails for the stated reason. Package and type tasks may use artifact/consumer compilation checks instead of a browser unit test.
3. Review the proposed diff against the card's scope and acceptance cases. Preserve previously accepted regressions. Reject unrelated refactors, skipped assertions, loosened types, or wholesale configuration suppression used to manufacture a pass.
4. Run the targeted command in the card, then the full suite, lint, and build. Run the public-package/type check as well for tasks 14 and 17. Use Angular's configured test builder; a direct `vitest` invocation is not an equivalent replacement for the Angular test setup.
5. Record the outcome before providing the next task. Apply only accepted work to the cumulative evaluation baseline.

Common instruction to prepend to each task:

> Implement only the attached task in the current repository. Add a regression or verification check that catches the original problem, preserve existing behavior outside the stated scope, and use the repository's Angular test setup. Do not commit, push, publish, or implement other task cards. Report the cause, files changed, commands actually run and their results, and any acceptance criterion still unmet. Earlier accepted task changes must remain intact.

The default cumulative verification commands, run from the repo root, are:

```powershell
npm run test -- --watch=false
npm run lint
npm run build
```

The test count should grow as tasks add regressions. Task 15 should eliminate the two original retry skips. A passing baseline suite is insufficient evidence by itself: several cards exist precisely because current tests do not assert the failing scenario.

## Evaluation record

Use one row per attempt so comparisons measure the same work. Record the model name/settings separately from correctness; do not infer capability from duration alone.

| Task / attempt | Model/settings | Reproduction caught original defect | Acceptance cases passed | Prior regressions preserved | Lint / build / full tests | Scope and explanation | Time / tokens if measured | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| | | | | | | | | |

Suggested scoring uses four independent 0-2 scores: diagnosis, fix correctness, regression quality, and scope/reporting. **0** means absent or incorrect, **1** means partial, and **2** means complete and supported by evidence. Treat a material unmet acceptance case as a failed task even if other dimensions score well. Keep environment failures separate from implementation failures.

This is a concrete audit backlog, not an assertion that every possible defect has been enumerated. It intentionally omits speculative SSR support, general modernization, dependency upgrades, and cosmetic cleanups without a demonstrated problem. The repository's archival notice remains part of its existing documentation; these cards are prepared for the requested local evaluation, without release or publishing actions.
