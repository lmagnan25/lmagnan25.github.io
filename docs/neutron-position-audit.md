# Neutron geometry and playback audit

17 September 2026. Read-only comparison of the current renderer, model inputs,
exported buffers and original OpenMC track file. No trajectories, physical data,
source settings or geometry were changed by this audit.

## Spatial result

All 6,004 exported neutron histories and 721,200 states were compared against
`simulation/bwr/tracks.h5`. Every position equals the original position converted
to float32. The maximum rounding difference is 1.90734e-6 cm. Original input,
track-file and exported-buffer SHA-256 hashes match their recorded values.
Times, energies and statistical weights match the original records exactly.

The rendered head and tail objects attach directly to the unscaled scene.
Their shaders apply the camera's ordinary model-view/projection transforms;
there is no separate spatial gain, random displacement, or lengthened flight.
Heads interpolate only between consecutive records of the same history.
Trails use those same endpoints and never bridge two histories.

The rendered active lattice and radiograph boundaries match these model values:

| Quantity | Value |
| --- | --- |
| Fuel active height | 120 cm, z from -60 to +60 |
| Overall square channel-array width | 45.2 cm |
| Bundle layout | 3×3, 8×8 rods per bundle; 576 rods |
| Pin pitch / clad outer radius | 1.63 cm / 0.61 cm |
| Vessel inner / outer radius in active slab | 39 / 41 cm |

Tracks stay within z ±60 cm and radius 41 cm, including leakage endpoints.
The median per-history extent is about 8 cm on each axis; the 90th percentile
is about 16 cm. Independent histories begin at fuel locations distributed
throughout the core. Seeing activity across the core therefore does not mean
that each neutron traverses the entire core or that paths were enlarged.

## Display choices

The luminous dot diameter is an enlarged screen-space marker, not neutron size.
Trail visibility and energy colors are illustrative. The speed-compressed and
staggered presentation clock is deliberately nonlinear, including compression
of relative lifetimes across histories. It does not reproduce physical speed,
a common physical instant, neutron population, or flux intensity. Scrolling
controls that clock. Recorded physical lifetimes remain unchanged in `t.bin`;
the median in this run is approximately 30.7 microseconds.

OpenMC's [track format](https://docs.openmc.org/en/stable/io_formats/track.html)
records particle states, and its
[neutron transport description](https://docs.openmc.org/en/stable/methods/neutron_physics.html)
describes sampled flights and collisions. A recorded segment may end at a
material boundary; it is not automatically a separate scattering event.

## Model limits

This is a cold fixed-source teaching model using prescribed starting neutrons,
not a critical or operating commercial BWR calculation. Fission offspring are
disabled. The active slab has vacuum axial boundaries, water has cold density,
and there is no boiling, thermal feedback or power transient. The upper vessel,
separators, supports and control-blade visual hardware are not all represented
in the transport geometry. Authentic OpenMC records do not establish full-plant
or engineering validation of that simplified model.

Machine-readable measurements: `neutron-position-audit.json`.
