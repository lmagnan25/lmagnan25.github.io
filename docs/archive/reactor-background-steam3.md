> Historical notes for the superseded CFD/steam sequence. Not the active website.

# BWR scroll experiment

Open `reactor.html` through the local HTTP server. This remains separate from the
homepage. Dots on the right jump between chapters. **Fixed camera** holds the
view while scrolling continues the sequence. Scrolling backwards reverses it.

## Files

- `reactor.html`, `reactor.css`: page, native scroll, chapter links, compact field legends.
- `reactor.js`: recorded neutron data, display clock, camera and sparse GPU trails.
- `bwr-scene.js`, `bwr-hardware.js`: pellet assembly, bundles, blades, supports, vessel.
- `bwr-channel.js`: interior-subchannel temperature sections and axial velocity traces.
- `bwr-steam.js`: illustrated surface bubbles, steam, sectioned outlet pipe and ending plume.
- `assets/bwr/`: model dimensions, provenance, binary tracks and calculated fields.
- `scripts/generate_bwr_tracks.py`: OpenMC geometry and track export.
- `scripts/generate_core_field.py`: separate OpenMC mesh tally; rebuilds tracks first.
- `scripts/generate_channel_field.py`: reduced channel calculation and verification.
- `simulation/bwr/`: original XML and HDF5 outputs, ignored by Git.
- `simulation/gpu-two-phase/`: separate Metal feasibility probe, ignored by Git;
  see `gpu-cfd-feasibility.md`. No output from this probe is rendered in the site.
- `assets/vendor/three/`: Three.js 0.180.0 and required postprocessing modules;
  its MIT license is retained. No external CDN is required.

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

Moving points interpolate only along recorded straight segments. All 6,004 paths
are available; about 3,100 heads are visible at the Neutrons chapter stop.
Only **101 paths** have trails, which fade quickly. The clock compresses speeds
and staggers paths for legibility. No fission genealogy is inferred. Parent
metadata is unset, including for the four secondary tracks; their separate
presentation clocks are not birth-time or genealogy claims.

## Archived core field — no longer displayed

The current sequence goes directly from neutron histories into one coolant
passage. The earlier whole-core tally, `bwr-fields.js` and `bwr-thermal.js` are
retained as prior work but are not imported or fetched by the active demo.
There is no turbine, condenser or return-water scene in the current sequence.

A separate **900,000-source-particle**, 30-batch run (seed **449331**) uses the
same cold geometry. A 30×30×40 regular mesh spans 46.8×46.8×120 cm. Its
`kappa-fission` score gives recoverable fission energy per source particle in
each cell. This is a relative fission-heating illustration, not temperature or
a prediction of operating reactor power. It does not drive the channel solver.
See [OpenMC's tally definitions](https://docs.openmc.org/en/stable/usersguide/tallies.html).

`fission-field.bin` and `fission-field-sd.bin` retain the raw cell means and
standard errors. Both were checked against `statepoint.30.h5`. `field.json`
records hashes, dimensions and limitations. The median relative standard error
among cells above 10% of the maximum mean is **15.2%**. Do not interpret local
pixel-scale differences as resolved engineering detail.

The archived renderer cuts away the front quadrant, omits cell faces below 1.2% of the
maximum, and interpolates raw means linearly across the surface. The color scale
runs from zero to **twice the arithmetic mean over all mesh cells**, including
zero cells. Values above that use the top color, labeled **≥2 × mean**. This
clips about 17.8% of raw cells to the upper color. No spatial smoothing filter or
invented center-peaking profile is applied. The square field follows this small
square model; it is not a reconstruction of the cylindrical reference image.

## Reduced channel calculation

This is a separate, dimensionless **single-phase laminar flow and thermal-entry
model** of one interior lattice subchannel. It uses the same 1.63 cm rod pitch
and 0.61 cm rod radius for visual continuity. The computational square is
**1.63 cm wide and 9.78 cm long**, with quarter rods at its four corners
(±0.815 cm in both transverse directions). The open square sides are symmetry
boundaries between neighboring passages, not duct walls. Full rods outside the
computational square are shown only for context.

A cell-centered finite-volume discretization first solves the fully developed
axial momentum Poisson equation, with no slip on the rods and zero normal
velocity derivative on the open symmetry sides.
The resulting axial speed is normalized to an area mean of one. The energy
calculation marches downstream with implicit transverse diffusion:

- `−∇²u = constant`, followed by mean-speed normalization.
- `u ∂θ/∂z = ∇²ₓᵧθ / Pe`, with **Pe = 80**.
- `θ = (T − Tinlet) / (Twall − Tinlet)`.
- Inlet θ = 0, constant rod-wall θ = 1, zero normal temperature derivative on
  open symmetry sides.
- Pe is defined as mean axial speed × rod pitch / thermal diffusivity.

This is the convection–diffusion form described by
[NIST's finite-volume conservation-equation reference](https://pages.nist.gov/fipy/en/stable/numerical/equation.html).
The implementation uses NumPy/SciPy, not FiPy. No specific temperatures,
pressure, mass-flow rate, turbulence model or BWR operating condition is implied.
It assumes identical uniformly heated rods and constant properties, and omits
axial conduction, transverse flow, turbulence, gravity, phase change and feedback.

The exported mesh has 80×80 transverse cells and 192 axial planes. Checks use
40×40×192, 64×64×192, 80×80×192 and 80×80×384 grids:

| Check | Result |
| --- | --- |
| Outlet mixed-mean θ, exported grid | 0.8779621 |
| Outlet θ change, 64 to 80 transverse cells | 0.0033054 |
| Outlet θ change, 192 to 384 axial planes | 0.0005300 |
| Peak / mean axial speed | 2.0846516 |
| Fluid-area error, exported grid | 0.3381% |
| Integrated rod-wall heat vs. enthalpy-rise relative difference | < 6.5×10⁻¹⁵ |
| Maximum float16 temperature export error | 0.00024414 |

The wall heat is accumulated from heated boundary faces independently of the
bulk enthalpy calculation. Velocity is positive in fluid cells, the fields are
symmetric, temperatures remain in [0,1], and bulk heating is monotonic. The
circular rods use a staircase mask: transverse refinement is not monotonic,
and these checks do not establish a convergence order or physical BWR validity.

`channel.json` records all assumptions and checks. The temperature volume and
axial velocity map are exported separately, with hashes. The temperature volume
uses float16 (2.46 MB) and velocity uses float32. Bounds, rod geometry and file
names come from metadata. One longitudinal section and a small cross-section
sample the temperature volume; neutral tracers use bilinear interpolation of
computed axial speed. There is no invented transverse swirl. Scroll supplies
presentation time. A front rod remains sectioned through the boiling view so
the interior water and bubbles stay visible.

## Illustrated hardware and phase change

The temperature cuts fade before bubbles appear. Bubbles originate at rod
surfaces, grow, detach and rise in a deliberately close view. Their shape,
positions and timing are illustrative, **not a solved phase interface or boiling
CFD result**. The camera follows the same bubble cohort out of the enlarged
passage and up to a sectioned separator. A steam illustration then continues
through an opened vessel outlet pipe. The plume dissipating into the CV and
Photography links is a visual transition, not a modeled atmospheric discharge.
The About panel and chapter legend distinguish illustration from computed fields.

The process follows the [NRC BWR overview](https://www.nrc.gov/reactors/power/bwrs)
and [reactor concepts guide](https://www.nrc.gov/sites/default/files/doc_library/cdn/legacy/reading-rm/basic-ref/students/for-educators/03.pdf):
water passes through the core, and separators and dryers remove entrained liquid
before steam leaves the vessel. The downstream power cycle is outside the
current scroll sequence.

Tie plates, spacers, lifting bail, cruciform blades, core support and upper guide
were informed by figures 3-2 and 4-2 in GE Vernova's
[BWRX-300 General Description](https://www.gevernova.com/content/dam/gevernova-nuclear/global/en_us/documents/carbon-free-power/005N9751_Rev_BWRX-300_General_Description.pdf)
(Revision J, June 2026). That document's GNF2 bundle is not this small 8×8 model.
No proprietary drawing is embedded in the site, and no exact BWRX-300
reconstruction is claimed. Assembly choreography is explanatory, not a
manufacturing or loading procedure. One bundle moves aside to expose a blade.

The vessel internals, control drive housings and outlet pipework are procedural
illustrations. Separator deck openings align with the modeled standpipes; the
featured separator and pipe have open sections for visibility. Active transport
geometry is accurate only to the small OpenMC model described above. All arriving
assemblies now finish together, followed by a short hold before the front bundle
moves aside for the control-blade view.

## Local GPU two-phase work

The M4 Pro successfully executes a genuine coupled immiscible two-phase
lattice-Boltzmann droplet test via Taichi's Metal backend, with CPU fallback
disabled. That 32³, 400-step case is an equal-density, isothermal feasibility
probe. It has no channel, gravity, water/steam density contrast, energy equation
or evaporation. Its phase variable also slightly overshoots its nominal bounds.
Do not use it as evidence of validated boiling CFD. See
[the full test and limitations](gpu-cfd-feasibility.md).

Resolved channel bubbles require a suitable density model and interface/momentum
benchmarks before integration. Predicting heated-wall vapor formation adds an
energy equation, latent heat, interfacial mass transfer and wall treatment, with
separate verification. Browser playback can later use saved simulation frames;
the visitor's browser does not need to run the solver.

## Rebuild

Using the existing local OpenMC environment and nuclear-data library:

```sh
/Users/loicmagnan/Desktop/Lab_Work/OPENMC/venv/bin/python scripts/generate_bwr_tracks.py
/Users/loicmagnan/Desktop/Lab_Work/OPENMC/venv/bin/python scripts/generate_channel_field.py
```

The first command rebuilds tracks. The archived tally can separately be rebuilt
with `scripts/generate_core_field.py`, which also regenerates tracks. All runs use
this project's `simulation/bwr/`; no lab models are changed. The original user
reference HTML is unchanged and none of its lead-reactor data is used.

## Browser behavior and checks

- Native desktop, touch and keyboard scrolling with accessible chapter links.
- Reversible, deterministic camera and data playback, with no idle particle loop.
- Rendering stops when hidden; pixel ratio capped for performance.
- Fixed-camera control and a fixed overview for reduced-motion preferences.
- Useful fallback message when WebGL or data loading fails.
- Desktop and 390×844 viewport inspection; no horizontal overflow in the channel.
- JavaScript syntax and Python compilation checks pass; browser reports no shader errors.
- Data export checked against original HDF5; solver balance and mesh checks above.
- Earlier independent reviews are in `design-review-astra.md` and
  `adversarial-review-fields.md`; the revised channel-model review is in
  `channel-review-astra.md`.

No deployment, backend, external service, or framework is required.

### Earlier loading regression check

A separate local test server delayed binary responses by six seconds. In a fresh
browser origin, the opening rendered at **328 ms**, with no histories or fields
ready yet. The fields became ready at **6.42 s**, and neutron data at **6.66 s**;
the pellet composition and camera stayed unchanged. This verifies that later
assets do not block the opening. It is a controlled local delay test, not a
public-host bandwidth benchmark. The temporary test server was stopped afterward.
