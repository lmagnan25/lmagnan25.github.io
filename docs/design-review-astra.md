# Independent Astra design review

**Date:** 2026-09-17  
**Scope:** Independent review of the pre-revision BWR website demo at `reactor.html`.

This review records the state observed before the subsequent design revisions. It is not a review of the revised implementation.

## Overall judgment

The opening has a strong visual identity. After assembly begins, the film becomes a collection of procedural objects whose relationships are difficult to understand. The “AI generated” impression comes mainly from **generic repeated geometry, uniformly glossy materials, floating components, and motion without a clear mechanical reason**.

I read `docs/design-notes.md` and `docs/reactor-background.md`, and inspected the live page through the pellet, assembly, vessel, neutron, heat, turbine, return, and final pullback views in my own Chrome tab. No implementation files were edited during the review.

## Recommended direction

**A dark, carefully lit engineering cutaway with cinematic close-ups.** Establish convincing structural silhouettes first, then reveal physical processes with restrained particles. Keep the black background, quiet navigation, and minimal chapter labels.

## Prioritized changes

### 1. Rebuild the rod → bundle → core transition around one recognizable object

Currently the pellet column is surrounded by a cropped forest of rods arriving from both ends; detached square sleeves then surround a dense block. The viewer never gets a clear held view of a completed bundle. Keep the hero rod identifiable, complete its cladding, reveal the neighboring rod lattice, seat spacer grids, then close a partially cutaway channel around that bundle. Hold briefly before placing neighboring assemblies. Move the camera after each relationship becomes legible.

### 2. Make control blades a visible structural event

In the completed core views I could not identify control blades or meaningful inter-assembly gaps. The core reads as one rectangular mass of identical rods. Use a short elevated view to reveal four neighboring square channels and the cruciform space between them; show a blade entering that gap from below. This gives the repetition a reason and creates a memorable BWR-specific image. Preserve the underlying teaching-model geometry where it represents the recorded neutron calculation.

### 3. Replace the glass-capsule vessel impression with a supported internal assembly

The current vessel has a shiny dome, transparent straight walls, floating short separator cylinders, and a disconnected blue zigzag dryer. There is little visual explanation of how these parts attach or how water reaches them. Add the selected reference design’s major supporting forms: core support, shroud, upper plenum/standpipes, separator deck, and dryer housing. Show a deliberate section opening, with visible wall thickness and dark solid metal around it. Reserve transparency for a specific explanatory purpose.

### 4. Show heat transfer locally before showing the whole circulation route

Heat currently appears as a uniformly salmon-colored rectangular core with dozens of nearly parallel luminous hairs. That looks like glowing material or fiber optics. Begin with a close view of several rods: subtle warmth at the fuel/cladding, water moving alongside, small bubbles originating at rod surfaces and becoming more numerous upward. Then widen into the assembly and vessel. Use a restrained thermal overlay; the entire core should not become a featureless pink block.

### 5. Give liquid water, boiling mixture, and steam distinct visual behaviors

The bright horizontal blue disk resembles a floating plate. Tiny blue beads are easily lost among long white lines. Replace the dominant disk with a very subtle liquid boundary, and use small translucent, softly edged sprites with varied size, spacing, and opacity for bubbles. Keep upward motion coherent while avoiding identical trajectories. Steam should emerge through the separation/drying region and occupy the pipe volume, rather than look like wires gathering at a single glowing point. Treat these as designed process illustrations.

### 6. Connect piping before sending flow through it

During the heat-to-turbine transition, warm paths extend into empty space while a detached bent pipe approaches from the right. This visibly breaks the process story. Finish the steam nozzle and pipe connection, hold the endpoint in view, then allow the first luminous packet to travel through it. Let the camera follow that packet toward the turbine. Apply the same sequence to condenser exhaust and water return.

### 7. Rebuild the turbine silhouette from a chosen reference drawing

The present rotor resembles progressively larger bicycle wheels or fan discs on a bright shaft. Identical exposed outer rings dominate the blade geometry, and the inlet appears to terminate at the shaft. Use fewer clearly differentiated stage groups, a substantial rotor hub, convincing blade chord/twist, and part of the casing with an identifiable steam inlet. Keep the exposed rotor as a reveal, but provide enough casing, bearings, and stationary structure to explain how steam drives it. Reduce the white shaft glare.

### 8. Make the condenser and generator recognizable by their construction

The generator is a copper barrel encircled by external hoops; the condenser is an open tray containing roughly a dozen parallel sticks. Neither conveys its function. Show the generator as a cutaway stator around a rotor, with one restrained copper winding detail. Give the condenser a substantial shell, dense tube bundles, end waterboxes, a lower hotwell, and a clear exhaust connection. Show cooling water inside the tubes and condensate collecting outside them. The current exhaust appears to descend from the shaft/generator region, weakening the connection to turbine steam flow.

### 9. Establish material and lighting hierarchy, then simplify the final composition

Blue-grey gloss currently covers pellets, rods, vessel, pipes, and turbine; repeated gold-white edge blooms compete for attention. Differentiate rough dark ceramic, satin cladding, heavier vessel steel, and limited copper. Use broad soft lighting to reveal curved surfaces, with smaller highlights only at the focal component. In the final pullback, the plant becomes too small for the fluid story to survive: enlarge the overall composition, reduce residual core glow, and emphasize the connected steam, condensate, and cooling-water routes sequentially.

## Preserve

- Pellet arrival, stacking rhythm, close framing, and tactile bevels.
- Sparse typography and generous black space.
- Scroll reversibility and chapter navigation.
- Fine recorded neutron paths—the irregular trajectories have more specificity and character than the generic thermal lines.
- The ambition to follow one continuous physical chain from fuel to useful shaft motion and returning water.

---

## Post-revision independent Astra review — 2026-09-17

### Scope and verdict

Inspected the first implementation revision in a fresh Chrome tab, including the preserved pellet opening, held assembly view, control-blade transition, vessel, local boiling, turbine, and condenser. Reloaded for asset revision `review5` before assessing the revised heat, turbine coupling, and condenser close-up. This is a visual review of that intermediate revision; later edits may resolve these observations. No implementation files were changed by the reviewer.

The hardware now looks substantially more intentional. The single assembly has a recognizable handle and end fittings; the sectioned vessel supports its internals; the turbine has a casing and convincing blade density; the enclosed generator and dense condenser bundle read as actual machines. The pellet opening remains visually intact. The previous glowing-fiber thermal effect is gone, which is an improvement.

**The main remaining weakness is process visibility.** The film now communicates hardware more successfully than it communicates control-blade insertion, boiling becoming steam, steam doing work, or condensation becoming returning water. More geometry is not the highest-value next step; the important events need clear framing and selective contrast.

### 1. High priority: make the control blade visible at its own chapter stop

At the observed `#blades` stop, the image is a complete opaque 3×3 assembly block from above. Handles and top grids are legible, but the cruciform blade is not. Just before this stop, the moving assemblies fill and exceed the frame while the blade extends below the bottom edge. This repeats the original problem in a different form: the correct object may exist, but the viewer cannot identify its function.

Hold a wider and slightly lower insertion view while the blade is partly exposed below four surrounding bundles. Either section one foreground channel deliberately or use a short elevated detail that shows the cross-shaped gap. Give the blade a distinct satin finish and a restrained rim highlight. The chapter target should land on this explanatory state, not after the blade has disappeared between opaque channels.

### 2. High priority: preserve process visibility beyond the local boiling shot

At the revised local heat view, roughly three warm foreground rods carry delicate hollow bubble rings. Their placement is more credible than the former uniform pink block. However, the full viewport is a wall of many rods, and the water motion is very faint. After the camera widens, the boiling and thermal cues almost disappear. At the turbine and condenser close-ups, the strongest impression is grey stationary hardware; steam, cooling water, and returning condensate are difficult to follow.

Keep the restrained particle style, but improve local contrast and scale. Darken the hardware immediately behind the active route, use a few brighter leading packets with short soft trails, and keep enough bubble population visible during the widening shot to connect the local event to the vessel. Do not restore the dense luminous hair effect. One route should be visually dominant at a time.

### 3. High priority: give condensation and cooling water an observable event

The condenser's dense parallel tube bundle is a clear improvement over the original tray of sticks. But the hotwell is an opaque grey block, and the selected front view does not clearly expose the cooling-water inlet and outlet. A viewer sees a heat exchanger without seeing what changes inside it.

Show a small amount of steam entering from the exhaust hood, diminishing around the tube bundle, with droplets or a shallow condensate pool collecting below. Reveal a section of the hotwell. Frame both cooling-water connections and distinguish their path through the tubes from condensate outside the tubes. This can remain diagrammatic; the sequence needs readable cause and effect rather than more simulation detail.

### 4. Medium priority: give the local boiling close-up a clearer focal group

The heat shot fills almost the entire screen with similarly lit, vertically cropped rods. Warmth on the central group is subtle enough to resemble a lighting change. The bubbles are recognizable when inspected, but the image lacks a strong focal boundary.

Use fewer dominant foreground rods, a slightly oblique angle that opens a visible water gap, and darker neighboring rods. Hold the camera while bubbles visibly emerge and rise before pulling back. A modest increase in local warmth and bubble edge contrast is preferable to raising the brightness of the whole core.

### 5. Medium priority: let the Water chapter show water

The sectioned vessel, separator support, and lower drive structures make the vessel more credible. In the observed `#water` views, however, opaque channels and metal internals dominate; the liquid itself is not a clear visual event. The chapter label promises something that the image only weakly delivers.

Show the water occupying the lower plenum and annular region with a restrained volume tint or a few coherent moving traces. Keep the core channels opaque where useful, but choose the section so the route around and into the core remains visible. Maintain the distinction between a designed explanatory water cue and a quantitative flow field.

### 6. Medium priority: resolve the isolated pipe-flange appearance near the pump

In the condenser close-up, a circular flange appears to float above the condensate pipe near the pump. The pipe section and the flange do not read as one connected fitting. This may be a section-plane artifact rather than disconnected geometry, but the visual result is the same.

Apply a consistent section treatment to the flange and its pipe, or move the cutaway to preserve the complete fitting. The same review should check other pipe openings and component joins at the actual chapter camera angles.

### 7. Medium priority: reduce the turbine's repeated fishbone silhouette

The turbine is much more credible than the original wheel stack, and the revised shaft visibly reaches the generator coupling. Its many nearly identical bright twisted rows nevertheless produce a dense repeating fishbone pattern. The stationary structure is difficult to distinguish from moving blades at a glance, and the casing hoops compete with the stages.

Keep the current overall machine and casing direction. Strengthen the tonal distinction between stationary guide rows, rotor blades, and the inner casing. Show a small number of stage groups clearly rather than giving every blade edge equal contrast. Retain enough casing to explain the inlet and exhaust route without obscuring the rotor.

### 8. Polish: recover cinematic material hierarchy without returning to excessive glow

Removing pervasive bloom has helped credibility, but some wide views now resemble a uniformly lit grey CAD assembly. The condenser tubes, turbine blades, foundations, and pipework compete at similar brightness. The held single assembly is clear but very slender within a large empty frame.

Use a broad directional key and quieter fill to prioritize the active component, keeping structural supports darker. Preserve restrained warm highlights and separate ceramic, cladding, heavy steel, and copper by roughness as well as color. A short closer assembly detail can complement the full-height held shot without losing the clear overall silhouette.

### Preserve from this revision

- The pellet framing, stacking rhythm, bevels, and subdued warm edge highlights.
- A completed single bundle shown before the whole core.
- Handles, end fittings, and supported vessel internals.
- The opaque, deliberately sectioned vessel direction.
- Local surface-originating bubbles and the removal of the uniform pink core/fiber-optic effect.
- Connected external piping before flow is introduced.
- The turbine casing, enclosed generator, substantial exhaust connection, and dense condenser tube bundle.
- The minimal interface and reversible scroll structure.

### Review limitation

During later checks, the active rendered chapter changed unexpectedly between observations, possibly due to concurrent browser interaction. The findings above rely on directly observed component views and transitions; no final-scroll navigation defect is asserted from that ambiguous behavior. A final visual pass should use an uncontested browser session after the implementation stops changing.
