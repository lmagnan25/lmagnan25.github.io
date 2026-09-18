# Independent visual review — 1.1 priorities

Reviewed the frozen `versions/1.0/reactor.html` in Chrome at the opening, close pellet stack, Reactor chapter arrival, and seated vessel. Also read baseline `bwr-scene.js`, `bwr-hardware.js`, and `bwr-radiograph.js`. No baseline or implementation files changed during this review.

## Preserve

Keep the restrained black composition, camera journey, chapter order, timing, assembly choreography, core dimensions, recorded neutron positions, and final vessel → neutron → portfolio fade order. The existing core/internals density is sufficient. Improve the two requested objects through surface and construction cues, without additional systems or visual noise.

## Priorities

1. **Give pellets a ceramic material response.** In the opening and stack view they currently read as machined blue steel: a continuous narrow vertical reflection and bright rims dominate each cylinder. Use dark neutral charcoal, near-zero metalness, and a broader, softer highlight (roughness roughly 0.5–0.65 as a rendering starting point). Keep enough grazing light to separate them from black. Optional very fine, low-amplitude roughness variation should disappear at stack distance; avoid chipped edges, large pores, scratches, or invented wear. UO₂ fuel is sintered ceramic, and NRC fabrication imagery shows black cylinders. These physical facts support the material direction; shader values are visual judgment. [DOE fuel fabrication](https://www.energy.gov/ne/nuclear-fuel-cycle), [NRC fuel-pellet photograph, Figure 8](https://www.nrc.gov/sites/default/files/doc_library/cdn/legacy/materials/fuel-cycle-fac/mox/chemical.pdf).

2. **Refine pellet ends, without changing their envelope.** Keep radius 0.52, height 1.0, instancing, and stack spacing. The current single bevel plus flat end looks like a generic metal slug. A narrow chamfer, flat annular land, and shallow dish make the end more legible in the scattered close view. Use sufficient radial subdivisions to remove faceting, with intentional normals across the land/chamfer rather than smoothing every transition into a rounded capsule. Dish form varies by fuel design; it is a reference-informed illustrative choice, not a requirement for every BWR pellet. [ORNL fuel description](https://www.osti.gov/servlets/purl/5898210).

3. **Make the vessel top closure structurally different from its bottom.** The two matching bright torus belts currently imply two decorative removable lids. Use a solid annular upper mating flange with visible axial depth, a narrow joint seam, and a restrained ring of seated studs/nuts. The lower head should read as integral, with a subtle welded transition rather than the same bolted closure. NRC describes a rounded integral bottom and a removable rounded top held by studs and nuts. [NRC BWR manual, pp. 3-3–3-4](https://www.nrc.gov/sites/default/files/doc_library/cdn/legacy/reading-rm/basic-ref/students/for-educators/03.pdf).

4. **Improve wall/head continuity and cut thickness.** The long shell's exposed edges are almost hairlines at the current view scale, giving a sheet-metal impression. Give the cut surface readable thickness and a slightly lighter, low-gloss response; retain the core clearances and teaching-model footprint. A revolved head profile with a short straight skirt and tangent curved crown will connect more convincingly to that shell. Preserve the current approximate silhouette rather than scaling the active geometry to a commercial reactor. Carry closure hardware with its associated head or shell during arrival, so construction remains coherent throughout the existing animation.

5. **Add only a few meaningful nozzle silhouettes.** Short hollow steam-outlet and feedwater necks at their appropriate upper elevations would identify the shell as a BWR pressure boundary. Keep them outside the cutaway opening, with believable wall thickness and smooth attachment shoulders, and stop at short stubs. No pipe network is necessary. NRC's vessel drawing provides the arrangement; exact numbers and locations remain illustrative here. [NRC BWR manual, p. 3-4](https://www.nrc.gov/sites/default/files/doc_library/cdn/legacy/reading-rm/basic-ref/students/for-educators/03.pdf).

## Integration checks

- The gap at the Reactor chapter anchor is an arrival phase: another 0.2 page of scrolling seats the existing head correctly. Do not mistake it for a static alignment bug or change pacing to hide it.
- Keep the outer shell darker than its internals; use a soft broad reflection and a modest cut-face highlight to explain mass, not brighter chrome everywhere.
- The radiograph currently selects fitting toruses by geometry type. Replacing flanges with lathed/extruded geometry requires updating that selection deliberately so the new closure remains faintly legible during the same transition.
- Review the scattered pellet end, aligned stack, arriving head, seated vessel, and radiograph fade after implementation. No changes to bundles, transport metadata, controls, or portfolio content are warranted.

## Rendered 1.1b recheck

**Recommendation: keep 1.1b. No substantive visual regression found.** This was a narrow independent rendered check of `reactor.html?version=1.1b`, including source inspection of `bwr-surfaces.js` and `bwr-vessel.js`. It is a visual review, not engineering certification of an illustrative vessel.

- **Pellets:** the blue metallic stripe has become a softer charcoal ceramic highlight. The shallow dishes and bearing lands are visible during the approach and mobile stack. Fine texture stays quiet at normal viewing distance. The pieces remain legible against black and retain the original choreography.
- **Vessel:** the paired flat flange reads as an actual top closure; the lower integral head no longer repeats the decorative torus/bolt treatment. The hollow heads, flange depth, small seam, and short nozzle necks create a more convincing pressure-vessel silhouette. The four nozzles remain subordinate to the core. Head/flange arrival stays coherent, and they seat correctly after the existing Reactor anchor.
- **Radiograph:** the revised top flange and nozzle outlines survive into the faint vessel image without obscuring the neutron paths. The vessel disappears while neutron paths remain; the paths then disappear before the CV, Projects, and Photography links appear. No old hardware is left behind.
- **Mobile, 390 × 844:** checked the pellet stack, seated vessel, neutron radiograph, and final links. The vessel and nozzles fit with comfortable side margins, controls remain separate, and all three destination labels fit. The close pellet stack intentionally extends past the top/bottom, as part of the existing zoomed composition.
- **Scope:** no further polishing is required for this release. Keep the frozen 1.0 rollback. Desktop viewport was restored after the mobile check; no implementation source was edited.
