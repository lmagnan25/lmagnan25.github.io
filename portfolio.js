(() => {
  // Preserve links to the old tab layout without leaving visitors at the top.
  function restoreWorkLink() {
    if (!['#projects', '#research'].includes(location.hash)) return;
    history.replaceState(null, '', `${location.pathname}${location.search}#work`);
    document.querySelector('#work').scrollIntoView({ behavior:'instant' });
  }
  addEventListener('hashchange', restoreWorkLink);
  restoreWorkLink();

  const video=document.querySelector('#reactor-film');
  const toggle=document.querySelector('#film-toggle');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let requested=!reduced.matches && !navigator.connection?.saveData;
  let visible=false,loaded=false;
  video.controls=false;
  toggle.hidden=false;
  function loadFilm() {
    if (loaded) return;
    loaded=true;
    video.querySelectorAll('source').forEach(source=>{source.src=source.dataset.src;});
    video.load();
  }
  function label() {
    const playing=!video.paused;
    toggle.innerHTML=playing?'Pause <span aria-hidden="true">Ⅱ</span>':'Play <span aria-hidden="true">▶</span>';
    toggle.setAttribute('aria-label',playing?'Pause reactor film':'Play reactor film');
  }
  async function sync() {
    if (requested && visible && !document.hidden) {
      loadFilm();
      try { await video.play(); } catch { label(); }
    } else video.pause();
  }
  toggle.addEventListener('click',()=>{requested=video.paused;sync();});
  video.addEventListener('play',label);
  video.addEventListener('pause',label);
  video.addEventListener('error',()=>{toggle.textContent='Retry';toggle.setAttribute('aria-label','Retry reactor film');loaded=false;requested=false;});
  reduced.addEventListener('change',()=>{requested=!reduced.matches;sync();});
  document.addEventListener('visibilitychange',sync);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.15}).observe(video);
  label();sync();
})();
