# Soap-film release 3.2 — 28 September 2026

Local preview: <http://127.0.0.1:8765/>. Production: <https://loicmagnan.com/>.
Publication authorized by Loïc after reviewing the test site.

The Soap film material from `Desktop/bubble model.html` now drives the portfolio.
`bubble-physics.js` contains the fixed 120 Hz XPBD perimeter, bend, and area solver.
It adds longer-range bending constraints, five-body contact, and a contour-based
separation pass for residual penetration in crowded wall contacts. The renderer
uses a continuous cubic B-spline inside the control polygon’s convex hull rather
than joining the particles with straight edges. This removes visible corners
without expanding the rendered silhouette into its neighbors.

Bubbles are 25% larger than their previous responsive sizes. Pointer gestures move
and stretch the membrane; a six-pixel threshold distinguishes a drag from the
click that opens a project. HTML labels and project contents are not scaled by
the shape animation. Keyboard focus slows a bubble for targeting. Reduced motion
uses the static disclosure layout. Offscreen/hidden arenas stop simulation.
The canvas renderer retains a 2D fallback if WebGL is unavailable or lost.

ATLAS starts first and uppermost. Its two screenshots are replaced by the official
[Subcritical Systems logo](https://subcritical.com/), downloaded unchanged from
[their asset CDN](https://framerusercontent.com/assets/QWswFMcBkkxpfWyajFvM0pJRHFQ.png).
The copy describes the second-generation AI platform without the regulatory claim.
The introduction and research affiliations reflect Loïc’s corrections. The full
CV now appears between the bubbles and Photography, with a PDF download. The name
uses subtle soap-film outline lettering in the same Helvetica Neue typeface.
A stronger starting impulse brings the bubbles together sooner; layout changes
preserve the existing momentum. The simulation clock now runs at 1.64×, twice
the reviewed 0.82× tempo, while retaining the fixed 120 Hz physics step.

## Validation

Run `node scripts/check-bubble-physics.cjs` for nine five-body wall-drag cases
across desktop and narrow phone sizes. The check looks for self intersections,
inter-body intrusion, non-finite points, and area loss. Separate browser checks
cover dragging without opening, ordinary opening/closing, keyboard control,
mobile overflow, logo loading, and unchanged text proportions.
