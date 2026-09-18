# Independent adversarial review — field4

Reviewed 17 September 2026 by a fresh independent reviewer. I formed the visual judgment before reading any earlier review documents; none were consulted. Implementation was not edited.

## Verdict

**The new material is credible and restrained, but the complete scroll film is not yet at the requested exceptional standard.** The largest defect is a broken visual handoff into the channel: the viewer passes through an opaque-looking wall of rods before the short calculated passage appears. The other material weakness is the ending: excellent recognizable machinery carries more of the story than the actual steam/condensate flow.

Keep the pellet treatment, assembled bundle, muted neutron density, scalar-field anchor, and channel anchor. The new field and channel are substantive improvements in the scientific content. Fix the transitions and fluid readability rather than redesigning those strong shots or adding more page copy.

## Ranked findings

### 1. P1 — The field-to-channel move obscures the subject it is introducing

**Observed:** At approximately progress 0.70–0.73, the restored full-length rod lattice fills almost the entire 1200 × 757 viewport. At measured progress **0.72337**, the visible image is a nearly continuous grey wall of rods with just a faint outline of the short passage behind it. “Channel temperature” and its full legend are already visible. By approximately 0.738 the four-rod cutaway suddenly becomes clean and readable. The same obstruction occurs when scrolling backward.

**Why it matters:** This is the central scale change of the new pass. Instead of seeing a particular passage selected from the core, the viewer loses the selected object and then receives a different isolated object. The anchors themselves hide the problem; ordinary scrolling exposes it.

**Relevant implementation:** `reactor.js` camera shots at 0.701 and 0.737; `bwr-scene.js:149` restores all rod opacity and then multiplies it by `1-focus`; `bwr-fields.js` ramps channelGain only over 0.704–0.733. Multiple partly transparent surrounding rods visually accumulate in front of the intended subject. The channel legend is driven by gain, not by whether the cutaway is actually unobstructed.

**Required outcome:** Retain a visibly selected four-rod region while removing surrounding material before the close camera passes it. Separate the surrounding-lattice fade from the passage reveal. At every intermediate position from 0.69 through 0.74, the viewer should be able to locate the destination passage. Delay its legend until the calculated plane can actually be seen. Verify backward as well as forward.

### 2. P2 — Steam and condensate are too hard to follow against their machinery

**Observed:** From the vessel pullback through the turbine and condenser, the pipework and turbine blades are immediately legible, but the fluid is visible mostly as occasional tiny flecks on pipe edges or short disconnected dotted segments. At the turbine anchor, the bright inlet, rotor, casing flanges, and shaft dominate; I cannot readily follow a continuous steam route through them. At Return, the tube bank and blue hotwell plane read, but the phase change and return direction need deliberate searching. The cooling circuit is especially difficult to distinguish.

**Why it matters:** The user asked for an engineering film that proceeds from heating and bubbles to steam doing work and water returning. The ending currently reads primarily as a mechanical model inspection. This is a process-comprehension defect, not a request for more decoration or larger glowing particles.

**Relevant implementation:** `bwr-thermal.js:122–127` renders small soft points plus low-opacity one-pixel tails over bright metal, with no depth test. Paths exist in the code; their visual separation is insufficient in the actual composition. This is consistent across intermediate positions, not just the last frame.

**Required outcome:** Give the actual fluid route a readable channel through the hardware: selectively darken/recede the cutaway pipe interior, keep a modest coherent fluid front, and stage steam arrival, expansion/exhaust, condensation, and return so their directions are evident during small scroll increments. Preserve the restrained palette. No additional paragraph or neon trail is needed.

### 3. P2 — All later scientific data block the first rendered pellet frame

**Code-confirmed deployment risk; not a measured localhost stall:** `reactor.js:32–58` waits for all neutron buffers and then all channel/core fields before reaching the initial render setup. These required local assets total **22,568,045 bytes** before the Three.js modules and other overhead; the temperature volume alone is about 4.9 MB. This couples the opening to the largest later chapters. A failed late field fetch also prevents the entire opening from rendering.

**Why it matters:** A local warm preview conceals this cost. On a fresh remote visit, the excellent opening is held behind scientific assets that are not used until much later. The existing loading text is honest but does not preserve the intended immediate visual entrance.

**Required outcome:** Render the opening after the geometry metadata is available, and load later recorded paths/fields asynchronously with explicit chapter-ready behavior. Keep scroll seeking safe while data load. Alternatively, demonstrate acceptable uncached remote startup before treating this as resolved. Do not claim a mobile performance pass from the local desktop review.

### 4. P3 — Scalar provenance describes a different normalization from the displayed one

`assets/bwr/field.json` says the display is “normalized to maximum cell mean.” `bwr-fields.js` instead uses twice the mean of the entire field array, and the UI correctly labels its upper bound “≥2 × mean.” The runtime and visible legend agree; the exported metadata is stale.

**Required outcome:** Make the metadata describe the actual mean normalization and define whether this means all mesh cells or only active cells. This is a small provenance correction, not a reason to replace the field.

## What passed

- The pellet material and construction sequence retain their precision and restraint. The bundle is instantly recognizable without excessive labels.
- The neutron chapter is genuinely dense but quiet. At the anchor, browser diagnostics report **6,004 recorded paths, 3,100 live heads, and 101 selected trails**. Visually it avoids a web of bright long lines. Source inspection confirms staggered presentation timing with the recorded positions retained; the About text does not misrepresent this as a reactor clock.
- The core field uses an actual OpenMC kappa-fission volume and calls itself relative fission heating. Its cold fixed-source qualification is visible. The tall geometry and sparse bundle layout differ from the supplied ExaSMR image, but adopting that image's circular reactor geometry merely for appearance would be inappropriate.
- The channel anchor reads as four rods with intersecting scalar slices, an inlet-to-wall temperature scale, and restrained flow strokes. The separate reduced laminar calculation is disclosed directly in the legend and more fully in About.
- Surface bubbles read as bubbles attached to rods and then departing, not as cartoon icons. The “Illustrated bubble growth and departure” label makes the scientific boundary clear when the scalar planes disappear.
- Reverse navigation returns to the expected neutron and field states; no residual bubbles or wrong legend persisted in the inspected anchors. The same transition weakness reproduces in reverse, so it is not a stale-frame error.
- Rendering is scheduled by scroll/resize/visibility changes rather than an unconditional idle animation loop. The reviewed implementation consistently derives presentation state from scroll position.
- The final whole-plant composition is coherent and recognizable. The problem is fluid readability within that composition, not missing machinery.

## Coverage and limits

Actual UI inspected in a newly created Chrome tab, browser 1, at `http://127.0.0.1:8765/reactor.html`, field4 assets, **1200 × 757** viewport. I inspected the pellet sequence and assembly, neutron/field/channel/boiling/turbine/return anchors, multiple intermediate scroll positions, final End position, and reverse travel into the channel and back to earlier anchors. I inspected the scalar/channel generators, metadata, scheduling, renderer, and hardware code after forming the visual judgment. I did not rerun OpenMC or the thermal solver, benchmark remote loading, or claim a frame-rate measurement. Mobile resizing was deliberately not performed because the available viewport control could affect an existing user tab. No earlier review report was used.

---

## Targeted verification — field7

Rechecked the requested fixes in a new dedicated Chrome tab at the same 1200 × 757 viewport. The page explicitly loaded `reactor.js?v=field7`. This section supersedes the unresolved status of the original findings above; the original observations are retained as the review record.

**Updated verdict: no remaining blocker found in this targeted desktop recheck.** The principal transition failure is resolved, the plant flow can now be traced, and the opening no longer waits on the later scientific datasets. Further adjustment to the subtle plant-flow emphasis would be polish, not a reason to withhold this pass.

| Original finding | Verification result |
| --- | --- |
| P1 surrounding-rod wall | **Resolved visually.** At the exact previously failing progress, 0.72337, only the four selected rods remain visible against the dark background. The channel legend is absent while the rods shorten. Reverse travel to 0.70521 and forward travel to 0.73700 preserve the selected object; the calculated slices and legend arrive with a readable passage. No lattice obstruction or stale field remains. |
| P2 unreadable plant flow | **Resolved sufficiently for this pass.** Turbine, intermediate exhaust/condenser, Return, and final whole-plant views now expose continuous, restrained flow routes rather than scattered isolated flecks. The warm steam route can be followed through the visible turbine annulus into the exhaust; condensate and cooling paths have a compact explanatory key. The cool paths remain subtle against the condenser tube bank, but they are identifiable and this no longer blocks process comprehension. |
| P2 scientific payload blocks opening | **Resolved in implementation; local startup successful.** `start()` now awaits only the geometry manifest, sets up and schedules the opening, then starts independent neutron and field promises after the first rendering opportunity. Chapter-specific loading/error states exist. The approximately 22.6 MB data payload still exists, but it is no longer a prerequisite for the opening. This recheck does not claim a throttled-network benchmark or forced-failure test. |
| P3 normalization metadata | **Resolved.** The exported field metadata and generator now describe the actual range: zero to twice the mean over all mesh cells, including zero cells, with upper saturation and the display threshold documented. |

### Additional requested checks

- **Opening preserved:** the fuel anchor retains the original material, pellet alignment, dark background, and restrained lighting. No new UI clutter appeared in the opening.
- **Idle rendering stops:** at Return, progress 0.98199 and renderCount 11 were unchanged across separate observations with a console inspection and source inspection between them. Rendering advanced only after the next page movement.
- **Console clean:** the dedicated field7 tab returned an empty warning/error log after the inspected sequence.
- **Scope:** desktop only; no mobile claim. No new broad aesthetic demands were introduced. No implementation files were changed by this reviewer.
