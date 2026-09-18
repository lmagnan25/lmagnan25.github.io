# Version 2.3 — clean neutron ending

The lattice guide now uses the vessel's fade interval and easing, disappearing
completely at scene progress 0.77. The film no longer displays the rising water
volume or animated water surface. The archived scroll versions remain intact.

## Flicker diagnosis and correction

The previous encoded video contained intermittent black rectangular regions,
including frames at 19.133 and 19.533 seconds. Repeated stationary renders were
stable. Direct canvas capture reproduced the same blocks, ruling out the
browser screenshot compositor as their cause.

The radiograph shader raised `1 - abs(dot(normal, view))` to the fractional
power 2.4. GPU roundoff can make the normalized dot product slightly greater
than one. Raising the resulting negative number to a fractional power produces
an invalid value. The bloom blur then spreads that value into a large black
region. Clamping the dot product to [0, 1] prevents the invalid calculation.
This preserves the intended appearance and fixes the former bad frames.

Offline export now reads the synchronized WebGL canvas directly. Desktop and
mobile videos are rebuilt at the existing duration and frame count: 749 frames,
30 fps, 24.966667 seconds. Camera motion, particle timing, spatial dimensions
and recorded OpenMC buffers are unchanged.

## Verification

- Inspected the formerly corrupted frames after the shader fix.
- Decoded both final videos without errors. Across the 17.1–23.0 second neutron
  interval, the largest deviation of frame brightness from its two neighbors
  fell from 3.324 to 0.126 on a 0–255 scale for desktop. Mobile measured 0.301.
  Neither new encode exceeded the 0.5 diagnostic threshold.
- Verified both water meshes remain hidden during the former fill sequence.
- Verified grid opacity reaches zero with the vessel at progress 0.77 and
  remains zero while the neutrons continue.
- The prior 2.2 is preserved in its own folder and portable ZIP.
