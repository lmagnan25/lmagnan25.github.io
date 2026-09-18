# Version 1.1

This revision focuses on the two objects Loïc asked to improve: fuel pellets
and the pressure vessel. The accepted sequence remains intact.

## Changes

- Dark ceramic pellets, broader reflections, fine surface relief, shallow
  dished ends and narrower chamfers. Each retains its original 0.52 cm radius
  and 1.00 cm height; the arrival and stacking animation is unchanged.
- Hollow curved vessel heads with readable wall thickness, a substantial paired
  upper flange and closure studs, and an integral lower head with a weld seam.
- Four short hollow nozzle stubs in the upper vessel, with visible bores through
  the opaque wall. The top flange and studs travel with the arriving head.
- The existing radiograph includes the new vessel silhouette and closure.

The active core coordinates, neutron records, particle playback, camera path,
scroll timing, vessel → neutrons → links exit, and portfolio pages are unchanged.
Manufacturing details are illustrative; the OpenMC model has not been rerun or
changed for these cosmetic additions.

## Review and checks

A separate Astra session reviewed the frozen 1.0 before implementation and
rechecked the rendered 1.1. Findings are recorded in
[the visual review](visual-review-v1.1.md).

- All eight active authored JavaScript modules pass syntax checks.
- Generated geometry has finite positions, normals, texture coordinates and
  bounds. The pellet envelope remains 1.04 × 1.04 × 1.00 cm.
- All assets, the neutron playback module, timing module and CSS match 1.0.
  The scene controller and HTML differ only in module cache versions.
- All 94 frozen files match the 1.0 hash manifest. The independent ZIP passes
  an integrity check and its contents match those same hashes.
- The independent rendered recheck passes on desktop and at 390 × 844: pellet
  readability, vessel construction and framing, radiograph, ordered fades and
  all three ending links. No console errors or warnings were found.

## Compare or restore

- Reviewed 1.1: <http://127.0.0.1:8765/versions/1.1/reactor.html>
- Frozen baseline: <http://127.0.0.1:8765/versions/1.0/reactor.html>
- Portable baseline: `../../Website_Versions/website-v1.0.zip`, relative to this
  document's folder.

The frozen snapshot contains its own HTML, modules, vendor library, photos, CV
and neutron buffers, so future changes to working assets cannot alter its
appearance. Before restoring it over the working root, save that working
revision separately. See [version notes](../versions/README.md).
