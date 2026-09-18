# Version 2.1 — tighter assembly, close neutron view

## Requested changes

- Mechanical assembly plays at twice its 2.0 speed, from rod-array formation
  through spacer/channel seating, neighboring bundles and vessel closure
  (scene progress 0.125–0.387). Pellet arrival and neutron playback retain their
  original presentation speed. The film is now approximately 25 seconds.
- Spacer grids keep their final physical size and seat with a short axial
  movement. The film no longer shrinks oversized square frames onto the rods.
- The finished vessel stays assembled while it dissolves. Control blades no
  longer withdraw. A registered image of the assembled vessel crossfades into
  the live radiograph and neutron view, avoiding the brightness jump caused by
  overlapping transparent rods. The camera holds through the dissolve, then
  pushes roughly four times closer into the active region.
- A quiet lattice guide appears during the close-up, using the model's 1.63 cm
  pin pitch, 8×8 pins per bundle, 14 cm channels and actual bundle centers.
  Its three cross-sections coincide with existing spacer elevations. These are
  geometry guides, not a new tally mesh or a new physics calculation.

## Implementation

The changes are confined to the film and opt-in scene behavior. The archived
scroll versions remain independent and untouched. `bwr-scene.js` keeps the old
behavior by default; the film opts into rigid spacer arrival and an assembled
fade. `scripts/film-timing.js` contains a reversible time mapping.
`scripts/film-grid.js` builds the lattice from the existing metadata.

The film uses the original 6,004 OpenMC tracks. No positions, energies, spatial
scale or active-core dimensions changed. The closer camera changes the field
of view, not the transport geometry. Dots and presentation time remain stylized.

Export uses a temporary directory and replaces the desktop/mobile MP4s only
after both encodes finish. The previous complete film remains playable while
the replacement is being rendered.

## Checks and independent audit

- Direct timing checks verify exactly 2× speed in each assembly interval,
  unchanged pellet/neutron durations and a reversible mapping.
- All solid hardware transforms and instanced positions are identical at four
  points through the dissolve. A postprocessing image blend controls the final
  transition instead of exposing the backs of translucent hardware surfaces.
- Rendered brightness decreases smoothly through the corrected dissolve. The
  first transition frame differs from its preceding frame by a mean absolute
  RGB value of 0.0133 on a 0–255 scale in the inspected 1600×1000 render.
- Rendered frames confirm a stationary vessel during the fade and a clear
  neutron close-up with geometry-based grid lines.
- A fresh-context Astra audit reviews the video, component placement, pacing,
  overall arc and optional improvements for impact and cleanliness. Findings
  and suggestions are in [video-audit-2.1.md](video-audit-2.1.md).
- The audit found the transparent-rod brightness pop. The registered image
  dissolve corrected it, and the reviewer verified the final encoded frames
  from 14.9–16.9 seconds. No blocking visual issue remains in the inspected
  desktop/mobile sequence. Optional lighting and ghost-wall refinements remain
  suggestions for discussion.
- Both final MP4s decode without errors: 749 frames at 30 fps, 24.966667 seconds.

The CV, Photography / Projects section and page layout are unchanged.
The original video-led design is preserved in `versions/2.0/` and the separate
`Website_Versions/website-v2.0.zip` backup.
This completed revision is also frozen in `versions/2.1/` with a verified
portable copy at `../Website_Versions/website-v2.1.zip` relative to the root.
