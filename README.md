# Loïc Magnan

A minimal static personal website for <https://loicmagnan.com/>.

## Pages

- `index.html`: video-led portfolio. Name above a reactor film, a printed CV,
  then Photography and Projects tabs on the same page.
- `projects.html`: empty until project content is supplied.
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

The current **2.2** adds gradual component entrances while preserving the 2.1
pacing, finished-vessel dissolve and neutron close-up. See the
[2.2 notes](docs/version-2.2.md). Backups remain local and are excluded from
GitHub Pages publication.

## Preview

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
