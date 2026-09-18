# Neutronics aesthetic review — source/reference pass

## Final narrow recheck — ray3: passed

Both ray2 fix requests are closed. At literal p=0, several central pellets now frame the title without obscuring it. During neutronics, the actual separator barrels, standpipes, deck, and dryers appear at a restrained gain below the particle/core hierarchy; the upper vessel no longer reads as empty. At 390×844, the enlarged scene occupies about 60% of the screen height with no clipping and clearer trajectories.

Ending samples at p≈.803, .875, .918, and .950 show a coherent progression: remaining neutrons disappear, reactor context dims toward black, then the three links fade in without a geometry jump. No blocker remains from this review. Projects is intentionally empty by explicit user instruction and is not a defect. Temporary viewport reset and CUA released after review.

## Rendered review — ray2 (findings closed by ray3)

Reviewed independently in Chrome at desktop 1200×757 and mobile 390×844. Inspected opening, fuel anchor, assembled bundles, solid reactor, dissolution around p=.446, particle states p=.625 and p=.696, reverse navigation, and the final links. Console returned no errors or warnings. No implementation edits. Temporary mobile viewport was reset afterward.

**Verdict:** the narrowed scene is substantially stronger. Actual angular paths now read clearly instead of dust. Approximately 450–460 visible heads maintain controlled density; their fine trails convey scattering without becoming a hairball. Particle marks are brighter than the reactor context, and the background stays quiet. The ghost contains recognizable core geometry and avoids arbitrary HUD decoration. The solid-to-transparent transition remains coherent. The three-link ending is clean on mobile.

### Original ray2 fixes — now closed

1. **Opening is blank at literal p=0.** Reproduced on fresh load and again via Home after reverse navigation, with `ready=true`, advancing render count, and no console errors. The fuel anchor later displays the liked shiny pellet stack correctly. Main confirmed inherited initial scatter puts every pellet outside the initial view; make a few central pellets visible beside the title while preserving the existing trajectory and timing.
2. **The upper vessel currently reads as an empty vial.** Its upper third is entirely empty during neutronics, although the preceding solid reactor contains recognizable separator hardware there. Keep a very faint real separator deck and standpipes/barrels. Their brightness must remain below core footprints and particle trails. Main agreed to this adjustment. Do not fill the gap with invented rings or diagrams.

### Minor observations

- At 390×844 the scene fits and the core is not cropped, but it uses only about half the screen height. A modest increase toward 60% would improve trace readability. This is optional; current mobile composition is usable and uncluttered.
- The assembled square channels remain austere and repetitive, but the visible repetition has engineering purpose. Do not disturb the liked opening to chase surface complexity.
- The particle plot is predominantly cool blue with occasional warmer segments. This is visually restrained and does not require increasing saturation globally.
- Ending links resolve to CV, Projects, and Photography. CV and Photography show their expected content. Projects currently shows navigation and an empty main region; this may be an intended placeholder outside this reactor pass.

The earlier source critique below is retained as rationale. Its description of the original sparse trails and missing structure does not describe ray2.

Scope: preserve the existing pellet and assembly opening; remove the assembly sidestep/control-blade detour and all CFD, boiling, and steam; finish with a restrained reactor radiograph, recorded neutron tracks, and the three destination links: CV, Projects, and Photography. This review is based on source inspection, not a rendered verdict. No implementation was edited.

## Priority 1 — restore the identity of a particle history

The current scene's main visual problem is a mismatch between dots and paths. `reactor.js` admits heads for all 6,004 histories, but gives a trail to only every sixtieth history. Its trails decay with a .006 clock constant and disappear entirely at .026. Nearly every visible head consequently appears unattached to a history. The subdued gray-to-beige ramp, normal alpha blending, and 1.4–3.8-pixel point clamp further suppress the distinctions. The likely result is airborne dust or static noise, despite using genuine coordinates.

The reference's recognizable signature is soft, additive energy-colored heads joined to fine angular tracks. It renders every history's segments, not a separate tiny sample of trails. Its default recent-trail constant is .09 of event time, with a second .1-span persistence term. Heads have a modest bright core and a soft perimeter, not an outlined ring or a 3D sphere. See reference lines 637–717 and 770–780.

Concrete direction:

- Control concurrency and make heads and trails correspond. The reference uses 356–886 histories per event, whereas this export has 6,004 independent sources. A curated 300–600-history subset is one valid starting point; the implementation direction is instead to retain all histories and stagger lifetimes to roughly 500–900 active at once. Keep the same per-history visibility logic for heads and tails and prevent persistence from accumulating thousands of completed tracks.
- Restore an energy ramp with distinct cool blue, pale neutral, and muted warm red. A restrained website does not require removing the data's color information. Let only the particle heads approach white.
- Use additive soft radial cores around 3–5 CSS pixels at the intended framing, with a smaller luminous center and smoothly vanishing edge. Avoid wide bloom halos, hard beads, rings, or comet-shaped billboards.
- Start trail tuning near a .025–.05 global display-clock decay (roughly 4–8 times current .006), plus a much fainter longer term. The exact value must be judged against visible turns and density; do not blindly copy the reference because the local playback normalizes each history's duration.
- Preserve all measured vertices in displayed histories. Scattering corners, mixed step lengths, and changes of speed provide the scientific identity. Do not replace these with smooth random curves.
- Current parent indices are all -1. The reference's fission-birth flash uses real genealogy. Do not invent connected generations or flash every independent source as a fission event.

## Priority 2 — a reactor radiograph must contain the reactor

The current `ghost` in `bwr-scene.js` is a single open cylinder with Fresnel gain .025. This is simultaneously too generic and too faint: the full PBR machine dissolves, leaving two possible cylinder edges and disconnected assembly footprints. It lacks the reference's structural silhouette. Reference lines 539–610 ghost selected actual vessel parts, suppress occluding internals, and retain a small number of core boundary cues.

Use an intentionally selected version of the same reactor geometry the visitor just saw:

- Vessel wall silhouette and domed ends establish the enclosure. Keep a few actual flange rims and the shroud boundary; retain at least one recognizable transition between upper vessel and active core.
- Assembly top/bottom footprints and a small number of vertical corners establish the active lattice. The nine square channels should be recognizable without drawing all 576 rods or every triangle edge.
- Give core boundaries and vessel boundaries different strengths: core footprint most readable, major vessel silhouette next, minor internals barely present. A useful starting relationship is 1 : .55 : .15, then render-tune.
- Use a low-gain unlit Fresnel surface together with selected engineering edges. Fresnel alone can erase face-on features; uniform wireframe alone turns the object into a tangled CAD preview.
- Color should be gray-blue with muted saturation. No scan plane, orbiting data rings, rotating grids, arbitrary tick marks, animated noise, labels, or sci-fi HUD garnish. Every visible line should correspond to a real feature or active-core boundary.
- Avoid applying equal-brightness additive x-ray material to every repeated bolt, ring, rod, and separator. Transparent overlaps accumulate into luminous knots, especially at the top and bottom. Simplify by omission and hierarchy, not by globally reducing brightness until everything disappears.

## Priority 3 — quiet camera and enough screen area

The present neutron interval lasts only p=.418–.568 and drives radius from about 330 to 55 while changing target and angle. The visitor must decode the particle motion while the entire coordinate frame changes dramatically. Later shot definitions exist to follow bubbles and steam, so deleting their models while leaving their camera path would retain a purposeless tour.

After the loved assembly opening, allow a brief settled whole-core view, then a clear material-to-radiograph transition. Hold a three-quarter composition through most of the particle interval. A small forward drift is sufficient. Keep the full active height readable and enough vessel silhouette in frame to identify the context; avoid extreme foreshortening of the top lattice. Aim initially for about 60–70% viewport height for the active scene, then check desktop and mobile. Let the final camera settle before the three links appear.

The current implementation renders only on scroll, so a still visitor sees frozen dots. If retaining that interaction, tracks need sufficient length to communicate transport in one frame. If 'flying' is intended to continue while the visitor holds the view, run a small gated animation loop only during the neutron chapter, stop offscreen, and respect reduced motion. Do not continuously orbit as compensation for weak particle motion.

## Priority 4 — protect the opening; avoid procedural-CAD tells later

The opening's bright studio panels and metal contrast are part of the liked experience. Do not flatten or restyle them globally to repair the hologram. Switch materials/lighting deliberately after assembly.

The repeated rods and square lattice have real engineering purpose and should remain regular. The generic appearance arises when every piece receives the same metal response and contrast, every ring is equally conspicuous, or decorative geometry is added without functional shape. The later solid vessel currently inherits bright environment panels (intensities 4, 2, 3, 1), key 2.2, and fairly smooth metals. Combined with the same tube/torus vocabulary across hardware, this can read as a chrome procedural object.

No complete plant reconstruction is needed. The narrower sequence should expose less illustrative upper hardware, distinguish the few important surfaces through restrained reflectance, and use accurate major silhouettes. Avoid solving the problem with weathering noise, gratuitous bolts, fake seams, or more repeated tubes.

## Required removals

- `assemblyOffset()` currently translates the featured assembly by `reveal*50` on both x/y during p=.278–.326. Remove that excursion completely, along with its camera emphasis.
- Remove active `createChannel` and `createSteam` imports, constructors, update hooks, loads, status branches, camera follow logic, and corresponding chapter/navigation text. A hidden model still leaves dead pacing and avoidable downloads.
- The present water fill and animated radial water shader are also inconsistent with a fully narrowed assembly→neutronics sequence unless the user explicitly retains a water beat. Prefer a clean transition with no extra simulation chapter.
- Remap the remaining sequence across the available scroll distance; do not leave the final half as empty travel.

## Rendered review acceptance criteria

1. Opening still feels like the same liked pellet/assembly sequence.
2. No assembly moves aside; no controls/CFD/boiling/steam chapter survives.
3. A paused neutron frame reads as recorded transport, not dust, a starfield, or a hairball.
4. Particle heads are brighter than trails; trails are brighter than reactor context; enough structure remains to identify a reactor and its active core.
5. No arbitrary holographic decoration; visible structure derives from the reactor.
6. Camera holds long enough to follow trajectories and stays coherent when scrolling backward.
7. Desktop and mobile preserve hierarchy without clipped core ends or dots collapsing below useful size.
8. Ending is quiet and contains CV, Projects, and Photography links.
