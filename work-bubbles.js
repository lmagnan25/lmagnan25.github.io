(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const duration = 760;
  const easing = 'cubic-bezier(.16, 1, .3, 1)';
  let interaction = 0;
  document.querySelectorAll('.bubble-list').forEach(list => {
    const bubbles = [...list.querySelectorAll('.work-bubble')];
    const labels = bubbles.flatMap(bubble => [...bubble.querySelectorAll('.bubble-title, .bubble-action')]);
    let animations = [];
    let revision = 0;
    function settle(geometry = true) {
      animations.forEach(animation => animation.finish());
      animations = [];
      if (geometry) bubbles.forEach(bubble => bubble.dispatchEvent(new Event('bubblesettle')));
    }
    function bounds(bubble) {
      const { left, top, width, height } = bubble.getBoundingClientRect();
      return { left, top, width, height, open:bubble.open };
    }
    list.addEventListener('bubblecanceltransition', () => {
      revision++;
      settle(false);
    });
    function setExpanded(bubble, expanded) {
      const beforeHeight = list.getBoundingClientRect().height;
      const positions = new Map(labels.map(label => [label, label.getBoundingClientRect()]));
      settle(false);
      const currentRevision = ++revision;
      const currentInteraction = ++interaction;
      const shapes = new Map(bubbles.map(item => [item, bounds(item)]));
      bubbles.forEach(item => { item.open = item === bubble && expanded; });
      const animate = !reduced.matches && typeof list.animate === 'function';
      list.dispatchEvent(new CustomEvent('bubblelayout', { detail:{ duration:animate ? duration : 0 } }));
      const afterHeight = list.getBoundingClientRect().height;
      // Only the membrane changes shape. Nothing in the content tree is scaled.
      bubbles.forEach(item => item.dispatchEvent(new CustomEvent('bubblemorph', {
        detail:{ from:shapes.get(item), to:bounds(item), duration:animate ? duration : 0 },
      })));
      if (animate) {
        labels.forEach(label => {
          const previous = positions.get(label), next = label.getBoundingClientRect();
          animations.push(label.animate([
            { transform:`translate(${previous.left - next.left}px, ${previous.top - next.top}px)` },
            { transform:'none' },
          ], { duration, easing }));
        });
        animations.push(list.animate([
          { height:`${beforeHeight}px` }, { height:`${afterHeight}px` },
        ], { duration, easing }));
        if (expanded) animations.push(bubble.querySelector('.bubble-content').animate([
          { opacity:0 }, { opacity:1 },
        ], { duration:320, delay:260, easing:'ease-out', fill:'backwards' }));
      }
      Promise.allSettled(animations.map(animation => animation.finished)).then(() => {
        if (currentRevision !== revision) return;
        animations = [];
        // Closing never automatically scrolls the reader back up the section.
        if (expanded && currentInteraction === interaction) {
          const heading = bubble.querySelector('.bubble-title').getBoundingClientRect();
          if (heading.top < 24 || heading.bottom > innerHeight - 24) {
            bubble.scrollIntoView({ block:'start', behavior:reduced.matches ? 'instant' : 'smooth' });
          }
        }
      });
    }
    bubbles.forEach(bubble => {
      const summary = bubble.querySelector('summary');
      summary.addEventListener('click', event => {
        event.preventDefault(); setExpanded(bubble, !bubble.open);
      });
      bubble.addEventListener('keydown', event => {
        if (event.key !== 'Escape' || !bubble.open) return;
        event.preventDefault(); setExpanded(bubble, false);
        summary.focus({ preventScroll:true });
      });
    });
    addEventListener('resize', settle);
    reduced.addEventListener('change', settle);
  });
})();
