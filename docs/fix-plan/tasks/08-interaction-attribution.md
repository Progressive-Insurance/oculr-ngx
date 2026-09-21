# Task 08: Reset completed click and change interaction attribution

Severity: Medium. Difficulty: Medium. Prerequisite: Task 01 baseline; retain earlier directive tasks. Skills evaluated: event ordering, state lifetime, mixed input-device behavior, and sequence-based regression testing.

## Bug and evidence

At reviewed commit `c82a646`, `projects/oculr-ngx/src/lib/directives/click.directive.ts:24` and `projects/oculr-ngx/src/lib/directives/change.directive.ts:25` retain `interactionDetail` between events. Their `touchstart` handlers set it to `touch`; their `mousedown` handlers refuse to overwrite a current touch value (`click.directive.ts:46-56`, `change.directive.ts:52-62`). That suppression is useful because a touch gesture can also generate compatibility mouse events.

Neither directive clears the recorded detail after its terminal click/change handler (`click.directive.ts:26-39`, `change.directive.ts:28-45`). A touch gesture therefore leaves the instance classified as touch indefinitely, until a keyboard event happens to overwrite it. A later genuine mouse interaction on the same element is incorrectly reported as touch. Other completed gestures can similarly leave stale metadata on later programmatic events.

An in-memory probe invoked each real directive with this sequence: `touchstart`, `mousedown`, terminal event, then a separate `mousedown`, terminal event. Both produced interaction details `["touch","touch"]`; the second event should be `mouse`. Existing tests recreate fixtures for each gesture, so they never exercise two modalities on the same directive instance.

## Minimal reproduction

Use one tracked button on a touchscreen computer with a mouse. Tap it, then click the same button with the mouse. For a tracked checkbox, tap to change it, then change it again using the mouse. Inspect successive `trackClick` or `trackChange` arguments. The current code reports both interactions as touch.

In unit tests, explicitly dispatch the corresponding native event sequence on the same element. Ensure the first gesture includes compatibility `mousedown`; omitting it would miss the behavior the suppression guard was intended to protect.

## Proper fix

Limit attribution state to a completed gesture. Capture its current detail in the event being dispatched, then reset the directive's stored detail at the end of the click/change handler. A cleanup path such as `finally` can ensure that rejected events or synchronous processing failures do not retain old state. Follow the useful lifecycle pattern already present in `FocusDirective.onFocus()` at `focus.directive.ts:25-38`, without changing focus semantics as part of this task.

Preserve the existing touch-versus-compatibility-mouse protection while a gesture is still in progress. Simply assigning `mouse` on every `mousedown` would fix the second gesture while misclassifying the first one. For this task, define a later programmatic terminal event with no new initiating interaction to have undefined detail; this is an explicit cleanup policy, not an existing documented guarantee. Do not invent a keyboard or mouse fallback. Reset change attribution at `change`, not at blur/focusout, so delayed field commits can still use their initiating interaction.

This task addresses state after completed gestures. If broader pointer-event support or canceled-gesture handling is proposed, separate it from this fix and require its own event-order evidence rather than introducing timer heuristics into this patch.

## Acceptance and verification

- On one directive instance, touch plus compatibility mouse events produces `touch`, followed by a separate real mouse gesture producing `mouse`.
- Keyboard-to-mouse, mouse-to-keyboard, and repeated touch sequences retain correct attribution.
- A terminal event with no new initiating event does not inherit the preceding completed gesture's detail.
- Missing-id rejection still resets state; after supplying an id, the next gesture is classified independently.
- The reset does not erase metadata already copied into the dispatched event.
- Existing single-gesture click, change, and focus tests continue passing.

Add sequence regressions to both directive spec files, not just a test of an internal reset method.

```powershell
npm test -- --watch=false --include '**/click.directive.spec.ts' --include '**/change.directive.spec.ts' --include '**/focus.directive.spec.ts'
npm run build
npm run lint
```

Keep production changes limited to click/change attribution lifetime and retain preceding fixes.
