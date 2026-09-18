(() => {
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const work = document.querySelector('#work');
  function selectTab(name, focus = false) {
    tabs.forEach(tab => {
      const active = tab.getAttribute('aria-controls') === name;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
      if (active && focus) tab.focus({preventScroll:true});
    });
  }
  tabs.forEach((tab,index) => {
    tab.addEventListener('click', () => {
      const name = tab.getAttribute('aria-controls');
      selectTab(name);
      history.replaceState(null,'',`#${name}`);
    });
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index+1)%tabs.length;
      if (event.key === 'ArrowLeft') next = (index+tabs.length-1)%tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length-1;
      if (next === undefined) return;
      event.preventDefault();
      selectTab(tabs[next].getAttribute('aria-controls'),true);
      history.replaceState(null,'',`#${tabs[next].getAttribute('aria-controls')}`);
    });
  });
  document.querySelectorAll('[data-select-tab]').forEach(link => link.addEventListener('click',event => {
    event.preventDefault();
    const name=link.dataset.selectTab;
    selectTab(name);
    history.pushState(null,'',`#${name}`);
    work.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }));
  function restoreTab() {
    const name=location.hash.slice(1);
    if (!['photography','projects'].includes(name)) return;
    selectTab(name);
    work.scrollIntoView({behavior:'instant'});
  }
  addEventListener('hashchange',restoreTab);
  addEventListener('popstate',restoreTab);
  restoreTab();

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
