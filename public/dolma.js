(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const request = document.querySelector('[data-request]');
  const fields = {};
  let requestReady = false, booksReady = false;
  window.__dolmaReady = true;
  root.classList.add('js');
  // Do not read scrollY during document startup: it synchronously flushes layout.
  // The eye observer below is the visibility gate, including restored/deep scrolls.
  if (!reduced.matches && !location.hash) root.classList.add('motion');

  function renderRequest() {
    if (!requestReady) return;
    const day = fields.day.value;
    const message = [
      'Merhaba, web sitenizden bilgi almak ya da masa istemek istiyorum.',
      fields.type.value === 'order' ? 'Talebim: Sipariş vermek.' : fields.type.value === 'table' ? 'Talebim: Masa isteği.' : 'Talebim: Bilgi almak.',
      day ? `Gün: ${day.split('-').reverse().join('.')}` : '',
      fields.time.value ? `Saat: ${fields.time.value}` : '',
      fields.name.value.trim() ? `Adım: ${fields.name.value.trim()}` : '',
      fields.note.value.trim() ? `Not: ${fields.note.value.trim()}` : '',
    ].filter(Boolean).join('\n');
    document.getElementById('message-preview').textContent = message;
    document.querySelector('[data-whatsapp-preview]').href = `https://wa.me/905330906926?text=${encodeURIComponent(message)}`;
  }

  // Native date/select controls stay inert in a template until somebody starts reading
  // the page or requests the form. The message and direct WhatsApp fallback are always HTML.
  function ensureRequest() {
    if (!request || requestReady) return;
    request.querySelector('[data-request-fields]').append(request.querySelector('template').content.cloneNode(true));
    for (const id of ['type', 'note', 'day', 'time', 'name']) fields[id] = document.getElementById(`request-${id}`);
    request.addEventListener('input', renderRequest);
    request.addEventListener('change', renderRequest);
    requestReady = true;
    renderRequest();
  }

  function ensureBooks() {
    if (booksReady) return;
    booksReady = true;
    document.querySelectorAll('[data-menu-book]').forEach(book => {
      const track = book.querySelector('[data-menu-track]');
      const pages = [...track.children];
      const previous = book.querySelector('[data-book-prev]');
      const next = book.querySelector('[data-book-next]');
      const status = book.querySelector('[data-book-status]');
      let current = 0;
      const paint = () => { previous.disabled = current === 0; next.disabled = current === pages.length - 1; status.textContent = `${current + 1} / ${pages.length}`; };
      const go = index => {
        current = Math.max(0, Math.min(pages.length - 1, index));
        track.scrollTo({left: current * track.clientWidth, behavior: reduced.matches ? 'auto' : 'smooth'});
        paint();
      };
      previous.addEventListener('click', () => go(current - 1));
      next.addEventListener('click', () => go(current + 1));
      track.addEventListener('keydown', event => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); go(current + (event.key === 'ArrowRight' ? 1 : -1)); } });
      track.addEventListener('scrollend', () => { current = Math.round(track.scrollLeft / track.clientWidth); paint(); });
      const observer = new IntersectionObserver(entries => {
        const entry = entries.find(item => item.isIntersecting && item.intersectionRatio >= 0.6);
        if (entry) { current = pages.indexOf(entry.target); paint(); }
      }, {root: track, threshold: 0.6});
      pages.forEach(page => observer.observe(page));
      paint();
    });
  }

  const prepare = () => { ensureRequest(); ensureBooks(); };
  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    if ('requestIdleCallback' in window) requestIdleCallback(prepare, {timeout: 600});
    else setTimeout(prepare, 30);
  };
  addEventListener('scroll', schedule, {once: true, passive: true});
  addEventListener('keydown', schedule, {once: true});
  if (location.hash) prepare();

  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    if (event.target.closest('[data-book-prev],[data-book-next]')) ensureBooks();
    const link = event.target.closest('a');
    if (!link) return;
    if (link.hash === '#contact' || link.dataset.requestType === 'order') ensureRequest();
    if (link.hash === '#menu') ensureBooks();
    if (link.dataset.requestType === 'order' && requestReady) { fields.type.value = 'order'; renderRequest(); }
    if (link.hash && link.origin === location.origin) document.querySelectorAll('.mobile-menu[open]').forEach(menu => menu.removeAttribute('open'));
  }, true);

  document.querySelectorAll('[data-eye]').forEach(eye => {
    const button = eye.querySelector('[data-eye-pause]');
    let visible = false, paused = false;
    const sync = () => {
      eye.dataset.active = String(visible && !paused && !reduced.matches && !document.hidden && root.classList.contains('motion'));
      button.hidden = reduced.matches;
      button.setAttribute('aria-pressed', String(paused));
      button.setAttribute('aria-label', paused ? button.dataset.playLabel : button.dataset.pauseLabel);
      button.firstElementChild.textContent = paused ? '▷' : 'Ⅱ';
    };
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }).observe(eye);
    button.addEventListener('click', () => { paused = !paused; sync(); });
    reduced.addEventListener('change', () => { root.classList.toggle('motion', !reduced.matches); sync(); });
    document.addEventListener('visibilitychange', sync);
    sync();
  });
})();
