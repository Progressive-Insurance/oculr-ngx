# Task 02: Stop sensitive checkbox and radio labels reaching analytics

Severity: High. Difficulty: Small. Prerequisite: Task 01 baseline. Skills evaluated: tracing event construction, respecting an existing privacy contract, making a narrow behavioral fix, and testing both protected and ordinary paths.

## Bug and evidence

At reviewed commit `c82a646`, `projects/oculr-ngx/src/lib/directives/change.directive.ts:38` always calls `DirectiveService.setLabel()`. Only `setValue()` is inside the `!sensitiveData` condition at lines 39-41. The shared service reads associated label text at `projects/oculr-ngx/src/lib/services/directive.service.ts:23-29` and copies it into `analyticEvent.label` at lines 61-65.

For checkbox and radio controls, that label commonly identifies the selected answer. Setting `[sensitiveData]="true"` therefore removes `value` and `displayValue` while still transmitting the same answer through `label`. This contradicts `docs/change-directive.md:133-150`, which explicitly promises not to capture linked label text for sensitive checkbox and radio inputs. The existing sensitive-data test covers only a date input, where the label is the question and this distinction does not appear.

An in-memory probe transpiled the current TypeScript, used the installed Angular classes and jsdom DOM, and invoked the real directive. Both radio and checkbox cases emitted an event containing `"label":"Private condition answer"` with `sensitiveData=true`. No source files were changed for this probe.

## Minimal reproduction

Render either of these controls with the directive available in the component's imports:

```html
<input id="answer" oculrChange type="checkbox" [sensitiveData]="true" />
<label for="answer">Private condition answer</label>
```

Check the control and inspect the argument passed to `DispatchService.trackChange`. Repeat using `type="radio"`. The current event exposes the linked answer in `label` even though `value` and `displayValue` are absent.

## Proper fix

In `ChangeDirective`, distinguish automatically collected answer labels from ordinary field labels. When `sensitiveData` is true and the host is a checkbox or radio input, skip DOM label enrichment as well as value enrichment. Continue setting the identifier, element name, input type, and interaction metadata, and continue dispatching the event.

Preserve an explicitly supplied `DirectiveEvent.label`: the documented override allows an application to supply a safe question label. Do not mutate the caller's input object or remove unrelated custom scopes. Continue collecting question labels for sensitive date, number, search, text, select, and textarea controls. Avoid changing the shared service globally, which would unnecessarily affect focus and click tracking.

## Acceptance and verification

- Sensitive checkbox and radio events contain neither automatically derived answer labels nor `value`/`displayValue`.
- A sensitive radio with an explicit safe question label retains that label.
- Sensitive text/date/select controls retain their field labels and suppress answer values.
- Ordinary checkbox/radio events preserve existing labels, values, and display values.
- All cases still dispatch exactly once; supplied `DirectiveEvent` objects remain unchanged.

Add these regressions to `change.directive.spec.ts` using real associated labels, rather than mocking `setLabel`. Make at least the sensitive radio/checkbox cases fail against the old implementation.

Run from the repository root:

```powershell
npm test -- --watch=false --include '**/change.directive.spec.ts'
npm run build
npm run lint
```

Limit production changes to the directive behavior needed for this contract. Update the sensitive-data documentation only to clarify that explicitly supplied metadata remains the application's responsibility.
