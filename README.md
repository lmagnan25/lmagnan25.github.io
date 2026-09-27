# Loïc Magnan

A minimal static personal website for <https://loicmagnan.com/>.

## Pages

- `index.html`: video-led portfolio with a short introduction, expanding
  Projects and Research bubbles, then the existing photography gallery.
- `work-bubbles.js`: in-place expansion, collapse and Escape handling. The
  underlying native `details` elements also work without JavaScript.
- `bubble-engine.js`: procedurally rendered, gently rotating soap-film rims.
  The outline grows in pixel space while text and images retain their proportions.
  Motion pauses offscreen and in hidden tabs; reduced-motion mode stays still.
  See [rendering references and review](docs/bubble-rendering.md).
- `projects.html`: legacy address that redirects to the homepage’s work section.
- `cv.html`: CV summary and the selected, unchanged `Resume_Loic_Magnan.pdf`.
- `photography.html`: nine photographs, without visible captions or counts.
- `reactor.html`: retained cinematic BWR scroll experiment. Scroll from fuel assembly
  through a faint reactor radiograph and recorded OpenMC neutron paths, then
  fade into CV, Projects and Photography.

[Design notes](docs/design-notes.md) record Loïc's preferences.
[Reactor notes](docs/reactor-background.md) explain the data, visual assumptions,
source model, and rebuild steps.
The earlier CFD and [GPU feasibility work](docs/gpu-cfd-feasibility.md) are
parked. They are not loaded or displayed by the website.

## Versions

The accepted **1.0** site is frozen locally in `versions/1.0/`, including
its own runtime assets. Compare it at
<http://127.0.0.1:8765/versions/1.0/reactor.html>.
An independently verified ZIP is saved at
`../Website_Versions/website-v1.0.zip`.

The reviewed **1.1 scroll version** is frozen in `versions/1.1/`, with its own
assets and a verified backup at `../Website_Versions/website-v1.1-scroll.zip`.
Open <http://127.0.0.1:8765/versions/1.1/reactor.html> to revisit it.

The preserved **2.1** tightens assembly pacing, keeps the finished vessel still
through its dissolve, and moves into a neutron close-up with faint lattice
guides. See the [2.1 notes](docs/version-2.1.md) and local
rollback notes in `versions/README.md`. The original video-led **2.0** remains
frozen in `versions/2.0/`; both earlier scroll versions also remain untouched.

The preserved **2.2** adds gradual component entrances while preserving the 2.1
pacing, finished-vessel dissolve and neutron close-up. See the
[2.2 notes](docs/version-2.2.md). Backups remain local and are excluded from
GitHub Pages publication.

The preserved **2.3** synchronizes the grid and vessel fade, removes the water
level animation, and fixes flashing blocks in the radiograph shading. See the
[2.3 notes](docs/version-2.3.md).

Version **3.0** has the video, introduction, a shared field of five
floating bubbles, Photography, and a separate CV page. Bubbles travel freely
within the shared field with slow drift, lingering contact and gentle surface
wobble. Hover or keyboard focus holds a bubble still. There is no motion
button; reduced motion uses a static layout. Click a bubble to expand its own shape into a
steady text-and-image area; click its heading again or press Escape to close.
Only one bubble opens at a time. Taurus includes Loïc's
co-developer credit, project description and three original screenshots, with
its own image-viewer group. ATLAS includes Loïc's description and two
user-selected images (radiation analysis and a 3D facility model), in a separate
viewer group. NTP includes Loïc's research description, three supplied figures
and a ResearchGate paper link. ADS includes his FLUKA and burnup contribution,
with the user-selected heat-generation plot featured above the neutron source
and system design figures. Agentic System Research includes the ongoing collaboration,
error propagation diagram, and a typeset two-state contamination model with rate
definitions. Projects and Research were removed from the top navigation. The CV is
available on its separate page and is no longer embedded on the homepage.
The reactor film and frozen versions are unchanged.

## Preview

Version **3.1** polishes shared navigation, header sizing, phone labels and image
viewing. Single-image galleries omit navigation arrows; transparent research
figures get a white background only behind the image. Legacy project links lead
to the floating work section. Pointer focus no longer holds a closed bubble
after the pointer leaves; keyboard focus still does.

Run from this directory:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open <http://127.0.0.1:8765/> or <http://127.0.0.1:8765/reactor.html>.
The reactor needs HTTP serving for its modules and data. No build step, CDN,
JavaScript framework, external font, or backend is required.

## Photography

Originals remain in `Photos/` and are excluded from Git. Responsive WebP copies
are in `assets/photos/`. With Pillow installed, regenerate them with:

```sh
python3 scripts/prepare_photos.py
```

The script respects orientation, leaves originals unchanged, removes EXIF from
web copies, and excludes `IMG_0425` (the dog photo). The restaurant screenshot
uses a CSS frame to hide the original letterboxing.

The full-screen viewer supports arrow keys, Escape, next/previous controls,
and horizontal swipes. Without JavaScript, photos open as normal image links.

## Hosting

The site can be served from the repository root by GitHub Pages. Keep `CNAME`
and `.nojekyll`. The public repository contains the current site and its source;
original photos, simulation workspaces and rollback copies stay local.
