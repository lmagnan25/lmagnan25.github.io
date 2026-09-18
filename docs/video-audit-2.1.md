# Independent video audit — 2.1

## Status and scope

Fresh review of the current film source, development stills, first-cut and corrected final MP4 frames, and live portfolio playback at desktop and 390×844 portrait sizes. The encoded film reports 24.966667 seconds. Review used sampled live playback plus half-second contact sheets across the full film; it is not a frame-by-frame motion certification. The accepted 2.0 snapshot was not edited. This is a visual/editorial audit, not a reactor-design validation.

## Assessment

The requested direction is sound. The sole concrete visual defect found in the first encode—the brightness step during the dissolve—has been corrected and rechecked in the final encoded frames. No blocking visual issue remains in the inspected evidence. The rigid spacer grids read as manufactured parts, the finished reactor remains registered during its dissolve, and the close neutron view gives the transport paths enough scale to become the visual payoff. The restrained heading/navigation and dark page frame leave the film in charge.

The film's clearest story is **pellet → rod → bundle → reactor → transport inside the same volume**. Its strongest opportunity for further polish is controlling visual weight during that last transition, rather than adding more subject matter.

## Requested fixes and evidence

- **Mechanical build at twice the earlier pace:** `film-timing.js` compresses scene progress .125–.387 by 2×, reducing the overall duration from 32 to 24.95 seconds while preserving the initial pellet and neutron-history timing.
- **Rigid spacers:** the film-only option fixes spacer scale at 1 and seats them with a short axial translation. The .178 still shows grids at plausible bundle width, without the earlier oversized squares.
- **Completed vessel dissolves without disassembly:** film mode removes blade withdrawal; the camera holds from .405 to .465. The corrected renderer blends the completed vessel image into the live radiograph/neutron image, keeping opaque surface occlusion stable. Final encoded frames at 14.9, 15.1, 15.5, 16.2 and 16.9 seconds show the same registered vessel fading without the first encode’s silver-rod pop. The radiograph remains as an intentional separate context layer.
- **Close neutrons with a faithful guide:** the camera settles at radius 94 then 90; the .57/.65 development stills make individual paths legible. Cross-sections derive from the nine bundle centers, 8×8 pin pitch, and channel width. They should be described as a fuel-lattice guide, not a calculation mesh.

## Pacing and general arc

Approximate times from the film's deterministic clock:

| Time | Beat | Editorial reading |
| --- | --- | --- |
| 0–6.73 s | Pellets and featured rod | Tactile introduction; deliberately the slowest-feeling beat. |
| 6.73–9.17 s | Rod array, grids, ties, channel | Clear increase in scale; watch for simultaneous arrivals becoming too dense. |
| 9.17–11.49 s | Bundle group and controls | The camera must keep the central bundle as the registration point. |
| 11.49–13.78 s | Vessel and internals complete | Several arrivals converge; silhouette provides the clearest hierarchy. |
| 13.78–14.74 s | Completed vessel hold | Approximately one second to register the result. |
| 14.74–16.90 s | Solids dissolve | Approximately 2.15 seconds, with a fixed camera and a complete-image blend; good separation from the following push. |
| 16.90–19.05 s | Camera enters transport volume | The principal scale-change payoff. |
| 19.05–22.73 s | Close transport | Time to observe individual histories; vessel context fades within this interval. |
| 22.73–24.95 s | Paths and film fade to loop | A quiet reset instead of reversing the build. |

The encoded sequence preserves this coherent structure. The accelerated assembly has a clear start and completion; the finished-vessel hold prevents the dissolve from swallowing the payoff. The final fade gives the loop a quiet reset, with no reverse disassembly. The initial pellet beat occupies a little over a quarter of the film and is the main candidate if a later version needs a faster overall pace; shortening it is an optional editorial direction, not part of the requested assembly speedup.

## Component placement and legibility

- The central fuel bundle is a useful visual anchor. Spacer widths, channel walls and ties describe one consistent vertical object in the supplied still.
- The completed vessel contains a readable hierarchy: fuel volume low/central, separators and dryer above, control-drive hardware below. Its silhouette and cutaway stay understandable.
- The channel/shroud faces are dark, broad surfaces that hide much of the fuel detail in the completed-vessel shot. This is an occlusion/composition tradeoff, not evidence that components are misplaced.
- The four cross-shaped blades are positioned in inter-bundle gaps in source; film mode retains their assembled location during the dissolve. No withdrawal is intended.
- The vessel cutaway, open corner on the featured channel, and simplified teaching-model hardware are explanatory choices. They should not be judged as fabrication drawings.
- Axial assembly of grouped grids/ties is illustrative choreography. Passing through an intermediate position is not automatically a collision bug; only visible, distracting intersections or unseated final parts warrant a visual fix.

## Prioritized findings

### Resolved — opacity transition abruptly exposed a bright rod block

The first-cut encoded MP4 had a visible brightness step around 15.0 seconds: broad dark channel faces became bright silver rod arrays, and the top head changed its occlusion abruptly. The source was the per-material transparency/depth behavior, not component movement. The first-cut evidence remains at `tmp/audit-2.1/fade-onset.jpg` and `tmp/audit-2.1/fade-15.4.png`.

**Resolution verified:** the corrected renderer captures the completed vessel with normal opaque occlusion and blends that registered image into the live radiograph/neutron render over .405–.465. Solid objects are hidden in the live layer during this blend. I independently inspected corrected encoded frames at 14.9, 15.1, 15.5, 16.2 and 16.9 seconds (`tmp/audit-2.1/corrected-*.png`). The dark core stays consistent, the head has no abrupt reveal of its back surfaces, and the ghost/neutron endpoint occupies the same location. The camera push follows the completed blend. This finding is closed.

### Optional polish — keep the neutron close-up visually quieter than the mechanical build

In the supplied close stills the broad blue radiograph walls at both sides carry substantial visual weight, while three cross-section planes remain clearly visible. The paths are readable, but the combination can feel like a technical viewport more than a delicate ghost volume. A small reduction of the **close-shot** radiograph gain, or an earlier radiograph fade after entering the volume, could make paths the unambiguous subject. Keep enough vessel context through the dissolve to preserve spatial continuity. This is polish, not a failed requested fix.

### Preserve — the finished-vessel pause when making later timing changes

The build accelerates successfully in source, but the result deserves its approximately one-second hold. Further global speedup would erode the distinction between assembly, completion and dissolve. If more time must be removed, discuss trimming the opening instead.

## Playback and mobile composition

- The final root page loads the 2.1 desktop and portrait MP4 sources at the respective viewports; the accessible description no longer incorrectly says 32 seconds.
- Autoplay proceeds, and the Pause/Play control changes state correctly in both directions.
- At 390×844, the full name/role fits on one line, navigation remains separate, and video controls remain below the picture. The vertical bundle fits comfortably; the central vessel and transport volume retain their hierarchy.
- Incoming hardware can originate beyond the picture edges. In the inspected build frames this reads as arrival, not a missing final part. The completed vessel includes its lower control-drive hardware.
- Desktop leaves considerable black space beside the narrow reactor silhouette. That is consistent with the minimal site, though it is one reason the close transport shot feels much more immersive.
- The portrait transport view is especially effective: the volume fills the film frame while the page remains quiet. Fine grid lines and paths survive the crop and encoding in the sampled views.
- No persistent floating component or obviously unseated final part was visible in the encoded contact sheets. The only actionable defect found was the opacity/occlusion step, now resolved as described above.

## Optional directions for discussion: wow factor and cleanliness

1. **More sculpted light on the completed vessel.** A restrained rim and slightly better separation of the upper internals could create a stronger finished-object moment without changing geometry. Tradeoff: too much shine makes it look like a product advertisement and can hide the engineering detail.
2. **A quieter handoff to transport.** Let the radiograph establish continuity, then reduce its weight as the close-up settles; keep the real lattice guide barely present. Tradeoff: cleaner particles, less immediate vessel context.
3. **A more deliberate three-scale camera rhythm.** Emphasize macro material, assembled object, and interior transport as three distinct viewpoints, with controlled holds between scale changes. Tradeoff: stronger cinematic structure may require moving a small amount of time between beats.
4. **A slightly shorter opening for repeat visitors.** Remove a small amount of the pellet-arrival linger while preserving the material close-up. Tradeoff: faster payoff, less tactile introduction; this should be chosen deliberately because the current task preserves pellet timing.

No extra labels, HUD, CFD, turbine, or fabricated mesh is needed to pursue these directions.

## Final recommendation

Keep this corrected 2.1 as the concrete revision to discuss. The next optional experiment with the best payoff is a quieter radiograph after the camera enters the transport volume, followed by modest lighting refinement on the completed vessel. Choose those by side-by-side preference; they are not necessary to fulfill the requested fixes.
