// Procedural soap-film contours in CSS-pixel space. No scaled texture: the rim
// is recalculated as the boundary changes dimensions; HTML remains independent.
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const states = new Map();
  const padding = 60;
  const MODES = 16;
  let frame = 0, lastTime = 0, elapsed = 0;
  const vertex = `
    attribute vec2 position;
    varying vec2 uv;
    void main() { uv = position * .5 + .5; gl_Position = vec4(position, 0., 1.); }
  `;
  const fragment = `
    precision highp float;
    varying vec2 uv;
    uniform vec2 resolution;
    uniform vec4 shape;
    uniform vec2 harm[8];
    uniform float exponent;
    uniform float phase;
    uniform float seed;
    uniform float time;
    uniform vec4 character;
    uniform float waveInset;
    uniform vec4 barriers[8];
    uniform float barrierRelease;

    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p), u = f * f * (3. - 2. * f);
      return mix(mix(hash(i), hash(i + vec2(1., 0.)), u.x),
                 mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), u.x), u.y);
    }
    float fbm(vec2 p) {
      float v = 0., a = .5;
      for (int i = 0; i < 4; i++) { v += a * noise(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p; a *= .5; }
      return v;
    }
    // Soap-film interference: reflectance of a water film of thickness h (nm),
    // integrated over eleven wavelengths with CIE-derived sRGB weights.
    vec3 film(float h, float cosT) {
      float k = 4. * 3.14159 * 1.33 * h * cosT;
      vec3 c = vec3(0.);
      c += vec3(.0055,-.0047,.0336) * pow(sin(k / 405.), 2.);
      c += vec3(.0487,-.0620,.4921) * pow(sin(k / 434.), 2.);
      c += vec3(-.0143,-.0172,.4829) * pow(sin(k / 463.), 2.);
      c += vec3(-.1122,.1227,.1133) * pow(sin(k / 492.), 2.);
      c += vec3(-.2069,.3680,-.0172) * pow(sin(k / 521.), 2.);
      c += vec3(-.0291,.4117,-.0487) * pow(sin(k / 550.), 2.);
      c += vec3(.3618,.2206,-.0370) * pow(sin(k / 579.), 2.);
      c += vec3(.5692,.0001,-.0146) * pow(sin(k / 608.), 2.);
      c += vec3(.3094,-.0350,-.0035) * pow(sin(k / 637.), 2.);
      c += vec3(.0633,-.0050,-.0010) * pow(sin(k / 666.), 2.);
      c += vec3(.0047,.0008,-.0002) * pow(sin(k / 695.), 2.);
      return max(c * 2., 0.);
    }
    // The only light is a faint studio backdrop, strongest at grazing angles,
    // which draws the thin iridescent outline.
    float environment(vec3 r) {
      float backdrop = .04 + .3 * pow(clamp(-r.z, 0., 1.), 3.) + .07 * clamp(-r.y, 0., 1.);
      return backdrop;
    }
    // Slow surface oscillations bend against shared contact boundaries.
    // The expanded reading panel uses the same iridescent material.
    float membrane(vec2 p) {
      vec2 halfSize = max(shape.zw * .5 - 7., vec2(1.));
      vec2 q = p / halfSize;
      vec2 ab = max(abs(q), vec2(.0001));
      float field = pow(ab.x, exponent) + pow(ab.y, exponent) - 1.;
      vec2 gradient = exponent * pow(ab, vec2(exponent - 1.)) / halfSize;
      float t = pow(field + 1., 1. / exponent);
      float radial = t < .02 ? 1e4 : length(p) * (1. / t - 1.);
      float approx = -field / max(length(gradient), .0001);
      float inside = field < 0. ? min(radial, approx) : approx;
      float a = atan(q.y, q.x) - phase;
      float wave = 0.;
      for (int i = 0; i < 8; i++) {
        float n = float(i + 2);
        wave += harm[i].x * cos(n * a) + harm[i].y * sin(n * a);
      }
      inside += wave - waveInset;
      // These planes partition the visible space. They use the same displayed
      // centers as the HTML, so neighboring membranes cannot cross each other.
      for (int i = 0; i < 8; i++) {
        if (barriers[i].w > .5) {
          float plane = barriers[i].z + barrierRelease - dot(p, barriers[i].xy);
          float blend = max(3. - abs(inside - plane), 0.) / 3.;
          inside = min(inside, plane) - blend * blend * .75;
        }
      }
      return inside;
    }
    void main() {
      vec2 p = vec2(uv.x, 1. - uv.y) * resolution - shape.xy;
      vec2 halfSize = max(shape.zw * .5 - 7., vec2(1.));
      float inside = membrane(p);
      if (inside < -2.) { gl_FragColor = vec4(0.); return; }

      // A sphere when closed; a softly bevelled pillow when open. The bevel is in
      // pixels, so the rim keeps its optical width however large the panel grows.
      float openness = clamp((exponent - 2.) / .9, 0., 1.);
      float minHalf = min(halfSize.x, halfSize.y);
      float bevel = mix(minHalf, min(minHalf, 42.), openness);
      if (inside > .6 * bevel) { gl_FragColor = vec4(0.); return; }
      float s = clamp(inside / bevel, 0., 1.);
      float nz = sqrt(max(1. - (1. - s) * (1. - s), 0.));
      vec2 e = vec2(.75, 0.);
      vec2 gradient = vec2(membrane(p - e.xy) - membrane(p + e.xy), membrane(p - e.yx) - membrane(p + e.yx));
      vec2 outward = normalize(gradient + vec2(1e-6));
      vec3 n = vec3(outward * sqrt(max(1. - nz * nz, 0.)), nz);

      // Front reflection, and the inverted image from the inside of the far wall.
      vec3 front = vec3(2. * nz * n.xy, 2. * nz * nz - 1.);
      vec3 back = vec3(-front.xy, front.z);

      // Film thickness in nm: each bubble has its own age, drainage and swirl.
      float c = cos(phase), sn = sin(phase);
      vec2 fp = mat2(c, -sn, sn, c) * p / character.w;
      vec2 warp = vec2(fbm(fp + vec2(seed, time * .05)), fbm(fp + vec2(5.2 - time * .04, seed)));
      float swirl = fbm(fp * .8 + warp * 1.8 + seed);
      float drain = clamp(.5 + p.y / (2. * halfSize.y), 0., 1.);
      float h = max(character.x + 320. * openness + character.y * (drain - .5) + character.z * (swirl - .5), 60.);
      float cosT = sqrt(1. - (1. - nz * nz) / 1.769);
      vec3 tint = film(h, cosT);
      tint = mix(tint, vec3(1.), pow(1. - nz, 4.) * .4);

      float fresnel = pow(1. - nz, 5.);
      vec3 light = tint * fresnel * (environment(front) + environment(back) * .5 * (1. - openness))
        + tint * pow(1. - nz, 4.) * .5 * openness;
      // The rim's glare fades inward across the outer fifth of the bubble.
      float glowWidth = mix(.2 * minHalf, 24., openness);
      float glow = pow(clamp(1. - inside / glowWidth, 0., 1.), 1.6);
      light += tint * glow * .2;
      // A soft glossy glint near the upper-left rim, mirrored faintly lower right.
      vec3 glintDir = normalize(vec3(-.6, -.66, -.3));
      float glint = exp(-pow(length(front - glintDir) / .34, 2.))
        + .35 * exp(-pow(length(back - glintDir) / .42, 2.)) * (1. - openness);
      light += mix(tint, vec3(1.), .55) * glint * .5;
      light = 1. - exp(-light * 1.3);
      float edge = smoothstep(-.9, .9, inside);
      light *= edge;
      gl_FragColor = vec4(light, clamp(max(light.r, max(light.g, light.b)), 0., 1.));
    }
  `;

  function compile(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      throw new Error('Bubble shader compilation failed');
    }
    return shader;
  }

  function initialize(state) {
    const { gl } = state;
    const program = gl.createProgram();
    const shaders = [compile(gl, gl.VERTEX_SHADER, vertex), compile(gl, gl.FRAGMENT_SHADER, fragment)];
    shaders.forEach(shader => gl.attachShader(program, shader));
    gl.linkProgram(program);
    shaders.forEach(shader => gl.deleteShader(shader));
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Bubble program linking failed');
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    state.uniforms = Object.fromEntries(['resolution','shape','harm','waveInset','barriers','barrierRelease','exponent','phase','seed','time','character']
      .map(name => [name, gl.getUniformLocation(program, name)]));
    state.ready = true;
    fit(state);
    state.surface.classList.add('has-bubble-engine');
    state.bubble.dispatchEvent(new Event('bubblerendererchange'));
    schedule();
  }

  function sizeCanvas(state, left, top, width, height) {
    const { canvas, gl } = state;
    const density = Math.min(devicePixelRatio || 1, 2, 2048 / Math.max(width, height));
    Object.assign(canvas.style, { left:`${left}px`, top:`${top}px`, width:`${width}px`, height:`${height}px` });
    canvas.width = Math.max(1, Math.round(width * density));
    canvas.height = Math.max(1, Math.round(height * density));
    state.resolution = [width, height];
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  function shapeExponent(open, width) {
    return open ? (width < 500 ? 3.5 : 2.9) : 2;
  }

  function fit(state) {
    if (!state.ready || state.morph) return;
    const { width, height } = state.bubble.getBoundingClientRect();
    sizeCanvas(state, -padding, -padding, width + padding * 2, height + padding * 2);
    state.shape = [width / 2 + padding, height / 2 + padding, width, height];
    state.exponent = shapeExponent(state.bubble.open, width);
    state.barriers.set(state.bubble.open ? emptyBarriers : state.targetBarriers);
    draw(state);
  }

  function draw(state) {
    if (!state.ready) return;
    const { gl, uniforms } = state;
    gl.uniform2fv(uniforms.resolution, state.resolution);
    gl.uniform4fv(uniforms.shape, state.shape);
    const still = reduced.matches;
    const openness = Math.max(0, Math.min(1, (state.exponent - 2) / .9));
    let amplitude = 0;
    for (let k = 0; k < MODES; k += 2) amplitude += Math.hypot(state.modes[k], state.modes[k + 1]);
    const limit = Math.min(7, Math.min(state.shape[2], state.shape[3]) * .035);
    const scale = amplitude > .0001 ? limit * Math.tanh(amplitude / limit) / amplitude : 1;
    for (let k = 0; k < MODES; k++) state.renderModes[k] = state.modes[k] * scale;
    gl.uniform2fv(uniforms.harm, still ? zeros : state.renderModes);
    gl.uniform1f(uniforms.waveInset, still ? 0 : amplitude * scale * .08 * (1 - openness));
    gl.uniform4fv(uniforms.barriers, still ? emptyBarriers : state.barriers);
    gl.uniform1f(uniforms.barrierRelease, state.morph ? state.morph.release : 0);
    gl.uniform1f(uniforms.exponent, state.exponent);
    gl.uniform1f(uniforms.phase, state.seed + (reduced.matches ? 0 : elapsed * state.spin));
    gl.uniform1f(uniforms.seed, state.seed);
    gl.uniform4fv(uniforms.character, state.character);
    gl.uniform1f(uniforms.time, reduced.matches ? 0 : elapsed + state.seed * 10);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  const zeros = new Float32Array(MODES);
  const emptyBarriers = new Float32Array(32);
  // A damped oscillator replaces the randomly forced liquid simulation.
  // Slow low modes keep a little movement even between contacts.
  // Collisions add velocity to the low-frequency modes; they then ring down.
  function simulate(state, dt) {
    const openness = Math.max(0, Math.min(1, (state.exponent - 2) / .9));
    const quiet = 1 - .8 * openness;
    for (let k = 0; k < MODES; k++) {
      const order = (k >> 1) + 2;
      const amplitude = k < 2 ? 2.4 : k < 4 ? .7 : 0;
      const target = amplitude * quiet * Math.sin(elapsed * (.28 + k * .021) + state.seed + k * 1.7);
      const omega = 3.8 * Math.sqrt(order / 2);
      const damping = .25 + openness * .4;
      state.velocity[k] += ((target - state.modes[k]) * omega * omega - 2 * damping * omega * state.velocity[k]) * dt;
      state.modes[k] += state.velocity[k] * dt;
    }
  }

  function morph(state, detail) {
    if (!state.ready) return;
    // A second click starts from the currently drawn boundary, not an endpoint.
    const interrupted = state.morph ? {
      left:detail.from.left + parseFloat(state.canvas.style.left) + state.shape[0] - state.shape[2] / 2,
      top:detail.from.top + parseFloat(state.canvas.style.top) + state.shape[1] - state.shape[3] / 2,
      width:state.shape[2], height:state.shape[3], open:detail.from.open,
    } : null;
    const previousExponent = state.exponent;
    const previousRelease = state.morph ? state.morph.release : 0;
    state.morph = null;
    if (reduced.matches || !detail.duration) { fit(state); return; }
    const from = interrupted || detail.from, to = detail.to;
    const x = from.left - to.left, y = from.top - to.top;
    const left = Math.min(x, 0) - padding, top = Math.min(y, 0) - padding;
    sizeCanvas(state, left, top,
      Math.max(x + from.width, to.width) - left + padding,
      Math.max(y + from.height, to.height) - top + padding);
    state.morph = {
      start:performance.now(), duration:detail.duration,
      from:[x + from.width / 2 - left, y + from.height / 2 - top, from.width, from.height],
      to:[to.width / 2 - left, to.height / 2 - top, to.width, to.height],
      fromExponent:interrupted ? previousExponent : shapeExponent(from.open, from.width),
      toExponent:shapeExponent(to.open, to.width),
      release:previousRelease, fromRelease:previousRelease,
      maxRelease:Math.max(from.width, from.height, to.width, to.height) * 4,
    };
    state.shape = state.morph.from;
    state.exponent = state.morph.fromExponent;
    if (from.open !== to.open) {
      state.velocity[0] += to.open ? 4 : -4;
    }
    draw(state);
    schedule();
  }

  function schedule() {
    if (!frame && !document.hidden && !reduced.matches && [...states.values()].some(s => s.ready && (s.morph || s.visible))) {
      lastTime = performance.now();
      frame = requestAnimationFrame(tick);
    }
  }

  function tick(now) {
    frame = 0;
    if (document.hidden || reduced.matches) return;
    const dt = Math.max(0, Math.min((now - lastTime) / 1000, .032));
    lastTime = now;
    elapsed += dt;
    let active = false;
    for (const state of states.values()) {
      if (!state.ready || (!state.morph && !state.visible)) continue;
      active = true;
      if (state.morph) {
        const m = state.morph, t = Math.min(1, (now - m.start) / m.duration);
        m.progress = t;
        const ease = 1 - Math.pow(1 - t, 4);
        if (!state.bubble.open && t >= .5) {
          state.barriers.set(state.targetBarriers);
          m.release = m.maxRelease * Math.pow(2 * (1 - t), 4);
        } else {
          const releaseEase = 1 - Math.pow(1 - Math.min(1, t * 2), 4);
          m.release = m.fromRelease + (m.maxRelease - m.fromRelease) * releaseEase;
        }
        // Width leads height a little, like a membrane finding its new volume.
        state.shape = m.from.map((value, i) => value + (m.to[i] - value) * (i === 3 ? 1 - Math.pow(1 - t, 3.2) : ease));
        state.exponent = m.fromExponent + (m.toExponent - m.fromExponent) * ease;
        if (t === 1) { state.morph = null; fit(state); }
      }
      state.phase = state.seed + elapsed * state.spin;
      const steps = Math.max(1, Math.ceil(dt / .012));
      for (let i = 0; i < steps; i++) simulate(state, dt / steps);
      if (!state.positioned || state.morph || state.bubble.open) draw(state);
    }
    if (active) frame = requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const state = states.get(entry.target);
      state.visible = entry.isIntersecting;
      if (state.visible) draw(state);
    });
    schedule();
  }, { rootMargin:'60px' });

  document.querySelectorAll('.work-bubble').forEach((bubble, index) => {
    const surface = bubble.querySelector('.bubble-surface');
    const canvas = document.createElement('canvas');
    canvas.className = 'bubble-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    surface.append(canvas);
    const gl = canvas.getContext('webgl', { alpha:true, premultipliedAlpha:true, antialias:false, depth:false, stencil:false, powerPreference:'low-power' });
    if (!gl) { canvas.remove(); return; }
    const state = {
      bubble, surface, canvas, gl, ready:false, visible:false, morph:null,
      seed:[.3,2.6,4.8,1.5,5.7,3.4][index % 6],
      speed:[.87,.68,.76,.63,.81,.71][index % 6],
      spin:[.075,-.061,.055,-.072,.065,-.05][index % 6],
      // Film age: base thickness, drainage, swirl depth (nm) and swirl scale (px).
      character:[[600,500,440,64],[620,520,460,60],[580,540,420,72],[640,480,480,56],[560,520,380,70],[610,500,450,66]][index % 6],
      modes:new Float32Array(MODES), renderModes:new Float32Array(MODES), velocity:new Float32Array(MODES), phase:0,
      barriers:new Float32Array(32), targetBarriers:new Float32Array(32), positioned:false,

    };
    states.set(bubble, state);
    try { initialize(state); } catch { state.ready = false; }
    observer.observe(bubble);
    new ResizeObserver(() => fit(state)).observe(bubble);
    bubble.addEventListener('bubblemorph', event => morph(state, event.detail));
    bubble.addEventListener('bubblesettle', () => { state.morph = null; fit(state); });
    function storeTargets(event) {
      state.targetBarriers.fill(0);
      event.detail.slice(0,8).forEach((plane, index) => state.targetBarriers.set(plane, index * 4));
    }
    bubble.addEventListener('bubblebarriertargets', storeTargets);
    bubble.addEventListener('bubblebarriers', event => {
      storeTargets(event);
      if (state.morph || bubble.open) return;
      state.barriers.set(state.targetBarriers);
      state.positioned = true;
      // Draw after all positions are applied: no one-frame lag between the
      // collision plane and the visible membrane.
      if (state.visible) draw(state);
    });
    bubble.addEventListener('bubbleimpact', event => {
      if (reduced.matches || bubble.open || state.morph) return;
      const { x, y, speed } = event.detail;
      const angle = Math.atan2(y, x) - state.phase;
      const kick = Math.min(25, speed * 1.3);
      state.velocity[0] -= Math.cos(2 * angle) * kick;
      state.velocity[1] -= Math.sin(2 * angle) * kick;
      state.velocity[2] -= Math.cos(3 * angle) * kick * .12;
      state.velocity[3] -= Math.sin(3 * angle) * kick * .12;
      schedule();
    });
    canvas.addEventListener('webglcontextlost', event => {
      event.preventDefault(); state.ready = false; state.morph = null;
      surface.classList.remove('has-bubble-engine');
      bubble.dispatchEvent(new Event('bubblerendererchange'));
    });
    canvas.addEventListener('webglcontextrestored', () => {
      try { initialize(state); } catch { state.ready = false; }
    });
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else schedule();
  });
  reduced.addEventListener('change', () => {
    cancelAnimationFrame(frame); frame = 0;
    states.forEach(state => {
      state.morph = null;
      state.modes.fill(0); state.velocity.fill(0);
      fit(state);
    });
    schedule();
  });
})();
