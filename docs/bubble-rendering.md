# Digital bubble study — September 27, 2026

The current preview replaces the photographic bubble experiment with an
original procedural WebGL renderer. No image, generated bitmap, texture
download, external library, or Python service is needed at runtime.

## Visual references

- [Codrops: Organic SVG Shape Morph Ideas](https://tympanus.net/codrops/2017/09/19/organic-shape-morph-ideas/),
  by Manoela Ilic: organic outlines used for interactive content reveals.
- [NVIDIA: Thin Film](https://docs.omniverse.nvidia.com/materials-and-rendering/latest/templates/parameters/OmniSurface_ThinFilm.html):
  interference color varies with viewing angle and film thickness.
- [Autodesk: Iridescent Soap Bubble Shader](https://help.autodesk.com/cloudhelp/2024/ENU/AR-Maya/files/am-Arnold_for_Maya_User_Guide/tutorials/am-Shading/arnold_for_maya_shading_am_Iridescent_Soap_Bubble_Shader_html.html):
  a rendered soap-film reference for transparent interiors and iridescence.

These informed the direction; no third-party shader code or artwork was copied.
The final material is an art-directed approximation, not a spectral simulation.

## Construction

`bubble-engine.js` evaluates an approximate signed distance from a superellipse
and shades a narrow band along that boundary. Its interior is transparent.
Lavender, ice, blush and a little warm yellow appear around the edge; broad
chrome reflections and painted interior highlights are absent.

Distance is measured in CSS pixels. A growing bubble therefore retains its
rim thickness rather than enlarging an image. Eight paired spring modes perturb
the contour, with independent phases, speeds and rotation directions. Contact excites the lowest modes, which ring down slowly; a small continuous
wobble keeps the surfaces alive between contacts. Angular color functions are periodic, avoiding a seam at the polar wrap.

Opening interpolates geometry toward a softly squared reading space. Width
leads height slightly. The browser lays out the content at its final dimensions;
only its opacity fades in. Labels translate, but no text, content wrapper or
image is scaled. Reversing during a morph starts from its current boundary.

`bubble-motion.js` moves all five closed bubbles through one shared field below
the video. Centers drift around 9–15 CSS pixels per second. Spring forces allow
brief compression and a gentle rebound; damped low-frequency contour modes
sustain a slow wobble. Exact shared power-diagram planes are computed from the
interpolated display positions and bend the contacting surfaces. Both sides
use the same boundary with a small antialias allowance, so the closed rendered
surfaces remain in disjoint cells. This is a visual approximation, not a fluid
dynamics solver. Wall planes constrain the same surface.

Translation uses a 120 Hz fixed physics step and interpolated rendering.
Hover/focus brakes a target, then gently restores its drift on release. The
Pause motion button has been removed. Hidden/offscreen work pauses; individually
offscreen canvases are not redrawn by the synchronized contact updates.

Disclosure morphs carry their current clipping release through rapid reversal.
Closed endpoints receive their new constraints before their first settled draw.
Context loss switches to conservative hard separation for the CSS fallback and
settles ongoing transitions before repacking. The soft-contact geometry applies
to the WebGL field; the fallback remains a simple static outline on moving disks.

The document flows with the opening panel. One item opens at once.
Only the latest opening may bring an offscreen heading into view. Escape closes
and restores focus. Reduced motion removes continuous motion and transitions.
The renderer pauses when hidden or offscreen. Native disclosures and a quiet
CSS outline remain available if WebGL is unavailable.

## Visual and interaction review

Reviewed the real browser at desktop 1200 × 813 and phone 390 × 844, with
closed and expanded states. This was a manual visual review, not a claim of
independent design approval.

- Color stays around the rim; the center matches the page background.
- Pale highlights remain restrained beside the existing typography and photos.
- Individual bubbles vary without using a different visual language per item.
- Opening preserves optical rim width and keeps content undistorted.
- Corrected a color seam, tight curved-edge margins, and an oversized keyboard
  focus outline during review. Focus now uses a clear underline on the title.
- Checked disclosure interaction, rapid reversals, expanded content,
  and one-open-item behavior. Content transforms remain `none`.
- No horizontal overflow at the reviewed desktop and phone widths; five active
  renderers and no browser console warnings or errors in the normal preview.
- Separate temporary fixtures verified reduced-motion opening and the no-WebGL
  fallback. Both remained operable without content scaling.

## Adversarial motion audit

Independent read-only reviews prompted fixes for phone hit areas, tablet layout,
transition endpoints, interrupted clipping release, fallback collision geometry,
and offscreen rendering. The final pass also addressed renderer loss during a
transition by settling the transition before repacking. These are code reviews,
not a claim of independent aesthetic approval.

The current local checks in ignored `tmp/checks/lava-bubbles.cjs` exercise four
120-second desktop/tablet/phone simulations, hover/release, interpolated shared
planes including antialias fringes, soft rebound, and fallback pair separation.
`lava-lifecycle.cjs` checks reversal continuity, constrained closing endpoints,
resize fitting, and reduced-motion constraint removal. Older temporary physics
checks describe superseded approaches and are not validation of this version.
Browser checks cover desktop and phone disclosures and undistorted content.
These checks are bounded verification, not a guarantee of identical behavior
on every GPU or browser.

The populated entries are Taurus, ATLAS, NTP, ADS, and Agentic System Research. This revision is prepared for publication at Loïc’s request. The earlier photo rendering and assets are preserved under
the ignored `tmp/bubble-iterations/` directory.
