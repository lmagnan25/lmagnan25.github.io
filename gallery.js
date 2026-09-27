(() => {
  const viewer = document.querySelector('#photo-viewer');
  const links = Array.from(document.querySelectorAll('.photo-link'));
  if (!viewer || !links.length || typeof viewer.showModal !== 'function') return;
  let photos = links;

  const frame = viewer.querySelector('.viewer-frame');
  const fullImage = viewer.querySelector('.viewer-image');
  const status = viewer.querySelector('.viewer-status');
  const close = viewer.querySelector('.viewer-close');
  const stage = viewer.querySelector('.viewer-stage');
  let current = 0;
  let renderRevision = 0;
  let opener;
  let touchStart = null;

  function render(index) {
    const revision = ++renderRevision;
    current = (index + photos.length) % photos.length;
    const photo = photos[current];
    const thumbnail = photo.querySelector('img');
    const title = photo.dataset.title;
    frame.classList.toggle('screenshot', photo.classList.contains('screenshot'));
    frame.classList.toggle('figure-on-white', photo.classList.contains('figure-on-white'));
    fullImage.alt = thumbnail.alt;
    // Set the small, already-decoded preview immediately; upgrade it in place.
    fullImage.src = thumbnail.currentSrc || thumbnail.src;
    const highResolution = new Image();
    highResolution.onload = () => {
      if (revision === renderRevision && viewer.open) fullImage.src = highResolution.src;
    };
    highResolution.src = photo.href;
    status.textContent = `${current + 1} of ${photos.length}: ${title}`;
    // One adjacent image is enough to make browsing feel immediate.
    const next = new Image();
    next.src = photos[(current + 1) % photos.length].href;
  }

  links.forEach(photo => {
    photo.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const group = photo.closest('[data-gallery]');
      photos = links.filter(link => link.closest('[data-gallery]') === group);
      const index = photos.indexOf(photo);
      opener = photo;
      viewer.setAttribute('aria-label', group?.dataset.gallery || 'Photo viewer');
      close.setAttribute('aria-label', group ? 'Close image viewer' : 'Close photo viewer');
      viewer.querySelector('[data-direction="previous"]').setAttribute('aria-label', group ? 'Previous image' : 'Previous photograph');
      viewer.querySelector('[data-direction="next"]').setAttribute('aria-label', group ? 'Next image' : 'Next photograph');
      viewer.showModal();
      document.body.classList.add('viewer-open');
      render(index);
      close.focus();
    });
  });

  close.addEventListener('click', () => viewer.close());
  viewer.querySelector('[data-direction="previous"]').addEventListener('click', () => render(current - 1));
  viewer.querySelector('[data-direction="next"]').addEventListener('click', () => render(current + 1));
  viewer.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      render(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  viewer.addEventListener('close', () => {
    document.body.classList.remove('viewer-open');
    opener?.focus({ preventScroll: true });
  });
  // Native <dialog> handles Escape and confines keyboard focus to the viewer.
  stage.addEventListener('touchstart', event => {
    touchStart = event.touches.length === 1
      ? { x: event.touches[0].clientX, y: event.touches[0].clientY }
      : null;
  }, { passive: true });
  stage.addEventListener('touchend', event => {
    if (!touchStart || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) render(current + (dx < 0 ? 1 : -1));
    touchStart = null;
  }, { passive: true });
  stage.addEventListener('touchcancel', () => { touchStart = null; }, { passive: true });
})();
