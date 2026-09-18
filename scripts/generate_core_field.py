"""Independent fixed-source mesh tally, using the same cold teaching geometry.

Importing the track exporter rebuilds the 6,000-history display dataset first.
No criticality, coupled temperature, or operating power is inferred here.
"""
import hashlib
import json
import numpy as np
import openmc
from generate_bwr_tracks import model, settings, RUN, OUT, INSTALL

field_run = RUN / 'field'
field_run.mkdir(exist_ok=True)
mesh = openmc.RegularMesh()
mesh.dimension = (30, 30, 40)
mesh.lower_left = (-23.4, -23.4, -60.)
mesh.upper_right = (23.4, 23.4, 60.)
tally = openmc.Tally(name='recoverable fission energy on regular mesh')
tally.filters = [openmc.MeshFilter(mesh)]
tally.scores = ['kappa-fission']
model.tallies = openmc.Tallies([tally])
settings.batches = 30
settings.particles = 30000
settings.max_tracks = 0
settings.seed = 449331
model.export_to_xml(field_run)
openmc.run(openmc_exec=str(INSTALL/'install/bin/openmc'), cwd=field_run, threads=2)
with openmc.StatePoint(field_run/'statepoint.30.h5') as sp:
    result = sp.get_tally(name=tally.name)
    mean = result.get_reshaped_data(expand_dims=True)[..., 0, 0]
    sd = result.get_reshaped_data(value='std_dev', expand_dims=True)[..., 0, 0]
    assert mean.shape == (30, 30, 40)
    # x is fastest for the WebGL 3D texture. Retain raw values and uncertainties.
    raw = mean.transpose(2, 1, 0).astype('<f4')
    stderr = sd.transpose(2, 1, 0).astype('<f4')
assert np.isfinite(raw).all() and raw.max() > 0 and np.all(raw >= 0)
raw.tofile(OUT/'fission-field.bin')
stderr.tofile(OUT/'fission-field-sd.bin')
active = mean > .1*mean.max()
meta = {
    'quantity': 'kappa-fission', 'units': 'eV per source particle per mesh cell',
    'dimension': list(mesh.dimension), 'lower_left': list(mesh.lower_left),
    'upper_right': list(mesh.upper_right), 'order': 'x fastest, then y, then z',
    'maximum': float(raw.max()), 'batches': settings.batches,
    'source_particles': settings.batches*settings.particles, 'seed': settings.seed,
    'median_relative_standard_error_active': float(np.median(sd[active]/mean[active])),
    'display': 'Trilinear interpolation; linear scale 0 to twice the mean over all mesh cells, including zero cells; higher values use the top color. Front quadrant removed. Cell faces below 1.2 percent of the maximum are omitted.',
    'limitations': 'Independent cold fixed-source model, fission secondaries disabled. Not temperature, reactor operating power, or a coupled thermal solution.',
    'sha256': hashlib.sha256((OUT/'fission-field.bin').read_bytes()).hexdigest(),
    'statepoint_sha256': hashlib.sha256((field_run/'statepoint.30.h5').read_bytes()).hexdigest(),
    'input_hashes': {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in field_run.glob('*.xml')},
}
(OUT/'field.json').write_text(json.dumps(meta, indent=2))
print(json.dumps(meta, indent=2))
