// Slowly drifting disks exchange spring forces. Exact shared separating planes
// bound the rendered surfaces, allowing soft contact without visible overlap.
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const arenas = [];
  let frame = 0, lastTime = 0, accumulator = 0, elapsed = 0;
  const step = 1 / 120;
  const gap = .8;
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

  function held(body) {
    return body.hovered || (body.element.contains(document.activeElement) && document.activeElement.matches(':focus-visible'));
  }

  function impact(body, nx, ny, speed) {
    if (speed < 4) return;
    body.element.dispatchEvent(new CustomEvent('bubbleimpact', {
      detail:{ x:nx, y:ny, speed },
    }));
  }

  function contain(body, arena, bounce = false) {
    const min = body.radius + 12;
    const maxX = Math.max(min, arena.width - min);
    const maxY = Math.max(min, arena.height - min);
    const x = clamp(body.x, min, maxX), y = clamp(body.y, min, maxY);
    if (bounce) {
      if ((body.x < min && body.vx < 0) || (body.x > maxX && body.vx > 0)) {
        impact(body, body.x < min ? -1 : 1, 0, Math.abs(body.vx));
        body.vx *= -1;
        if (body.cruise) body.cruise.x *= -1;
        body.resume = false;
      }
      if ((body.y < min && body.vy < 0) || (body.y > maxY && body.vy > 0)) {
        impact(body, 0, body.y < min ? -1 : 1, Math.abs(body.vy));
        body.vy *= -1;
        if (body.cruise) body.cruise.y *= -1;
        body.resume = false;
      }
    }
    body.x = x; body.y = y;
  }

  function separate(a, b, bounce = false, dt = step) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const distance = Math.hypot(dx, dy);
    const overlap = a.radius + b.radius + (bounce ? 0 : gap) - distance;
    if (overlap <= 0) return;
    const nx = distance > .001 ? dx / distance : 1;
    const ny = distance > .001 ? dy / distance : 0;
    const invA = bounce && held(a) ? 0 : 1 / (a.radius * a.radius);
    const invB = bounce && held(b) ? 0 : 1 / (b.radius * b.radius);
    const total = invA + invB;
    if (!total) return;
    const soft = a.soft && b.soft;
    const correction = bounce && soft ? Math.max(0, overlap - Math.min(a.radius, b.radius) * .10) : overlap;
    a.x -= nx * correction * invA / total;
    a.y -= ny * correction * invA / total;
    b.x += nx * correction * invB / total;
    b.y += ny * correction * invB / total;
    if (!bounce) return;
    a.colliding = true; b.colliding = true;
    const approach = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
    const impulse = soft
      ? Math.max(0, 22 * overlap - 2.2 * approach) * dt / total
      : Math.max(0, -1.4 * approach) / total;
    if (invA) { a.vx -= impulse * invA * nx; a.vy -= impulse * invA * ny; a.resume = false; }
    if (invB) { b.vx += impulse * invB * nx; b.vy += impulse * invB * ny; b.resume = false; }
    if (!a.touching.has(b.element.id) && approach < -4) {
      impact(a, nx, ny, -approach);
      impact(b, -nx, -ny, -approach);
    }
    a.nextTouching.add(b.element.id); b.nextTouching.add(a.element.id);
  }

  function place(body, arena, alpha = 1) {
    const x = (body.previousX ?? body.x) + (body.x - (body.previousX ?? body.x)) * alpha;
    const y = (body.previousY ?? body.y) + (body.y - (body.previousY ?? body.y)) * alpha;
    body.element.style.transform = `translate3d(${(x - body.size / 2).toFixed(2)}px, ${(arena.top + y - body.size / 2).toFixed(2)}px, 0)`;
    body.drawX = x; body.drawY = y;
  }

  function paint(arena, alpha = 1, endpoint = false) {
    arena.closed.forEach(body => place(body, arena, alpha));
    arena.closed.forEach(body => {
      const planes = [];
      arena.closed.forEach(other => {
        if (other === body) return;
        const dx = other.drawX - body.drawX, dy = other.drawY - body.drawY;
        const distance = Math.max(.001, Math.hypot(dx, dy));
        // Both bubbles use the same power-diagram boundary, calculated from
        // the displayed positions. The 1.2px inset accounts for antialiasing.
        const offset = (distance * distance + body.radius * body.radius - other.radius * other.radius) / (2 * distance);
        planes.push([dx / distance, dy / distance, offset - 1.2, 1]);
      });
      planes.push([-1,0,body.drawX - 12,1], [1,0,arena.width - 12 - body.drawX,1],
        [0,-1,body.drawY - 12,1], [0,1,arena.height - 12 - body.drawY,1]);
      body.element.dispatchEvent(new CustomEvent(endpoint ? 'bubblebarriertargets' : 'bubblebarriers', { detail:planes }));
    });
  }

  function layout(arena, duration = 0) {
    if (reduced.matches) return;
    const { list, bodies } = arena;
    list.classList.add('is-floating');
    const width = list.clientWidth;
    if (!width) return;
    const closed = bodies.filter(body => !body.element.open);
    bodies.forEach(body => {
      const css = getComputedStyle(body.element);
      const natural = parseFloat(css.getPropertyValue('--bubble-size'));
      body.size = Math.min(natural, width * .4) * parseFloat(css.getPropertyValue('--bubble-scale'));
      body.soft = !!body.element.querySelector('.has-bubble-engine');
      body.radius = body.size / 2 - (body.soft ? 6 : 0);
      body.element.style.setProperty('--floating-size', `${body.size}px`);
      if (body.element.open) body.element.style.removeProperty('transform');
    });
    const open = bodies.find(body => body.element.open);
    const openHeight = open ? open.element.offsetHeight : 0;
    const height = width < 520
      ? Math.max(270, closed.length * 140 + 60)
      : Math.max(320, 560 + (closed.length - 3) * 60);
    bodies.forEach((body, index) => {
      if (body.x === null) {
        const narrow = width < 520;
        const positions = narrow
          ? [[.26, .15], [.73, .29], [.27, .48], [.73, .66], [.29, .85]]
          : [[.15, .3], [.5, .21], [.84, .4], [.32, .76], [.69, .78]];
        const point = positions[index % positions.length];
        body.x = width * point[0];
        body.y = height * point[1];
      } else {
        body.x *= width / (arena.width || width);
        body.y *= height / (arena.height || height);
      }
    });
    Object.assign(arena, { width, height, top:openHeight ? openHeight + 28 : 0, openHeight, closed });
    // Repack only on layout changes. Thereafter positions follow the simulation.
    for (let pass = 0; pass < 16; pass++) {
      closed.forEach(body => contain(body, arena));
      for (let i = 0; i < closed.length; i++) {
        for (let j = i + 1; j < closed.length; j++) separate(closed[i], closed[j]);
      }
    }
    closed.forEach(body => {
      contain(body, arena);
      body.previousX = body.x; body.previousY = body.y;
    });
    // Endpoint constraints are stored before a disclosure morph starts. Its
    // final frame can therefore fit the new position without an unclipped gap.
    paint(arena, 1, duration > 0);
    list.style.height = `${arena.top + (closed.length ? height : 0)}px`;
    arena.freezeUntil = performance.now() + duration + 32;
    schedule();
  }

  function simulate(arena, dt, render = true) {
    const bodies = arena.closed;
    bodies.forEach(body => {
      body.previousX = body.x; body.previousY = body.y;
      const isHeld = held(body);
      if (isHeld && !body.wasHeld) body.cruise = { x:body.vx, y:body.vy };
      if (!isHeld && body.wasHeld) body.resume = true;
      body.wasHeld = isHeld;
      if (isHeld) {
        const brake = Math.exp(-20 * dt);
        body.vx *= brake; body.vy *= brake;
      } else if (body.resume && body.cruise) {
        const recovery = 1 - Math.exp(-5 * dt);
        body.vx += (body.cruise.x - body.vx) * recovery;
        body.vy += (body.cruise.y - body.vy) * recovery;
        if (Math.hypot(body.cruise.x - body.vx, body.cruise.y - body.vy) < .05) body.resume = false;
      } else if (!body.colliding) {
        const speed = Math.hypot(body.vx, body.vy);
        const target = clamp(speed, 9, 15);
        const eased = speed + (target - speed) * (1 - Math.exp(-.3 * dt));
        if (speed > .001) { body.vx *= eased / speed; body.vy *= eased / speed; }
        body.vx += Math.sin(elapsed * .13 + body.phase) * .12 * dt;
        body.vy += Math.cos(elapsed * .11 + body.phase) * .12 * dt;
      }
      body.colliding = false;
      body.nextTouching = new Set();
      body.x += body.vx * dt;
      body.y += body.vy * dt;
    });
    bodies.forEach(body => contain(body, arena, true));
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) separate(bodies[i], bodies[j], true, dt);
    }
    bodies.forEach(body => { body.touching = body.nextTouching; });
    if (render) paint(arena);
  }

  function schedule() {
    if (frame || reduced.matches || document.hidden || !arenas.some(arena => arena.visible)) return;
    lastTime = performance.now();
    accumulator = 0;
    frame = requestAnimationFrame(tick);
  }

  function tick(now) {
    frame = 0;
    if (reduced.matches || document.hidden) return;
    const dt = Math.min(Math.max((now - lastTime) / 1000, 0), .05);
    lastTime = now;
    accumulator += dt;
    while (accumulator >= step) {
      elapsed += step;
      arenas.forEach(arena => {
        if (arena.visible && now >= arena.freezeUntil) simulate(arena, step, false);
      });
      accumulator -= step;
    }
    let active = false;
    arenas.forEach(arena => {
      if (!arena.visible) return;
      active = true;
      if (now >= arena.freezeUntil) paint(arena, accumulator / step);
    });
    if (active) frame = requestAnimationFrame(tick);
  }

  const visible = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const arena = arenas.find(item => item.list === entry.target);
      if (arena) arena.visible = entry.isIntersecting;
    });
    schedule();
  }, { rootMargin:'80px' });

  document.querySelectorAll('.bubble-list').forEach((list, section) => {
    const bodies = [...list.querySelectorAll('.work-bubble')].map((element, index) => ({
      element, x:null, y:null, size:0, radius:0, hovered:false,
      wasHeld:false, resume:false, cruise:null,
      colliding:false, touching:new Set(), nextTouching:new Set(), phase:index * 1.8,
      vx:[10, -11, 9][index % 3], vy:[7, -6, 8][index % 3],
    }));
    const arena = { list, bodies, closed:[], width:0, height:0, top:0, openHeight:0, visible:false, freezeUntil:0 };
    arenas.push(arena);
    bodies.forEach(body => {
      body.element.addEventListener('bubblerendererchange', () => {
        list.dispatchEvent(new Event('bubblecanceltransition'));
        layout(arena);
        bodies.forEach(item => item.element.dispatchEvent(new Event('bubblesettle')));
      });
      body.element.addEventListener('pointerenter', event => {
        if (event.pointerType !== 'touch') body.hovered = true;
      });
      body.element.addEventListener('pointerleave', () => { body.hovered = false; });
    });
    list.addEventListener('bubblelayout', event => layout(arena, event.detail.duration));
    const resize = new ResizeObserver(() => {
      if (reduced.matches) return;
      const open = bodies.find(body => body.element.open);
      const openHeight = open ? open.element.offsetHeight : 0;
      if (Math.abs(list.clientWidth - arena.width) > .5 || openHeight !== arena.openHeight) {
        layout(arena);
        bodies.forEach(body => body.element.dispatchEvent(new Event('bubblesettle')));
      }
    });
    resize.observe(list);
    bodies.forEach(body => resize.observe(body.element));
    layout(arena);
    visible.observe(list);
  });

  addEventListener('resize', () => arenas.forEach(arena => layout(arena)));
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(frame); frame = 0;
    schedule();
  });
  reduced.addEventListener('change', () => {
    cancelAnimationFrame(frame); frame = 0;
    arenas.forEach(arena => {
      if (reduced.matches) {
        arena.list.classList.remove('is-floating');
        arena.list.style.removeProperty('height');
        arena.bodies.forEach(body => body.element.style.removeProperty('transform'));
      } else layout(arena);
      arena.bodies.forEach(body => body.element.dispatchEvent(new Event('bubblesettle')));
    });
    schedule();
  });
})();
