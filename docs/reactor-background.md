# BWR scroll experiment

Open `reactor.html` through the local HTTP server. The experiment remains
separate from the homepage. Scroll assembles the reactor, reveals its neutron
histories, and fades to CV, Projects and Photography. Dots on the right jump
between five chapters. **Fixed camera** holds the view while playback continues;
scrolling backward reverses the sequence.

## Active files

- `reactor.html`, `reactor.css`: minimal page, native scroll and ending links.
- `reactor.js`: camera, chapters, data loading and reversible presentation clock.
- `bwr-timing.js`: native-scroll compression, chapter mapping and ending phases.
- `bwr-scene.js`, `bwr-hardware.js`: pellet assembly, seated bundles, blades,
  supports, vessel and different metal finishes.
- `bwr-surfaces.js`: ceramic pellet response and dished, chamfered end geometry.
- `bwr-vessel.js`: hollow vessel heads, upper closure, lower weld and nozzle stubs.
- `bwr-radiograph.js`: faint surfaces derived from selected modeled hardware and
  sparse assembly boundary lines. No triangular wireframe or decorative HUD.
- `bwr-neutrons.js`: recorded positions/energies, soft point heads and short
  dynamically generated trails along actual flight segments.
- `assets/bwr/manifest.json`, `event.json`, `xyz.bin`, `loge.bin`: active metadata
  and recorded transport buffers. Physical times, energies and weights remain
  archived alongside them without all being downloaded for playback.
- `scripts/generate_bwr_tracks.py`: OpenMC geometry and track export.
- `simulation/bwr/`: original XML/HDF5 outputs, ignored by Git.
- `assets/vendor/three/`: local Three.js 0.180.0 and postprocessing modules;
  its MIT license is retained. No CDN, backend or build step is needed.

## Neutron histories

The transport model is a finite 3×3 array of square bundles, each with 8×8 UO2
rods in water. The active region is 120 cm tall. Fuel, gap, zirconium cladding,
channel walls, water, and an iron vessel approximation are modeled in OpenMC.
The browser uses the same active pin positions, radii, bundle widths and height.

The run contains **6,000 source histories, 6,004 recorded neutron tracks, and
721,200 states**, seed **449330**. The four additional tracks are secondary
neutrons; disabling fission neutrons does not disable other neutron-producing
reactions. A Watt source is sampled in fuel, with cold water and vacuum outer
boundaries. This is a fixed-source teaching model, not a critical commercial BWR
or a power transient. No multiplication factor or operating power is calculated.

The local ENDF/B-VIII.0 data were used at approximately 294 K. OpenMC reported
negative probability-table values for Zr96 and the expected one-batch uncertainty
warning for the track run. This output is used for visual histories.

`manifest.json` records the OpenMC version and hashes of XML and `tracks.h5`.
The exports preserve positions as float32 cm, physical time as float64 seconds,
energy as float64 eV, particle weight, and float32 log-energy for display.
`event.json` preserves identifiers and offsets. Validation against the original
HDF5 checked every state: time, energy, and weight match exactly; the maximum
position-rounding difference was **1.91×10⁻⁶ cm**.

## How the paths are displayed

Every turn comes from a recorded straight flight segment. The viewer draws
small additive point heads and recent line segments from those same histories.
The shader design follows Loïc's `neutronics_viewer (2).html`: soft point profiles,
a cool-to-warm energy palette and faint reactor surfaces. Its source file and
lead-reactor histories are unchanged; its reactor data are not reused here.

All **6,004 tracks** remain available across the sequence. Independent source
histories are staggered so that a few hundred are active at once (451 at the
current central chapter stop in the inspected run). Within a history, flight
speeds are compressed with exponent 0.3, following the reference's approach.
The relative presentation durations of entire histories are also compressed and
bounded to keep the full sequence readable. This is not elapsed reactor time.
All exported physical records remain unchanged.

Each visible history can have a short fading trail: up to 18 recent recorded
segments within 12% of its display lifetime, capped at 0.009 of the presentation
clock. The first and final visible portions of a segment are clipped by time
without inventing a new bend. Trails fade after a head terminates, and complete
paths do not accumulate. Color follows recorded log-energy; size and brightness
are presentation choices, not literal visible light emitted by neutrons.

Parent metadata remains unset, including for the four secondary tracks. No
fission genealogy, connection between nearby tracks, or event type at a turn is
inferred. A recorded turn is shown without inventing a collision flash.

## Reactor context and material direction

The pellet opening keeps its existing stack and arrival choreography. A few
central pellets now begin inside the first frame rather than leaving it empty. Neighboring assemblies complete their arrival
together and then remain in their final positions. The former front-bundle
movement to expose a control blade is removed. Blades still enter their modeled
gaps as part of assembly, without a separate theatrical detour.

During transport, opaque hardware gives way to a radiograph derived from the
existing vessel wall, domed heads, flanges, shroud, support plates and faint
upper separator hardware. Thin core
end boundaries and quieter vertical assembly edges locate the transport volume.
The camera holds a steady three-quarter composition while it moves gently
around the vessel. The vessel fades away while histories continue. The particles then fade,
followed by three plain links in the same central space.

Surface finishes are differentiated: the shell is more matte, rod highlights
are softer, and machined flanges remain more reflective. The design avoids
uniform chrome, indiscriminate wireframes, scan lines and invented data labels.

Tie plates, spacers, lifting bail, cruciform blades and supports were informed
by figures 3-2 and 4-2 of GE Vernova's
[BWRX-300 General Description](https://www.gevernova.com/content/dam/gevernova-nuclear/global/en_us/documents/carbon-free-power/005N9751_Rev_BWRX-300_General_Description.pdf)
(Revision J, June 2026). That document's GNF2 bundle is not this small 8×8 model.
No exact BWRX-300 reconstruction is claimed, and assembly choreography is an
illustration rather than a manufacturing/loading procedure.

### Version 1.1 visual details

The 1.1 pass retains the accepted flow and all transport records. Pellet ends
now have shallow dishes and narrow chamfers within the original 0.52 cm radius
and 1.00 cm height. These cosmetic end details are not resolved in the OpenMC
fuel cylinders. The vessel keeps its original 39/41 cm inner/outer wall radii;
the new upper nozzles lie above the transport slab. Hollow curved heads and
paired upper flanges make wall thickness and the closure easier to read.

The top closure and integral lower head follow the general construction shown
in the [NRC BWR manual, pp. 3-3–3-4](https://www.nrc.gov/sites/default/files/doc_library/cdn/legacy/reading-rm/basic-ref/students/for-educators/03.pdf).
The added hardware is illustrative; it does not turn this small teaching
geometry into a specific commercial vessel design. See the
[1.1 notes](version-1.1.md) and [independent review](visual-review-v1.1.md).

## Parked experiments

CFD, illustrated bubbles and steam, the whole-core tally, and the turbine cycle
are absent from the active import graph, data requests, camera, chapters and
About text. Prior modules and assets are preserved on disk. Historical model,
validation and rebuild notes are in
[the archived steam3 documentation](archive/reactor-background-steam3.md).
The [GPU feasibility report](gpu-cfd-feasibility.md) records an independent
isothermal droplet test; that work is also parked and is not website output.

## Rebuild and review

From this project directory, using the existing local OpenMC environment:

```sh
/Users/loicmagnan/Desktop/Lab_Work/OPENMC/venv/bin/python scripts/generate_bwr_tracks.py
```

This writes to this project's `simulation/bwr/`; it does not change lab models
or the original reference HTML. The local HTTP preview remains
<http://127.0.0.1:8765/reactor.html>.

The opening renders before later neutron buffers finish loading. Rendering is
requested by scrolling, resizing, visibility changes or data completion; there
is no idle particle-animation loop. Pixel ratio is capped. The fixed-camera
button and reduced-motion preference provide a stable view. WebGL or loading
failures show a useful message.

The fresh design critique and rendered findings are recorded in
[adversarial-review-neutronics.md](adversarial-review-neutronics.md). Earlier
review reports describe superseded versions. These edits remain local.

### Current verification

- JavaScript syntax checks pass for every active authored module.
- A headless execution of the actual playback module against the real buffers
  verifies finite writes within allocated geometry, 6,004 available tracks,
  roughly 450 active heads through the main interval, zero remaining heads or
  trails at the end, and exact deterministic restoration after reverse playback.
- Desktop browser inspection confirms visible pellets at p=0, seated assemblies,
  selected upper internals in the radiograph and a clean console.
- The independent review covers mobile framing, chapter/reverse transitions and
  the three destination pages. Projects is intentionally empty by user request.

[Position and playback audit](neutron-position-audit.md) verifies the original
records, scale, model dimensions and timing limitations after the aesthetic pass.

### Shorter scroll and sequential ending

`bwr-timing.js` maps native scrolling onto the existing scene choreography.
The original 1,400 svh scroll distance is divided by 1.5,
and the logical neutron interval 0.435–0.875 is additionally divided by three.
The resulting scroll distance is 659.56 svh (about 6.60 screen heights), with
136.89 svh for that neutron interval. The page includes one additional viewport
height for its visible frame. Chapter anchors use the same mapping.

The vessel fades over logical progress 0.70–0.77; neutron visibility fades over
0.79–0.875; links appear over 0.895–0.955. These phases do not overlap. Recorded
spatial tracks and model dimensions are unchanged. Mapping/inverse, speed
ratios and fade ordering passed direct checks. Browser inspection verified the
particle-only interval, fading particles with links still hidden, and fully
visible destination links after all geometry disappears; console remained clear.
