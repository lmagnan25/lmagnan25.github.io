"""Small BWR-style teaching model; exports actual OpenMC neutron paths.

Run with the local OpenMC Python environment. Raw outputs stay in simulation/.
This finite, cold model is not a commercial BWR design or a power transient.
"""
import hashlib
import json
import os
from pathlib import Path
import numpy as np
import openmc

ROOT = Path(__file__).resolve().parents[1]
INSTALL = Path('/Users/loicmagnan/Desktop/Lab_Work/OPENMC')
os.environ['OPENMC_CROSS_SECTIONS'] = str(INSTALL / 'xs/endfb-viii.0-hdf5/cross_sections.xml')
RUN = ROOT / 'simulation/bwr'
OUT = ROOT / 'assets/bwr'
RUN.mkdir(parents=True, exist_ok=True)
OUT.mkdir(parents=True, exist_ok=True)

fuel = openmc.Material(name='UO2, 3.2 percent enrichment')
fuel.add_element('U', 1, enrichment=3.2)
fuel.add_element('O', 2)
fuel.set_density('g/cm3', 10.4)
zirconium = openmc.Material(name='Zirconium cladding and square channels')
zirconium.add_element('Zr', 1)
zirconium.set_density('g/cm3', 6.55)
water = openmc.Material(name='Cold light water')
water.add_nuclide('H1', 2)
water.add_nuclide('O16', 1)
water.set_density('g/cm3', .997)
water.add_s_alpha_beta('c_H_in_H2O')
steel = openmc.Material(name='Iron vessel approximation')
steel.add_element('Fe', 1)
steel.set_density('g/cm3', 7.8)
materials = openmc.Materials([fuel, zirconium, water, steel])

height, vessel_radius, vessel_outer = 120., 39., 41.
pitch, bundle_pitch, channel_width = 1.63, 15.6, 14.0
fuel_r, gap_r, clad_r = .52, .535, .61
bottom = openmc.ZPlane(z0=-60, boundary_type='vacuum')
top = openmc.ZPlane(z0=60, boundary_type='vacuum')
vertical = +bottom & -top
vessel_in = openmc.ZCylinder(r=vessel_radius)
vessel_out = openmc.ZCylinder(r=vessel_outer, boundary_type='vacuum')
cells = []
outside_channels = -vessel_in & vertical
centers, pins = [], []
for bx in range(-1, 2):
    for by in range(-1, 2):
        cx, cy = bx * bundle_pitch, by * bundle_pitch
        centers.append([cx, cy])
        outer = openmc.model.RectangularPrism(channel_width, channel_width, origin=(cx, cy))
        inner = openmc.model.RectangularPrism(channel_width - .24, channel_width - .24, origin=(cx, cy))
        cells.append(openmc.Cell(fill=zirconium, region=-outer & +inner & vertical))
        moderator = -inner & vertical
        for ix in range(8):
            for iy in range(8):
                x, y = cx + (ix - 3.5) * pitch, cy + (iy - 3.5) * pitch
                pins.append([x, y])
                f = openmc.ZCylinder(x0=x, y0=y, r=fuel_r)
                g = openmc.ZCylinder(x0=x, y0=y, r=gap_r)
                c = openmc.ZCylinder(x0=x, y0=y, r=clad_r)
                cells.extend([openmc.Cell(fill=fuel, region=-f & vertical),
                              openmc.Cell(region=+f & -g & vertical),
                              openmc.Cell(fill=zirconium, region=+g & -c & vertical)])
                moderator &= +c
        cells.append(openmc.Cell(fill=water, region=moderator))
        outside_channels &= +outer
cells.append(openmc.Cell(fill=water, region=outside_channels))
cells.append(openmc.Cell(fill=steel, region=+vessel_in & -vessel_out & vertical))
settings = openmc.Settings()
settings.run_mode = 'fixed source'
settings.batches = 1
settings.particles = 6000
settings.seed = 449330
settings.max_tracks = 6000
settings.create_fission_neutrons = False
settings.source = openmc.IndependentSource(
    space=openmc.stats.Box((-22,-22,-48), (22,22,48), only_fissionable=True),
    energy=openmc.stats.Watt())
settings.output = {'summary': False, 'tallies': False}
model = openmc.Model(openmc.Geometry(cells), materials, settings)
model.export_to_xml(RUN)
openmc.run(openmc_exec=str(INSTALL/'install/bin/openmc'), cwd=RUN, tracks=True, threads=2)

histories = openmc.Tracks(RUN/'tracks.h5')
xyz, times, energies, offsets, counts, identifiers, weights = [], [], [], [], [], [], []
count = 0
for history in histories:
    for particle in history.particle_tracks:
        if str(particle.particle).lower() not in ('neutron', '0') and particle.particle != openmc.ParticleType.NEUTRON:
            continue
        states = particle.states
        if len(states) < 2:
            continue
        offsets.append(count)
        counts.append(len(states))
        identifiers.append(list(history.identifier))
        xyz.extend(zip(states['r']['x'], states['r']['y'], states['r']['z']))
        times.extend(states['time'])
        energies.extend(states['E'])
        weights.extend(states['wgt'])
        count += len(states)
arrays = {'xyz': np.asarray(xyz, dtype='<f4'), 't': np.asarray(times, dtype='<f8'),
          'loge': np.log10(np.maximum(energies, 1e-20)).astype('<f4'),
          'energy': np.asarray(energies, dtype='<f8'), 'weight': np.asarray(weights, dtype='<f8')}
buffers = {}
for name, array in arrays.items():
    assert np.isfinite(array).all()
    raw = array.tobytes()
    (OUT/f'{name}.bin').write_bytes(raw)
    buffers[name] = {'file': f'{name}.bin', 'sha256': hashlib.sha256(raw).hexdigest()}
for o, n in zip(offsets, counts):
    assert np.all(np.diff(arrays['t'][o:o+n]) >= 0)
event = {'seed': settings.seed, 'n_particles': len(counts), 'n_states': count,
         'offsets': offsets, 'counts': counts, 'par': [-1]*len(counts),
         'parV': [0]*len(counts), 'identifiers': identifiers, 'buffers': buffers}
geometry = {'r_vessel': vessel_radius, 'r_outer': vessel_outer, 'z_fuel': [-60,60],
            'r_lattice': 32., 'z_lo': -78., 'z_hi': 125., 'src_z': 0,
            'bundle_centers': centers, 'pins': pins, 'pitch': pitch,
            'channel_width': channel_width, 'fuel_radius': fuel_r, 'clad_radius': clad_r}
manifest = {'model': 'Small finite BWR-style square pin-bundle teaching model',
            'geometry': geometry, 'seed': settings.seed, 'openmc_version': openmc.__version__,
            'particles': len(counts), 'states': count,
            'tracks_sha256': hashlib.sha256((RUN/'tracks.h5').read_bytes()).hexdigest(),
            'input_hashes': {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in RUN.glob('*.xml')},
            'units': {'position': 'cm', 'time': 's', 'energy': 'eV', 'up': 'Z'},
            'limitations': 'Cold finite 3x3 bundles with 8x8 rods each; vacuum axial ends; fixed source; '
                           'fission secondaries disabled. No boiling, fluid flow, turbine or power transient is solved. '
                           'Upper vessel, steam equipment, pellet assembly, coolant and heat-flow visuals are illustrative.'}
for filename, obj in [('event.json', event), ('manifest.json', manifest)]:
    (OUT/filename).write_text(json.dumps(obj, separators=(',', ':')))
print(f'Exported {len(counts)} actual neutron tracks, {count} recorded states.')
