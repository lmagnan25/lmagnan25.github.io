# Version 2.2 — smoother component entrances

Arriving spacers, tie plates, channels, neighboring bundles, control blades,
core supports, vessel walls, upper internals, heads and drives now fade in
gradually along their existing paths. They no longer become fully visible at
a single frame boundary.

The film compositor blends complete opaque renders for each arriving group.
This retains normal occlusion and metal shading without exposing bright back
surfaces through overlapping translucent parts. The blend uses smooth easing
with zero slope at both ends.

The approximately 25-second pacing, mechanical assembly speed, completed-vessel
dissolve, neutron close-up and actual model dimensions are unchanged. No neutron
positions, energies or playback clocks were changed. The homepage keeps its
paper CV, Photography and Projects tabs.

Both films contain 749 frames at 30 fps. Desktop is 1920×1200; mobile is 672×960.
Version 2.1 remains frozen in `versions/2.1/` with a separate verified portable
archive at `../Website_Versions/website-v2.1.zip` relative to the project root.

## Verification

- Inspected entrance frames, the finished vessel and the neutron close-up.
- Checked both sides of all 11 former hard visibility thresholds. Mean RGB
  differences stayed below 0.05 on a 0–255 scale over a 0.000002 progress step.
- Both final MP4s decode without errors and retain their expected dimensions,
  duration and frame count.
- Desktop and mobile playback, pause, the selected CV PDF, both tabs, gallery
  navigation and Escape work. Neither viewport overflows horizontally.
- Reduced-motion mode shows the poster without loading the film.
- The previous 2.1 snapshot and archive remain unchanged and hash-verified.
