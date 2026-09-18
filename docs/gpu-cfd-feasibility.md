# Bounded two-phase GPU feasibility probe

Date: 17 September 2026. This test concerns numerical execution on the user's M4 Pro (20-core GPU, 24 GB shared memory). It is not water/steam or BWR validation, and none of its output is integrated into the website.

## Source and physics

The test uses the author's dense `2phase/lbm_solver_3d_2phase.py` from [Taichi-LBM3D](https://github.com/yjhp1016/taichi_LBM3D), commit `fe49e3f609b2038cbf93c8bd453ffc5c2bf98e4c`. The downloaded file SHA-256 is `c4b428224d648e0abc421b3a38979910684cc35af417ba3096d6240323323952`; the original source and MIT license are preserved in `simulation/gpu-two-phase/`.

This is a D3Q19 color-gradient MRT lattice-Boltzmann model: the evolving phase field alters interfacial stress in momentum collision, and computed velocity transports the two colors. It is a genuine coupled immiscible two-fluid model, not a prescribed sphere animation. The [author paper](https://www.mdpi.com/2311-5521/7/8/270) reports numerical benchmark cases and Metal execution on an AMD Radeon Pro 5300. That published result is separate from this local probe.

The selected implementation has equal reference phase densities. It has no energy equation, latent heat, phase-change mass transfer, saturation-pressure model, or wall nucleation prediction. Its generic `CapA` parameter is retained; this probe does not assume it equals a dimensional surface-tension coefficient.

## Local test

- Python: project `.venv-cfd/bin/python`, Python 3.13.2, Taichi 1.7.4.
- Backend requested explicitly: `ti.metal`, `enable_fallback=False`, `f32`.
- Dense 32 × 32 × 32 grid; periodic boundaries in all directions.
- Centered spherical red inclusion, nominal radius 8 lattice cells; initial phase `tanh((8-r)/1)`.
- No solids, body force, gravity, imposed flow, thermal field, or phase change.
- Both kinematic viscosities 0.1, original `CapA=0.005`.
- 400 steps; diagnostic snapshots at 0, 1, 50, 100, 200, and 400. This is a short stationary-droplet relaxation probe, not a demonstrated equilibrium solution.

## Minimal changes

`prepare_probe.py` reproducibly derives the test script from the preserved upstream source. Numerical kernels are unchanged. It replaces the original 131³ porous geometry/file-input case and 80,001-step VTK-export loop with the small generated periodic droplet and headless diagnostic harness; removes the unused VTK import; selects Metal and zero force; and disables the phase inlet so every face is periodic.

The first run failed during upload of NumPy's default double-precision inverse matrix: Metal reported `Type f64 not supported`. The compatibility fix casts the host moment matrices to `np.float32` and the opposite-direction index array to `np.int32` before uploading. The original failure is preserved in `initial-f64-failure.log`. The matrix inverse itself is still computed on the CPU before conversion.

One upstream source concern is deliberately preserved rather than silently repaired: the phase update is written as `rho_r - rho_b / (rho_r + rho_b)`, not `(rho_r - rho_b) / (rho_r + rho_b)`. These coincide when the color-density sum equals one, but can diverge with drift. Diagnostics report actual red and blue sums as well as phase bounds. This, variable-density capability, and wall treatments would need a separate numerical audit before using the source for an engineering case.

## Reproduce

From the Website project directory:

```sh
.venv-cfd/bin/python simulation/gpu-two-phase/prepare_probe.py
.venv-cfd/bin/python -u simulation/gpu-two-phase/dense_metal_probe.py
```

The run writes `result.json` and `final_state.npz` under `simulation/gpu-two-phase/`. The saved `run.log` contains the backend announcement and intermediate measurements. Host diagnostics sum masses in float64; the numerical evolution itself uses Metal float32. Pressure diagnostics use bulk `p=rho/3` away from the interface. A single measured pressure jump is a sign/sanity check; without a calibrated surface-tension mapping and resolution sweep, it is not a Laplace-law validation.

## Result

**GPU execution feasibility passed; engineering/boiling validation was not attempted and is not established.** The unchanged numerical kernels completed all 400 steps on `Arch.metal`, with CPU fallback disabled. All sampled macroscopic output and all saved final arrays are finite. No solver rewrite was required.

| Measurement | Result |
| --- | --- |
| First step, including collision/streaming kernel compilation | 121.406 s |
| Remaining 399 steps, including sampled host diagnostics | 0.608 s |
| Red phase mass change | +0.0006346% |
| Blue phase mass change | +0.0006828% |
| Final bulk pressure inside minus outside | +0.00127989 lattice units |
| Final maximum speed | 0.00049949 lattice cells/step |
| Final RMS speed | 0.00008586 lattice cells/step |
| Red center displacement from initialization | Less than 0.000023 lattice cells |
| Red-mass equivalent radius | 8.101534 → 8.101551 lattice cells |
| Cells with positive phase | 2,176 → 2,224 |
| Final phase range | -1.003306 to +1.015804 |

The inclusion remained centered, retained nearly constant color mass, and developed a positive interior pressure relative to the exterior, consistent with a capillary response. Residual velocities and a changing thresholded interface remain. **The phase variable overshoots its nominal [-1,1] range**, so this is not a clean bounded-interface validation. No parameter tuning, clipping, or numerical-kernel repairs were applied to conceal that behavior.

The very short timed execution is a 32³ microcase after a two-minute JIT compilation. It includes diagnostics, is not a rigorous throughput benchmark, and must not be extrapolated to full channel geometry, high density ratios, small bubbles, or thermal phase change.

## Recommendation

The user's Apple GPU is demonstrably capable of executing an existing genuine two-fluid numerical model. The next scientific step is not website integration of these equal-density snapshots. It is an explicitly scoped solver choice with the required density contrast and benchmark checks (including interface bounds, mass conservation, pressure/curvature, and rising-bubble dynamics). Heat-driven vapor generation additionally requires an energy/latent-heat/interfacial mass-transfer model and its own tests. This probe does not establish those capabilities.
