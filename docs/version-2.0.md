# Version 2.0 — video portfolio

The homepage now runs as an ordinary document: a reactor film beneath the name,
the selected CV as a printed page, and a Photography / Projects tab section.
Scrolling never controls the film or forces the visitor to finish watching it.

## Film

- Actual H.264 MP4: 32 seconds, 30 fps, silent and looping. Desktop is
  1920 × 1200; mobile is a centered 672 × 960 crop, framed to retain the reactor.
- Film frame uses 66% of viewport height on desktop and 62% on narrow screens.
- Muted inline playback, visible Play/Pause, automatic pause offscreen or when
  the page is hidden. An explicit user pause persists when scrolling back.
- Reduced-motion and data-saver preferences start with a still poster and Play.
  No movie is requested until playback is wanted and the film is visible.
- `portfolio.js` loads no Three.js modules or neutron buffers in the homepage.
  `scripts/film-scene.js` uses the existing scene offline with a deterministic
  frame clock. `scripts/render-film.cjs` encodes the desktop and mobile files.

The camera is centered for the film instead of making space for the old title
overlay. The approved assembly sequence, reactor materials and recorded neutron
positions are retained. The original scroll mapping supplies the editorial
timing; the final portfolio links are HTML below the video rather than baked
into it. A short black fade makes the loop quiet. This is still the documented
cold teaching model, with enlarged neutron markers and remapped time.

To rebuild, run the local HTTP server, then `node scripts/render-film.cjs`.
The exporter needs Playwright Chromium and FFmpeg and creates an isolated
headless browser. It does not use the user's personal browser profile.

## CV and work

`assets/cv/resume.webp` is a lossless rendering of the selected, unchanged
`assets/Resume_Loic_Magnan.pdf`. The paper and PDF link both open the original
document for full-size reading, zooming or printing. No CV text was rewritten.

Photography retains the same nine images and accessible full-screen viewer.
The two tabs support arrow keys, Home/End, direct links and browser navigation.
Projects is intentionally blank; there are no placeholder cards or invented work.

## Preservation

The reviewed 1.1 scroll site was copied before homepage work began:

- `versions/1.1/reactor.html`, with all independent runtime assets.
- `../Website_Versions/website-v1.1-scroll.zip`, relative to the project root.
- `versions/1.1/snapshot.json`: hashes for all 98 saved files.

Version 1.0 remains separately frozen. Root `reactor.html` also remains available,
but the frozen version is the stable reference for returning to the old design.
This completed 2.0 release is also saved in `versions/2.0/` and
`../Website_Versions/website-v2.0.zip` for future comparison.

## Verification

- The MP4s decode, contain 960 frames at 30 fps and have no audio track.
- Real Chrome visually checked desktop playback and the narrow-screen assembly
  and neutron sequence at 390 × 844. No console errors or warnings.
- Browser checks cover both media sources, pause/resume, offscreen behavior,
  persistent user pause, reduced motion, tabs/keyboard/deep links and gallery.
- Paper rendering was visually compared with the source PDF. All nine selected
  images remain present; the dog photograph is excluded.
- Frozen snapshots and ZIP archives remain hash-identical. Original photos,
  CV PDF, OpenMC buffers and the scroll implementation are unchanged.

All changes are local; nothing was published.
