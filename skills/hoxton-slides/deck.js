/*
  deck.js — attribute-driven navigator for `.slide`-based HTML decks.

  Drop this file next to any deck built on the same convention and include it
  once, at the end of <body>:

    <script src="deck.js"></script>

  Contract this expects from the host page (see design-notes.md §2):
    - one slide per element matching the selector below (default ".slide")
    - a shared class that shows/hides a slide (default "active"), authored by
      the host as e.g. `.slide.active{display:flex}` / `.slide{display:none}`.
      deck.js only adds/removes that class — it never sets display itself, so
      it works with whatever display value the host's slide CSS uses.
    - optional per-slide `data-section` (short label, not currently rendered,
      reserved for future grouping) and `data-title` (shown in the contents
      panel; falls back to the slide's own h1/h2 text if omitted)

  Nothing about slide count, slide size, or slide content is hardcoded here —
  everything is read from the DOM at init. Add or remove a slide in the host
  file and the index, the progress track, the counter and the hover
  thumbnails all pick it up automatically.

  Optional config, as attributes on the <script> tag that includes this file:
    data-slide-selector   CSS selector for slides, default ".slide"
    data-active-class     class deck.js toggles per slide, default "active"
    data-thumb-width      hover-thumbnail width in px, default 220

  Slide footer: deck.js appends a `.slide-footer` to every slide (page number,
  the slide's data-section, "Shoreditch Design Studio"); deck.css styles it.
  Add data-footer="off" to a slide to skip it.

  Presenter notes: put an `<aside class="notes">` inside any slide (plain
  paragraphs or a list). deck.js hides it on the slide and shows it in a
  20vw drawer on the right. Move the cursor to the right edge of the window
  to reveal the chevron tab, click it (or press N) to open the drawer.

  Reads these CSS custom properties from the host page if present, with
  built-in fallbacks if not: --ink --off --paper --coral --rule-light
  --muted-light --body. A deck built from this template family already
  defines them (design-notes.md §3), so chrome colour matches automatically.
*/
(function(){
  const script = document.currentScript;
  const SELECTOR = (script && script.dataset.slideSelector) || '.slide';
  const ACTIVE_CLASS = (script && script.dataset.activeClass) || 'active';
  const THUMB_W = parseInt(script && script.dataset.thumbWidth, 10) || 220;

  const CSS = `
    .dc-viewport{position:relative;transform-origin:center center;transition:transform .22s ease}
    .dc-stage{position:relative}

    .dc-scrim{position:fixed;inset:0;background:rgba(0,0,0,.55);opacity:0;pointer-events:none;transition:opacity .15s ease;z-index:15}
    .dc-scrim.visible{opacity:1;pointer-events:auto}

    .dc-index-flyout{position:fixed;top:24px;left:24px;bottom:92px;width:340px;background:var(--ink,#0E1013);color:var(--off,#FAFAFA);padding:40px 32px;overflow-y:auto;z-index:20;box-shadow:0 20px 60px rgba(0,0,0,.45);font-family:var(--body,sans-serif)}
    .dc-index-flyout[hidden]{display:none}
    .dc-index-title{font-weight:700;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted-light,rgba(250,250,250,.62));margin-bottom:20px}
    .dc-index-flyout ol{list-style:none;display:flex;flex-direction:column;gap:2px;margin:0;padding:0}
    .dc-index-flyout li button{appearance:none;border:none;background:none;color:var(--off,#FAFAFA);font-family:inherit;font-size:15px;text-align:left;width:100%;padding:11px 0;border-top:1px solid var(--rule-light,rgba(250,250,250,.28));cursor:pointer;display:flex;gap:14px}
    .dc-index-flyout li:last-child button{border-bottom:1px solid var(--rule-light,rgba(250,250,250,.28))}
    .dc-index-flyout li button:hover,.dc-index-flyout li button.current{color:var(--coral,#FD6653)}
    .dc-index-flyout li .dc-idx-num{color:var(--muted-light,rgba(250,250,250,.62));font-size:12px;padding-top:2px;flex:none;width:20px}

    .dc-chrome{position:fixed;left:24px;right:24px;bottom:24px;height:44px;background:var(--ink,#0E1013);border-radius:4px;display:flex;align-items:center;gap:16px;padding:0 20px;font-family:var(--body,sans-serif);z-index:16;box-shadow:0 10px 30px rgba(0,0,0,.35)}
    .dc-index-toggle,.dc-arrow,.dc-fullscreen{appearance:none;border:none;background:none;color:var(--off,#FAFAFA);cursor:pointer;padding:6px;line-height:1}
    .dc-index-toggle{font-size:16px;flex:none}
    .dc-arrow{font-size:18px}
    .dc-fullscreen{flex:none;display:flex}
    .dc-fullscreen svg{width:16px;height:16px;display:block}
    .dc-index-toggle:hover,.dc-arrow:hover,.dc-fullscreen:hover{color:var(--coral,#FD6653)}
    .dc-count{color:var(--muted-light,rgba(250,250,250,.62));font-size:13px;letter-spacing:.02em;flex:none}
    .dc-track{flex:1;display:flex;gap:4px;align-items:center;height:100%}
    .dc-track-seg{appearance:none;border:none;cursor:pointer;flex:1;height:3px;background:var(--rule-light,rgba(250,250,250,.28));padding:0}
    .dc-track-seg.filled{background:var(--muted-light,rgba(250,250,250,.62))}
    .dc-track-seg.current{background:var(--coral,#FD6653)}

    .dc-thumb-preview{position:fixed;background:var(--paper,#fff);box-shadow:0 12px 32px rgba(0,0,0,.35);overflow:hidden;pointer-events:none;opacity:0;transition:opacity .1s ease;z-index:30}
    .dc-thumb-preview.visible{opacity:1}

    ${SELECTOR} .notes{display:none !important}

    .dc-notes-tab{position:fixed;top:50%;right:0;width:32px;height:72px;margin-top:-36px;appearance:none;border:none;border-radius:4px 0 0 4px;background:var(--ink,#0E1013);color:var(--off,#FAFAFA);cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;z-index:16;box-shadow:0 10px 30px rgba(0,0,0,.35);transform:translateX(100%);transition:transform .18s ease}
    .dc-notes-tab.visible{transform:translateX(0)}
    .dc-notes-tab:hover{color:var(--coral,#FD6653)}
    .dc-notes-tab svg{width:14px;height:14px;display:block}

    .dc-notes{position:fixed;top:24px;right:24px;bottom:92px;width:20vw;min-width:280px;background:var(--ink,#0E1013);color:var(--off,#FAFAFA);font-family:var(--body,sans-serif);padding:32px 28px;overflow-y:auto;z-index:20;box-shadow:0 20px 60px rgba(0,0,0,.45);transform:translateX(calc(100% + 32px));transition:transform .22s ease}
    .dc-notes.open{transform:translateX(0)}
    .dc-notes-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:20px}
    .dc-notes-label{font-weight:700;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted-light,rgba(250,250,250,.62))}
    .dc-notes-title{font-size:15px;margin-top:8px;color:var(--off,#FAFAFA)}
    .dc-notes-close{appearance:none;border:none;background:none;color:var(--off,#FAFAFA);cursor:pointer;padding:4px;flex:none;line-height:0}
    .dc-notes-close:hover{color:var(--coral,#FD6653)}
    .dc-notes-close svg{width:14px;height:14px;display:block}
    .dc-notes-body{font-size:15px;line-height:1.55;border-top:1px solid var(--rule-light,rgba(250,250,250,.28));padding-top:20px}
    .dc-notes-body p{margin:0 0 12px}
    .dc-notes-body ul,.dc-notes-body ol{margin:0;padding-left:18px;display:flex;flex-direction:column;gap:10px}
    .dc-notes-body strong{color:var(--coral,#FD6653);font-weight:600}
    .dc-notes-empty{color:var(--muted-light,rgba(250,250,250,.62))}

    @media print{
      .dc-chrome,.dc-index-flyout,.dc-thumb-preview,.dc-scrim,.dc-notes,.dc-notes-tab{display:none !important}
    }
  `;

  function init(){
    const slides = Array.from(document.querySelectorAll(SELECTOR));
    const total = slides.length;
    if(!total) return;

    // ---- slide footer: page number / chapter (data-section) / studio. Added to the slide
    // itself, so it shows in thumbnails, print and Figma paste. data-footer="off" skips one. ----
    slides.forEach((slide, i) => {
      if(slide.dataset.footer === 'off' || slide.querySelector('.slide-footer')) return;
      const f = document.createElement('div');
      f.className = 'slide-footer';
      [String(i + 1).padStart(2, '0'), slide.dataset.section || '', 'Shoreditch Design Studio'].forEach(t => {
        const s = document.createElement('span'); s.textContent = t; f.appendChild(s);
      });
      slide.appendChild(f);
    });

    // ---- wrap the slides in a scale-to-fit stage, without touching their own markup ----
    const viewport = document.createElement('div');
    viewport.className = 'dc-viewport';
    const stage = document.createElement('div');
    stage.className = 'dc-stage';
    slides[0].parentNode.insertBefore(viewport, slides[0]);
    viewport.appendChild(stage);
    slides.forEach(s => stage.appendChild(s));

    // ---- inject chrome styles once ----
    const styleTag = document.createElement('style');
    styleTag.textContent = CSS;
    document.head.appendChild(styleTag);

    // ---- build chrome DOM ----
    const scrim = document.createElement('div');
    scrim.className = 'dc-scrim';

    const indexFlyout = document.createElement('div');
    indexFlyout.className = 'dc-index-flyout';
    indexFlyout.hidden = true;
    indexFlyout.innerHTML = '<div class="dc-index-title">Contents</div><ol></ol>';
    const indexList = indexFlyout.querySelector('ol');

    const chrome = document.createElement('div');
    chrome.className = 'dc-chrome';
    chrome.innerHTML =
      '<button class="dc-index-toggle" aria-label="Toggle slide index" aria-expanded="false">&#9776;</button>' +
      '<button class="dc-arrow" aria-label="Previous slide">&#8249;</button>' +
      '<div class="dc-count"><span class="dc-count-current">1</span>&nbsp;/&nbsp;<span class="dc-count-total"></span></div>' +
      '<div class="dc-track"></div>' +
      '<button class="dc-arrow" aria-label="Next slide">&#8250;</button>' +
      '<button class="dc-fullscreen" aria-label="Enter fullscreen"></button>';

    // Four-corner fullscreen icons: corners point out to enter, in to exit.
    const FS_ENTER = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square"><path d="M1.5 5.5v-4h4M10.5 1.5h4v4M14.5 10.5v4h-4M5.5 14.5h-4v-4"/></svg>';
    const FS_EXIT = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square"><path d="M5.5 1.5v4h-4M14.5 5.5h-4v-4M10.5 14.5v-4h4M1.5 10.5h4v4"/></svg>';

    const indexToggle = chrome.querySelector('.dc-index-toggle');
    const arrows = chrome.querySelectorAll('.dc-arrow');
    const prevBtn = arrows[0];
    const nextBtn = arrows[1];
    const fullscreenBtn = chrome.querySelector('.dc-fullscreen');
    function syncFullscreenIcon(){
      const on = !!document.fullscreenElement;
      fullscreenBtn.innerHTML = on ? FS_EXIT : FS_ENTER;
      fullscreenBtn.setAttribute('aria-label', on ? 'Exit fullscreen' : 'Enter fullscreen');
    }
    syncFullscreenIcon();
    const countCurrent = chrome.querySelector('.dc-count-current');
    const countTotal = chrome.querySelector('.dc-count-total');
    const track = chrome.querySelector('.dc-track');

    const thumbPreview = document.createElement('div');
    thumbPreview.className = 'dc-thumb-preview';
    thumbPreview.style.width = THUMB_W + 'px';

    document.body.appendChild(scrim);
    document.body.appendChild(indexFlyout);
    document.body.appendChild(chrome);
    document.body.appendChild(thumbPreview);

    // ---- presenter notes drawer: tab hides off the right edge until the cursor nears it ----
    const CHEVRON_LEFT = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="square"><path d="M10 2.5 4.5 8l5.5 5.5"/></svg>';
    const CHEVRON_RIGHT = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="square"><path d="M6 2.5 11.5 8 6 13.5"/></svg>';
    const notesTab = document.createElement('button');
    notesTab.className = 'dc-notes-tab';
    notesTab.setAttribute('aria-label', 'Open presenter notes');
    notesTab.innerHTML = CHEVRON_LEFT;
    const notesDrawer = document.createElement('aside');
    notesDrawer.className = 'dc-notes';
    notesDrawer.setAttribute('aria-label', 'Presenter notes');
    notesDrawer.innerHTML =
      '<div class="dc-notes-head"><div><div class="dc-notes-label">Notes · <span class="dc-notes-num"></span></div><div class="dc-notes-title"></div></div>' +
      '<button class="dc-notes-close" aria-label="Close presenter notes">' + CHEVRON_RIGHT + '</button></div>' +
      '<div class="dc-notes-body"></div>';
    document.body.appendChild(notesTab);
    document.body.appendChild(notesDrawer);
    const notesNum = notesDrawer.querySelector('.dc-notes-num');
    const notesTitle = notesDrawer.querySelector('.dc-notes-title');
    const notesBody = notesDrawer.querySelector('.dc-notes-body');

    countTotal.textContent = total;

    // slide aspect ratio read from the deck itself — no hardcoded canvas size, so
    // this works for a deck authored at any fixed pixel size. Computed style, not
    // getBoundingClientRect: no slide has the active class yet at this point, so
    // an unrendered (display:none) slide would measure 0 via layout.
    const slideCS = getComputedStyle(slides[0]);
    const slideW = parseFloat(slideCS.width) || 1;
    const slideH = parseFloat(slideCS.height) || 1;
    const THUMB_H = Math.round(THUMB_W * slideH / slideW);
    thumbPreview.style.height = THUMB_H + 'px';

    const thumbCache = new Map();
    const titles = [];

    slides.forEach((slide, i) => {
      const heading = slide.querySelector('h1,h2');
      // <br> in a heading becomes a space, so "Client name<br>Website" doesn't run together.
      let headingText = '';
      if(heading){ const h = heading.cloneNode(true); h.querySelectorAll('br').forEach(br => br.replaceWith(' ')); headingText = h.textContent.replace(/\s+/g, ' ').trim(); }
      const title = slide.dataset.title || headingText || ('Slide ' + (i + 1));
      titles.push(title);

      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.innerHTML = '<span class="dc-idx-num">' + String(i + 1).padStart(2, '0') + '</span><span>' + title + '</span>';
      btn.addEventListener('click', () => { goTo(i + 1); toggleIndex(false); });
      li.appendChild(btn);
      indexList.appendChild(li);

      const seg = document.createElement('button');
      seg.className = 'dc-track-seg';
      seg.setAttribute('aria-label', 'Go to slide ' + (i + 1) + ': ' + title);
      seg.addEventListener('click', () => goTo(i + 1));
      seg.addEventListener('mouseenter', () => showThumb(i, seg));
      seg.addEventListener('mouseleave', hideThumb);
      track.appendChild(seg);
    });

    const indexButtons = Array.from(indexList.querySelectorAll('button'));
    const trackSegs = Array.from(track.querySelectorAll('.dc-track-seg'));

    // hover thumbnails are live clones of the real slide DOM, not screenshots — any
    // slide type the host adds gets a working thumbnail automatically, nothing to
    // generate. Adding the host's own active class (not a hardcoded display value)
    // lets the host's own CSS render the clone correctly, whatever layout it uses.
    function getThumbClone(i){
      if(thumbCache.has(i)) return thumbCache.get(i);
      const clone = slides[i].cloneNode(true);
      clone.classList.add(ACTIVE_CLASS);
      clone.style.position = 'absolute';
      clone.style.top = '0';
      clone.style.left = '0';
      clone.style.transformOrigin = 'top left';
      clone.style.transform = `scale(${THUMB_W / slideW})`;
      thumbCache.set(i, clone);
      return clone;
    }

    function showThumb(i, seg){
      thumbPreview.innerHTML = '';
      thumbPreview.appendChild(getThumbClone(i));
      const r = seg.getBoundingClientRect();
      const left = Math.min(Math.max(r.left + r.width / 2 - THUMB_W / 2, 8), window.innerWidth - THUMB_W - 8);
      thumbPreview.style.left = left + 'px';
      thumbPreview.style.top = (r.top - THUMB_H - 12) + 'px';
      thumbPreview.classList.add('visible');
    }
    function hideThumb(){ thumbPreview.classList.remove('visible'); }

    // Current slide lives in memory. The ?slide=N param is read once at load and
    // mirrored on every move for deep links, but never read back during navigation:
    // if a browser blocks history updates (file://, Safari, sandboxed frames) the
    // deck still moves.
    function slideFromUrl(){
      const n = parseInt(new URLSearchParams(location.search).get('slide'), 10);
      if(!n || n < 1) return 1;
      if(n > total) return total;
      return n;
    }
    let current = slideFromUrl();
    function currentIndex(){ return current; }

    function render(n){
      slides.forEach((s, i) => s.classList.toggle(ACTIVE_CLASS, i === n - 1));
      countCurrent.textContent = n;
      indexButtons.forEach((b, i) => b.classList.toggle('current', i === n - 1));
      trackSegs.forEach((s, i) => {
        s.classList.toggle('current', i === n - 1);
        s.classList.toggle('filled', i < n - 1);
      });
      const notes = slides[n - 1].querySelector('.notes');
      notesNum.textContent = n + ' / ' + total;
      notesTitle.textContent = titles[n - 1];
      notesBody.innerHTML = notes && notes.innerHTML.trim() ? notes.innerHTML : '<p class="dc-notes-empty">No notes for this slide.</p>';
    }

    let notesOpen = false;
    function toggleNotes(force){
      notesOpen = typeof force === 'boolean' ? force : !notesOpen;
      notesDrawer.classList.toggle('open', notesOpen);
      notesTab.classList.toggle('visible', false);
      fit();
    }

    function goTo(n){
      n = Math.min(Math.max(n, 1), total);
      current = n;
      render(n);
      try {
        const url = new URL(location);
        url.searchParams.set('slide', n);
        history.replaceState(null, '', url);
      } catch(err) { /* history blocked: navigation still works, URL just doesn't update */ }
    }

    function toggleIndex(force){
      const open = typeof force === 'boolean' ? force : indexFlyout.hasAttribute('hidden');
      indexFlyout.toggleAttribute('hidden', !open);
      indexToggle.setAttribute('aria-expanded', String(open));
      scrim.classList.toggle('visible', open);
    }

    render(currentIndex());

    prevBtn.addEventListener('click', () => goTo(currentIndex() - 1));
    nextBtn.addEventListener('click', () => goTo(currentIndex() + 1));
    indexToggle.addEventListener('click', () => toggleIndex());
    notesTab.addEventListener('click', () => { notesTab.blur(); toggleNotes(true); });
    notesDrawer.querySelector('.dc-notes-close').addEventListener('click', e => { e.currentTarget.blur(); toggleNotes(false); });

    // Tab shows while the cursor is within 48px of the right edge (or over the tab).
    const EDGE = 48;
    document.addEventListener('mousemove', e => {
      if(notesOpen) return;
      notesTab.classList.toggle('visible', e.clientX >= window.innerWidth - EDGE || notesTab.contains(e.target));
    });
    document.documentElement.addEventListener('mouseleave', () => notesTab.classList.remove('visible'));
    scrim.addEventListener('click', () => toggleIndex(false));

    fullscreenBtn.addEventListener('click', () => {
      if(!document.fullscreenElement) document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
      else document.exitFullscreen && document.exitFullscreen();
    });

    // Bar buttons drop focus after a click, so a later Space/Enter can't re-fire them
    // and arrow keys always reach the deck.
    chrome.addEventListener('click', e => { const b = e.target.closest('button'); if(b) b.blur(); });

    const NEXT_KEYS = ['ArrowRight', 'ArrowDown', 'PageDown', ' '];
    const PREV_KEYS = ['ArrowLeft', 'ArrowUp', 'PageUp'];
    // Window, capture phase: runs before anything inside the page can swallow the key.
    window.addEventListener('keydown', e => {
      if(e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target;
      if(t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if(NEXT_KEYS.includes(e.key) && !e.shiftKey){ e.preventDefault(); goTo(current + 1); }
      else if(PREV_KEYS.includes(e.key) || (e.key === ' ' && e.shiftKey)){ e.preventDefault(); goTo(current - 1); }
      else if(e.key === 'Home'){ e.preventDefault(); goTo(1); }
      else if(e.key === 'End'){ e.preventDefault(); goTo(total); }
      else if(e.key === 'n' || e.key === 'N'){ e.preventDefault(); toggleNotes(); }
      else if(e.key === 'Escape'){ toggleIndex(false); toggleNotes(false); }
    }, true);

    window.addEventListener('popstate', () => { current = slideFromUrl(); render(current); });

    // ---- scale the whole stage to fit the window, deck stays fixed-px authored ----
    function fit(){
      const BOTTOM_RESERVE = 120; // clears the fixed floating nav bar
      // offsetWidth/Height ignore transforms, so this reads the unscaled size even
      // while the transform is mid-transition.
      const rect = { width: viewport.offsetWidth, height: viewport.offsetHeight };
      // body centers the viewport, so reserve the bar clearance on both sides of the
      // calc (centering halves the slack) to guarantee the real bottom gap clears it.
      // With the notes drawer open, fit the slide into the space left of it and shift
      // it left by half the drawer, since body centres the viewport in the full window.
      const drawerW = notesOpen ? notesDrawer.offsetWidth + 24 : 0;
      const scale = Math.min(1, (window.innerWidth - 48 - drawerW) / (rect.width || slideW), (window.innerHeight - 48 - BOTTOM_RESERVE * 2) / (rect.height || slideH));
      viewport.style.transform = `translateX(${-drawerW / 2}px) scale(${scale})`;
    }
    fit();
    window.addEventListener('resize', fit);
    document.addEventListener('fullscreenchange', () => { fit(); syncFullscreenIcon(); });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
