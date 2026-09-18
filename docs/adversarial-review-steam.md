# Independent adversarial review — steam3

Date: 2026-09-17. Reviewed the rendered `reactor.html` steam3 sequence in a separate Chrome tab at 1200 × 757 and 390 × 844, including intermediate scroll positions and reverse chapter navigation. Read `bwr-channel.js`, `bwr-steam.js`, the channel generator and metadata, and `docs/channel-review-astra.md`. No implementation changes made by this reviewer.

## Verdict

The simplified sequence is coherent and substantially stronger: restrained neutronics, one legible interior passage, distinct illustrated bubbles, and a clean ending. The channel model is honestly described. Two visible continuity defects still prevent calling this pass finished. These findings describe steam3 before the subsequent camera and mist fixes; they require targeted rechecking, not another general redesign.

## Ranked findings

### P1 — The fluid disappears before the outlet, breaking the main narrative

At scroll progress **0.84901**, separator/dryer hardware dominates and the steam route is not visually readable. At the **Steam anchor, 0.89799**, the cutaway outlet pipe is attractive but appears essentially empty; the only obvious puff is down near the separator. A tiny outlet puff appears around **0.92797**, followed by two large, dense, forked plumes at **0.95297**. The visible story therefore jumps from bubbles to empty hardware to an abrupt outlet effect, rather than following steam through the vessel and pipe.

The same empty-pipe impression is present on mobile. This is a visibility/continuity failure, not a demand for physically solved steam. Make a restrained, continuous moving cohort readable through the separator, steam space and pipe, and let the final dissolution grow from that cohort. Recheck these exact positions and intermediate scrolling in both directions. Source contains mist particles along the route, but their existence in data does not establish that the viewer can see them; occlusion and particle contrast need inspection.

### P2 — Camera loses the departing bubble cohort

Near **0.78151**, the leading bubbles reach or cross the top of the viewport while the camera remains focused lower on the rod passage. By **0.80400**, the cohort reappears much smaller beneath large separator hardware. This weakens the requested experience of following bubbles upward. Track the cohort's rise continuously and maintain enough framing overlap to connect the passage to the separator. Recheck 0.75–0.84 forward and backward. The main implementer reported a subsequent camera fix; this review has not yet verified it.

## Passed visual and interaction checks

- **Assembly:** intermediate arrival around 0.23–0.25 and assembled anchor around 0.26 show coordinated arrival, with no conspicuously late final bundle. The later deliberate front-bundle move for the control-blade view is distinguishable from assembly lag.
- **Neutronics:** restrained dots, no distracting trail web. No active core heating map or turbine/condenser detour.
- **Channel:** isolated rods replace the full core before the scalar becomes the focus. One longitudinal scalar plane and a small transverse section communicate the inspected passage without the previous stack of slices or enclosing duct. Tracers are very subtle, but that is further polish rather than a blocker.
- **Boiling:** bubbles are readable at the surface-boiling anchor, and temperature colors disappear before the illustrated bubble phase. The visible legend explicitly identifies illustrated growth and departure.
- **Reverse:** returning from the ending to boiling and then channel restores the appropriate bubbles/scalar and legends, without residual outlet effects or navigation links.
- **Ending:** CV and Photography are clear and restrained on desktop; the stacked mobile layout is fully visible and readable.
- **Mobile:** channel, steam anchor and ending fit at 390 × 844 without apparent horizontal overflow or legend/model collision. This was a targeted sanity check, not exhaustive device testing.
- **Console:** no warnings/errors returned in the checked browser log. This review did not separately benchmark frame rate or idle rendering.

## Scientific/source assessment

The current field represents a **reduced, single-phase, fully developed axial laminar velocity model with thermal entry**, not BWR operating-condition multiphase CFD. The pitch-sized computational domain has quarter-rod solids at its corners, no-slip velocity and fixed normalized heated-wall temperature on rod interfaces, and zero-normal-gradient symmetry conditions on open sides. The render uses the matching pitch/radius/length metadata. Neutral axial tracers use bilinear sampling of the computed velocity; they do not imply a solved secondary circulation.

The scalar legend uses inlet/heated-wall endpoints. The About text distinguishes recorded OpenMC paths, reduced liquid heat transport, illustrated bubbles/steam, and the final visual transition. The equal-density GPU droplet feasibility probe remains separate and is not presented as water/steam channel output. These are appropriate and necessary distinctions, and the visible/source labeling passes this audit.

The generator checks positivity, temperature bounds and monotonic heating, symmetry, and independently accumulated wall-heat/enthalpy balance. At 80 transverse cells, fluid-area error is about 0.338%; the 192→384 axial refinement changes outlet mean temperature by about 0.000530. The 40/64/80 transverse sequence is nonmonotonic because of the staircase rod boundary, so it supports a bounded sensitivity statement rather than a demonstrated convergence order. This limitation is now acknowledged in the model documentation. These checks establish internal numerical consistency and limited resolution sensitivity; they do not constitute experimental validation or wall-boiling prediction.

## Handoff

Review tab: 118731093, browser 1. Main QA tab 118731092 was not operated. Mobile viewport was reset to desktop before releasing CUA. Screenshots were inspected in tool output; no standalone image files were saved. The precise progress values above are the reproduction coordinates.
