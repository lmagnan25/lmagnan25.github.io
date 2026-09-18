"""Reduced interior subchannel: laminar axial flow and thermal entrance heating.

Four quarter rods bound one pitch-sized passage. Open sides are symmetry faces,
not solid walls. This is not a turbulent or two-phase BWR operating calculation.
"""
import hashlib
import json
from pathlib import Path
import numpy as np
from scipy.sparse import lil_matrix, diags
from scipy.sparse.linalg import spsolve, factorized

OUT = Path(__file__).resolve().parents[1] / 'assets/bwr'
PITCH, RADIUS, PE, LENGTH = 1.63, .61, 80., 6.

def solve(n, nz):
    h = 1/n
    q = (np.arange(n)+.5)*h-.5
    x, y = np.meshgrid(q, q, indexing='xy')
    rod = np.zeros((n,n), bool)
    for cx in [-.5,.5]:
        for cy in [-.5,.5]:
            rod |= (x-cx)**2+(y-cy)**2 < (RADIUS/PITCH)**2
    fluid = ~rod
    ids = np.full((n,n), -1, int)
    ids[fluid] = np.arange(fluid.sum())
    count = int(fluid.sum())
    operator = lil_matrix((count,count))
    wall_source = np.zeros(count)
    wall_faces = []
    for iy, ix in zip(*np.where(fluid)):
        k = ids[iy,ix]
        for dy, dx in [(0,1),(0,-1),(1,0),(-1,0)]:
            yy, xx = iy+dy, ix+dx
            if not (0 <= yy < n and 0 <= xx < n):
                continue  # zero normal gradient on the open symmetry faces
            if fluid[yy,xx]:
                j = ids[yy,xx]
                operator[k,k] += 1/h**2
                operator[k,j] -= 1/h**2
            else:
                # Staircase wall: use half-cell distance, not exact curved geometry.
                operator[k,k] += 2/h**2
                wall_source[k] += 2/h**2
                wall_faces.append(k)
    operator = operator.tocsr()
    u = spsolve(operator, np.ones(count))
    momentum_residual = float(np.max(np.abs(operator@u-1)))
    u /= u.mean()
    dz = LENGTH/(nz-1)
    solve_step = factorized((diags(u/dz)+operator.tocsc()/PE).tocsc())
    theta = np.zeros(count)
    field = np.zeros((nz,n,n), dtype='<f4')
    field[:,rod] = 1  # only for interpolation; the renderer masks rod interiors
    residual = 0.
    wall_heat = 0.
    bulk = [0.]
    for iz in range(1,nz):
        previous = theta.copy()
        theta = solve_step(u/dz*theta+wall_source/PE)
        field[iz,fluid] = theta
        residual = max(residual, float(np.max(np.abs(u*(theta-previous)/dz-(wall_source-operator@theta)/PE))))
        # Independently accumulate flux through each discrete heated wall face.
        wall_heat += float(np.sum(2*(1-theta[wall_faces])))*dz/PE
        bulk.append(float(np.sum(u*theta)/np.sum(u)))
    velocity = np.zeros((n,n), dtype='<f4')
    velocity[fluid] = u
    enthalpy_rise = float(np.sum(u*theta)*h*h)
    balance = abs(wall_heat-enthalpy_rise)/enthalpy_rise
    area = count*h*h
    exact_area = 1-np.pi*(RADIUS/PITCH)**2
    symmetry = max(float(np.max(np.abs(velocity-velocity[::-1]))),float(np.max(np.abs(velocity-velocity[:,::-1]))))
    assert field.min() >= -1e-6 and field.max() <= 1+1e-6
    assert u.min() > 0 and np.min(np.diff(bulk)) >= -1e-12
    assert balance < 1e-10 and symmetry < 1e-5
    return field, velocity, {
        'grid': [n,n,nz], 'outlet_mixed_mean_temperature': bulk[-1],
        'peak_to_mean_velocity': float(u.max()), 'fluid_area_pitch_squared': area,
        'analytic_fluid_area_pitch_squared': float(exact_area),
        'area_relative_error': float(abs(area-exact_area)/exact_area),
        'integrated_wall_heat': wall_heat, 'enthalpy_rise': enthalpy_rise,
        'wall_heat_enthalpy_relative_error': balance,
        'velocity_symmetry_error': symmetry, 'momentum_residual': momentum_residual,
        'energy_residual': residual, 'bulk_temperature_monotonic': True,
    }

runs=[]
for n,nz in [(40,192),(64,192),(80,192),(80,384)]:
    field,velocity,checks=solve(n,nz)
    runs.append(checks)
    if (n,nz)==(80,192):
        final_field,final_velocity=field,velocity
transverse_change=abs(runs[2]['outlet_mixed_mean_temperature']-runs[1]['outlet_mixed_mean_temperature'])
axial_change=abs(runs[3]['outlet_mixed_mean_temperature']-runs[2]['outlet_mixed_mean_temperature'])
assert transverse_change < .02 and axial_change < .01
# Half precision retains normalized temperature within 0.000245 and halves payload.
packed=final_field.astype('<f2')
quantization=float(np.max(np.abs(packed.astype('<f4')-final_field)))
assert quantization < .00025
packed.tofile(OUT/'channel-temperature-f16.bin')
final_velocity.tofile(OUT/'channel-velocity.bin')
meta={
    'dimension':[80,80,192], 'order':'x fastest, y, axial z',
    'temperature_file':'channel-temperature-f16.bin', 'temperature_storage':'IEEE754 float16 little endian',
    'velocity_file':'channel-velocity.bin', 'velocity_storage':'float32 little endian',
    'bounds_pitch_units':[[-.5,-.5,0],[.5,.5,LENGTH]], 'pitch_cm':PITCH,
    'rod_radius_cm':RADIUS, 'rod_centers_pitch_units':[[x,y] for x in [-.5,.5] for y in [-.5,.5]],
    'peclet_number':PE, 'peclet_definition':'mean axial speed * rod pitch / thermal diffusivity',
    'temperature':'(T - inlet)/(wall - inlet)', 'velocity':'axial velocity / area-mean axial velocity',
    'boundary_conditions':'No slip and theta=1 on rod arcs; zero normal derivative of u and theta on open symmetry sides; inlet theta=0.',
    'equations':'-laplacian_xy(u)=constant; u*d(theta)/dz=laplacian_xy(theta)/Pe',
    'method':'Cell-centered finite volume; staircase circular boundaries; implicit axial marching.',
    'limitations':'Identical uniformly heated rods; steady, fully developed laminar axial flow and thermal entry. Constant properties; no axial conduction, transverse flow, turbulence, gravity, boiling or feedback. Not BWR operating conditions.',
    'checks':{'resolution_study':runs, 'last_transverse_outlet_change':transverse_change, 'axial_refinement_outlet_change':axial_change, 'max_temperature_quantization_error':quantization},
    'sha256':{f:hashlib.sha256((OUT/f).read_bytes()).hexdigest() for f in ['channel-temperature-f16.bin','channel-velocity.bin']},
}
(OUT/'channel.json').write_text(json.dumps(meta,indent=2)+'\n')
print(json.dumps(meta,indent=2))
