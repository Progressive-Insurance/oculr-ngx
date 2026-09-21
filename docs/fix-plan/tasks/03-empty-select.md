# Task 03: Handle select controls with no selected option

Severity: Medium. Difficulty: Small. Prerequisite: Task 01 baseline; retain earlier directive fixes. Skills evaluated: DOM boundary conditions, choosing consistent optional-field behavior, and writing regression tests that exercise real browser state.

## Bug and evidence

At reviewed commit `c82a646`, `projects/oculr-ngx/src/lib/directives/change.directive.ts:89-93` handles a select by copying `element.value`, then reading `element.options[element.selectedIndex].text` without checking whether an option exists.

A select can legitimately have `selectedIndex === -1`: it can have no options, have its selection cleared, or temporarily contain no matching option after its options or bound value change. A multiple select can also reach this state when the last selected option is deselected. Indexing the options collection with `-1` produces `undefined`; reading `.text` then throws. The exception occurs before `trackChange()`, so analytics loses the change event and an exception escapes the directive's event handler.

An in-memory probe using the current transpiled directive, installed Angular classes, and jsdom created `<select id="empty"></select>`. It observed `selectedIndex=-1`, then `onChange()` threw `TypeError: Cannot read properties of undefined (reading 'text')`. This evidence establishes the unsafe state without requiring a network destination or edits to the repository. Existing select tests cover only a valid selected option.

## Minimal reproduction

Render `<select oculrChange id="choice"><option value="a">Alpha</option></select>`. Set the actual DOM select's `selectedIndex` to `-1` and dispatch a `change` event. Alternatively, use an empty select and dispatch the event through the application's normal integration. The current handler fails at the display-text lookup.

Setting selection programmatically alone does not emit a native change event. The regression test must explicitly emit the event; the test should not imply that changing `selectedIndex` automatically does so.

## Proper fix

Read the selected option safely before extracting its text. Preserve `value` as the native select value, which is the empty string in the no-selection case. Define the no-selection payload consistently: omit `displayValue` when no selected option exists. For a real blank placeholder option, continue reporting its actual text, including an empty string when appropriate.

Do not drop the entire analytics event and do not use a broad exception handler around event processing. Missing option data is an ordinary state that should be represented explicitly. Keep normal option label/value extraction, identifiers, field labels, interaction details, and `sensitiveData` behavior intact. This task does not expand the event schema to represent arrays of multiple selected values; its scope is making the existing selection lookup safe.

## Acceptance and verification

- An empty select dispatches once without throwing; `value` is `''` and `displayValue` is absent.
- A populated select with `selectedIndex=-1` behaves the same way.
- A multiple select with its final selection cleared does not throw.
- An ordinary selection still reports the correct native value and selected option text.
- A selected placeholder option remains distinguishable from no option through its actual `displayValue`.
- With `sensitiveData=true`, the event still omits both value fields and does not attempt answer enrichment.

Add meaningful DOM-based cases to `change.directive.spec.ts`. Check both the captured event payload and dispatch count; an assertion that merely expects no exception would miss accidental event suppression.

Run from the repository root:

```powershell
npm test -- --watch=false --include '**/change.directive.spec.ts'
npm run build
npm run lint
```

Keep the change local to select extraction and its regression tests. Preserve fixes from preceding tasks.
