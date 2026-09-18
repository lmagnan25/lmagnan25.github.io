# Independent channel model review

Date: 17 September 2026. Source-only review of `scripts/generate_channel_field.py` and `bwr-fields.js`; no browser inspection or implementation changes. This records the model before the proposed interior-subchannel revision.

## Verdict

Replace the artificial four-rod enclosure with one interior subchannel. Retain the reduced fully developed axial-flow and thermal-entry calculation. This is a credible, bounded improvement; it does not constitute operating-condition BWR or multiphase CFD.

## Current defects

1. **Artificial outer walls:** The existing two-pitch-wide domain contains four complete rods and imposes no-slip on its square exterior. This creates duct-wall boundary layers that do not represent an interior lattice passage.
2. **Competing scalar surfaces:** Two intersecting longitudinal planes, a transverse plane, and a rectangular cage obscure the central water passage and suggest a physical enclosure.
3. **Limited tracer fidelity:** Tracers use computed axial speed, but nearest-cell sampling quantizes it, `speed > .05` suppresses near-wall motion, and temperature-colored strokes compete with the scalar display.
4. **Overstated numerical evidence:** A staircase rod mask is not second-order geometry merely because a boundary flux assumes a half-cell distance. The current energy residual largely re-evaluates the solved equation; the two-grid absolute temperature tolerance alone is weak evidence of accuracy.
5. **Mixed phase-transition language:** Temperature planes, tracer color, and boiling legend change at different presentation thresholds. Their overlap can suggest that the single-phase calculation predicts nucleation.
6. **Hardcoded display dimensions:** Texture coordinates, planes, cage, and tracer seeding assume a 3.26 cm domain. Updating only the solver would display the new field on the wrong physical scale.

## Proposed model

- Square domain: `x/P, y/P ∈ [-0.5, 0.5]`, with pitch `P = 1.63 cm`.
- Four quarter rods centered at the corners; radius `0.61 cm`.
- Rod arcs: no-slip axial velocity `u = 0`; fixed normalized wall temperature `theta = 1`.
- Open square-side segments: symmetry, `du/dn = 0` and `dtheta/dn = 0`; these are computational boundaries, not walls.
- Inlet: `theta = 0`.
- Solve the axial momentum Poisson equation and normalize area-mean axial velocity to one. March the steady thermal-entry equation using implicit transverse diffusion.
- Define `Pe = mean_velocity × pitch / thermal_diffusivity`. A chosen `Pe = 80` and six-pitch length remain illustrative dimensionless parameters, not BWR operating conditions.
- State assumptions: identical uniformly heated rods; laminar, steady, fully developed axial flow; constant properties; no transverse flow, turbulence, boiling, latent heat, conjugate fuel conduction, or neutron/thermal feedback.

The symmetry treatment follows the distinction between symmetry and wall conditions described in the official [OpenFOAM boundary-condition tutorial](https://www.openfoam.com/documentation/tutorial-guide/2-incompressible-flow/2.2-flow-around-a-cylinder). Its applicability here depends on the stated symmetric lattice assumptions.

## Required rendering contract

Read bounds, rod centers/radius, and axial extent from metadata. The new computational width is **1.63 cm**, while the surrounding full rod surfaces may remain visible as context outside that square.

Prefer one readable longitudinal temperature section, with an optional restrained transverse section. Use stable neutral tracers with bilinearly sampled axial velocity; preserve visible slow near-wall and faster central motion. Do not invent lateral eddies for a purely axial solution. Restrict tracers and scalar samples to the actual fluid domain.

Fade the computed temperature display and scale before introducing clearly labeled illustrated bubble growth/departure. Bubble nucleation, size, and rise are not outputs of this solver. Preserve spatial continuity as bubbles rise toward the vessel steam space and outlet.

## Verification requirements

- Compare three transverse resolutions and refine axial spacing separately.
- Report outlet mixed-mean temperature, peak/mean velocity, represented fluid area, and integrated rod-wall heat input, together with their convergence changes.
- Verify positive fluid velocity, symmetric fields, `0 ≤ theta ≤ 1`, and monotonic bulk heating.
- Compare integrated rod-wall heat input with axial enthalpy rise; distinguish conservation/solver checks from physical validation.
- Describe the actual staircase boundary approximation and avoid unsupported second-order geometry claims.
- Verify metadata-to-world dimensions, texture sampling, masks, and tracer locations against the new pitch-sized domain.
- Inspect forward and reverse handoffs, including scalar disappearance before the illustrated bubble phase, after implementation.

## Review status

Recommendations delivered. The subsequent implementation uses `bwr-channel.js` and the revised `scripts/generate_channel_field.py`: pitch-sized quarter-rod domain, symmetry sides, metadata-driven dimensions, one longitudinal section, bilinear neutral tracers, and separate illustration timing. Three transverse resolutions and a separate axial refinement are recorded in `assets/bwr/channel.json`. Transverse convergence is nonmonotonic because of the staircase mask; no order of accuracy is claimed.

This implementation note does not convert the source review into physical validation. The new visual sequence receives a separate review in `adversarial-review-steam.md`.
