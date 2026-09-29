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
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let requested=!reduced.matches && !navigator.connection?.saveData;
  let visible=false,loaded=false;
  video.controls=false;
  function loadFilm() {
    if (loaded) return;
    loaded=true;
    video.querySelectorAll('source').forEach(source=>{source.src=source.dataset.src;});
    video.load();
  }
  async function sync() {
    if (requested && visible && !document.hidden) {
      loadFilm();
      try { await video.play(); } catch { /* Retain the poster if autoplay is unavailable. */ }
    } else video.pause();
  }
  video.addEventListener('error',()=>{loaded=false;requested=false;});
  reduced.addEventListener('change',()=>{requested=!reduced.matches;sync();});
  document.addEventListener('visibilitychange',sync);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.15}).observe(video);
  sync();
})();
