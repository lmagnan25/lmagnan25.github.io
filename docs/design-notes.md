# Design notes

## Version 3.0 — September 27, 2026

- The notebook layout evolved into name and navigation, reactor film, short
  introduction, one freely floating field, existing photo gallery, CV link.
  Loïc requested removing the Projects and Research navigation and allowing
  all bubbles to move together without separate category rows.
- Motion follows a slow lava-lamp direction: low drift speeds, spring contact,
  shared boundaries that bend without crossing, and a lingering wobble. The
  separate Pause motion button was removed at Loïc’s request. Hover/focus
  still holds a target, and reduced-motion preferences use the static layout.
- The approved introduction is “Chasing hard problems with AI.”
- Projects are no longer a tab beside photography. Each draft project/research
  label sits inside an organic, softly colored bubble. Clicking it expands the
  same shape within the page to hold description text and images.
- All five entries now use user-supplied descriptions and figures. Preserve
  his full sentences, correcting spelling and grammar without adding claims.
- The CV lives on `cv.html`, reached through CV links. No embedded resume on
  the homepage. Preserve the existing film, gallery and earlier versions.
- Native disclosures support keyboard activation; Escape closes the focused
  open bubble. One bubble opens at once. Reduced-motion mode uses a static
  grid and skips the morph animation. Expanded content stays in normal flow
  with images stacking vertically on phones.
- Loïc requested publishing this revision on September 27, 2026.
- Taurus now includes Loïc's co-developer credit, his supplied project bullets
  and three screenshots (valuation, trade timing, screening). The wording
  "cash-settled puts" was explicitly confirmed. Screenshots keep their full
  aspect ratios and open in a separate viewer group from the photo gallery.
  Preserve the user-approved bubble renderer while adding project content.
- ATLAS uses Loïc's three full sentences with spelling/grammar fixes. Its
  gallery uses his two selected images: radiation analysis first, followed by
  a 3D facility model. They replace the earlier megafolder selections; original
  paths are recorded in `assets/projects/atlas/SOURCE.md`. The Next project
  placeholder was removed. Developer is capitalized in the project credits.
- NTP includes Loïc's co-authorship description and NETS 2026 presentation,
  with a link to the ResearchGate paper. The study overview is the main figure,
  followed by dose analysis and a coolant-channel diagram. Original supplied
  screenshots are preserved, with paths in `assets/projects/ntp/SOURCE.md`.
- ADS credits his FLUKA high-energy simulations and ongoing burnup assistance
  in Professor Kozlowski's group. His heat-generation screenshot is the main
  image; neutron-source and lead-based system design figures were extracted
  from the supplied research poster. The bottom-right burnup plot was removed.
- Agentic System Research describes the collaboration with Ian Burges and Matt Burges
  at Ascendance Foundry. It includes the supplied error propagation diagram,
  native MathML equations, and definitions for e, m and five rate coefficients.
  The pasted rate symbols were missing; α, β, γ, δ, ε label the five rates in
  the supplied order following the clarification in the chat.
- Latest bubble direction: digital, delicate, pale color concentrated at the
  outer rim, with clear centers. The photographic/chrome approach was rejected.
  The renderer now calculates a new contour and its thin-film rim each frame;
  it never stretches an image to make the expanded surface.
- Each bubble has its own size, color phase, spin direction, and spring motion.
  Shape growth leads content opacity; text and image slots are normal HTML and
  never scaled. Open bubbles become softly squared organic reading spaces.
  The added motion layer moves whole closed bubbles. Soft contacts flatten
  the membrane at a shared plane and create a small bulge beside the contact.
  Preserve the approved iridescent material and keep expanded content steady.
- Sources, implementation rationale, and the visual audit are recorded in
  `docs/bubble-rendering.md`. The earlier photographic experiment is retained
  only in the ignored local `tmp/bubble-iterations/` directory.

## Version 2.3 — clean neutron ending

- Fade the grid with the vessel; do not let it linger with the particles.
- Remove the water-level animation from the film.
- Fix the intermittent black blocks during the neutron close-up. Keep the
  recorded tracks, camera arc and established pacing unchanged.

## Version 2.2 — smoother entrances

- Fade arriving hardware in gradually along its existing motion. Avoid sudden
  visibility switches and bright overlaps from transparent metal.
- Preserve the accepted pace, camera arc, assembled vessel dissolve and close-up.
- Publish the completed portfolio to the existing website. Keep previous versions
  and original source photos in local backups.

## Version 2.1 — film refinement

- Double the speed of slow mechanical assembly. Remove the oversized spacer
  grids shrinking into place; keep their dimensions fixed during seating.
- Keep the completed vessel assembled, then dissolve it cleanly into transport.
  No blade withdrawal or disassembly during that transition.
- Move close to the neutron paths and show quiet grid lines tied to actual fuel
  lattice geometry. Preserve recorded tracks and the model's spatial scale.
- Independently audit component positions, pacing and the overall arc. Keep
  optional ideas for impact and cleanliness separate for discussion with Loïc.

## Version 2.0 — current direction

- Replace scroll-driven animation on the homepage with an actual silent reactor
  video. Use about two-thirds of the first screen for the film, with
  **Loïc Magnan - Engineer** above it.
- Keep the dark palette, quiet typography and plain navigation. The film has a
  small Play/Pause control and no chapter labels or simulated player furniture.
- Scroll naturally into the selected CV, presented as a white printed page.
  It links to the unchanged PDF for zooming and printing.
- Below the CV, use two tabs: **Photography** and **Projects**. Keep the nine
  selected photographs and existing viewer. Projects stays empty until supplied.
- Preserve the entire reviewed 1.1 scroll experience in `versions/1.1/` and in
  a separate ZIP. Version 1.0 also stays intact.
- The 32-second film uses the same modeled scene and recorded neutron paths.
  Its clock is an editorial presentation, not physical elapsed reactor time.

The notes below record earlier decisions and the preserved scroll version.

## Direction from Loïc

- Keep the website minimal and dark.
- Home contains only **Loïc Magnan - Engineer**, plus the four navigation links.
- Navigation: Home, Projects, CV, Photography.
- Keep Projects empty until Loïc supplies finished project content. Ideas can stay in notes.
- Use the selected `Desktop/Resume_Loic_Magnan.pdf` for the CV download.
- Photography stands alone: no visible counts, numbers, captions, copyright footer, or filler copy.
- Exclude `IMG_0425`, the dog photograph. Keep the original file on disk.
- Use quiet typography and spacing. Avoid template slogans, decorative badges, stock cards, and autogenerated biography text.
- Keep the reactor experiment in **reactor.html** until its direction is settled.

## Reactor film

The reference is Loïc's `neutronics_viewer (2).html`: transparent machinery,
small luminous paths, and a sense of depth. The current direction is a **BWR**,
so its lead-cooled geometry and neutron event are not used in the new demo.

The current scroll sequence:

1. Fuel pellets arrive from outside the frame and form a stack.
2. Rods, channels, spacer frames and neighboring assemblies come together.
3. Control blades and vessel internals arrive naturally; no assembly moves aside.
4. The filled vessel changes into a restrained radiograph of the same geometry.
5. Recorded neutron paths move inside it, with soft heads, short connected trails
   and an energy palette informed by Loïc's own viewer.
6. The vessel fades first, then the neutrons fade. **CV, Projects and Photography**
   appear in a centered column occupying the cleared scene.

## Current aesthetic decisions — September 17, 2026

- Preserve the loved pellet opening. Finish neighboring bundles together and
  keep them seated; remove the front-bundle excursion for the control blade.
- Remove CFD, boiling, steam, turbine and whole-core heat-map chapters from the
  active experience. The GPU question is no longer relevant to this pass.
- Treat the hologram as a radiograph of selected actual modeled parts. Vessel,
  heads, flanges, core supports and assembly boundaries provide spatial context.
  No scan bars, random grids, floating data, generic HUD or arbitrary glow.
- Keep the transport volume clearer than the enclosing hardware. Use a steady
  three-quarter camera so changes in a history can be read.
- Bring the particles closer to the reference: soft additive cores, cool-to-warm
  energy colors, and visible short trails along recorded segments. All 6,004
  histories remain available over the sequence; only a few hundred are visible
  together. No accumulated web of every complete trajectory.
- Give different materials different finishes. The vessel is matte, rods have
  softer highlights, and flanges are more machined. Do not invent wear or add
  fine detail that has no structural purpose to disguise procedural geometry.
- Keep the typography, transitions and ending restrained. Three simple links;
  no additional slogan or decorative counts.
- The fresh independent aesthetic review is `adversarial-review-neutronics.md`.
  Earlier review reports describe superseded versions and remain historical.

## Pacing update

- Advance the existing scene 1.5× faster per unit of native scroll.
- Additionally reduce the neutron interval to one-third of its prior length.
- Preserve native scrolling and chapter anchors; do not intercept wheel events.
- Keep the three ending phases separate: vessel out, particles out, links in.
- Position the ending links in the former reactor/particle footprint on both
  desktop and mobile.

## Scientific boundary

The neutron histories are actual OpenMC output for the documented small BWR
teaching geometry. Color represents recorded energy; size, brightness and
presentation timing aid visibility. Neutrons are not literally visible glowing
objects, and the radiograph is an illustrative context layer. Do not imply that
this is a critical commercial plant or an operating power transient.

## Version 1.1 — pellet and vessel refinement

- Preserve the accepted 1.0 as a complete, separately playable snapshot and
  portable backup. Changes after that baseline belong to 1.1.
- Keep the flow, pacing and composition Loïc already likes. Concentrate on
  ceramic pellet surfaces and credible vessel construction.
- Pellets should read as dark sintered ceramic: shallow dished ends, narrow
  chamfers and soft reflections, without invented damage or large texture noise.
- Give the removable upper head a substantial mating flange and closure studs.
  The lower head is integral, with a restrained weld seam rather than a second
  bolted closure. Use a few hollow upper-wall nozzle stubs for useful silhouette.
- Keep all active model dimensions and neutron data unchanged. Pellet end
  details and vessel hardware are illustrative, not new transport calculations.
- The fresh Astra critique and rendered recheck are in
  [visual-review-v1.1.md](visual-review-v1.1.md).

## Parked work

`bwr-channel.js`, `bwr-steam.js`, `bwr-fields.js`, `bwr-thermal.js`, their data,
and the separate GPU probe remain on disk as prior experiments. They are not
imported by the current demo. Reintroduce them only if Loïc explicitly reopens
that direction. The original CFD and GPU questions are superseded.

The separate reactor experiment can be integrated into the homepage after its
visual direction is settled. Projects remains empty until content is supplied.
