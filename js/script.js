(() => {
  const logoRow   = document.getElementById('logoRow');
  const circlePos = document.getElementById('circlePos');
  const textMask  = document.getElementById('textMask');

  if (!logoRow || !circlePos || !textMask) return;

  /**
   * The circle starts the animation centered over the whole "NANOFRAME"
   * lockup (as in the original After Effects comp) and travels left into
   * its final slot. That travel distance is: half the text width, plus
   * half the gap between the circle and the text.
   *
   * We measure it in real pixels (rather than hard-coding a value) so the
   * animation lines up correctly at any screen size, and with whatever
   * font actually ends up loaded (system fallback vs. the real
   * "Designer Regular" once it's dropped into /fonts).
   */
  function setShiftDistance() {
    const gapPx = parseFloat(getComputedStyle(logoRow).columnGap || getComputedStyle(logoRow).gap) || 0;
    const textWidth = textMask.getBoundingClientRect().width;
    const shift = (textWidth + gapPx) / 2;
    logoRow.style.setProperty('--shift', `${shift}px`);
  }

  setShiftDistance();

  // Re-measure after webfonts finish loading (text width can change once
  // "Designer Regular" swaps in for the fallback stack).
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(setShiftDistance);
  }

  // Keep it correct across rotation / resize / responsive breakpoints.
  let resizeRaf;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(setShiftDistance);
  });
})();


/* ==========================================================================
   Project grid — builds the tiles from data/projects.json
   (edited through Pages CMS, see .pages.yml)
   ========================================================================== */
(() => {
  const grid = document.getElementById('projectGrid');
  if (!grid) return;

  // Pull the project ID out of a Behance URL, embed code, or bare ID.
  function behanceId(value) {
    const s = String(value || '').trim();
    if (/^\d+$/.test(s)) return s;
    const m = s.match(/behance\.net\/(?:embed\/project|gallery)\/(\d+)/i);
    return m ? m[1] : null;
  }

  // Use a real project URL as-is; otherwise build one from the ID + title
  // (Behance needs the project name after the ID).
  function behanceUrl(p) {
    const link = String(p.link || '').trim();
    if (/^https?:\/\/(www\.)?behance\.net\/gallery\/\d+\/[^\s"'<>]+$/i.test(link)) return link;
    const id = behanceId(link);
    if (!id) return null;
    const slug = (p.title || 'project').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');
    return `https://www.behance.net/gallery/${id}/${slug}`;
  }

  function buildTile(p) {
    const url = behanceUrl(p);
    const tile = document.createElement(url ? 'a' : 'div');
    tile.className = 'project-tile';
    tile.setAttribute('role', 'listitem');

    if (url) {
      tile.href = url;
      tile.target = '_blank';
      tile.rel = 'noopener';
      tile.setAttribute(
        'aria-label',
        `${p.title}${p.subtitle ? ', ' + p.subtitle : ''} (opens on Behance in a new tab)`
      );
    } else {
      console.warn('[projects] No valid Behance link for:', p.title);
    }

    const img = document.createElement('img');
    img.className = 'project-tile__img';
    img.src = p.cover || '';
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';

    const caption = document.createElement('span');
    caption.className = 'project-tile__caption';

    const title = document.createElement('span');
    title.className = 'project-tile__title';
    title.textContent = p.title || '';

    const subtitle = document.createElement('span');
    subtitle.className = 'project-tile__subtitle';
    subtitle.textContent = p.subtitle || '';

    caption.append(title, subtitle);
    tile.append(img, caption);
    return tile;
  }

  function render(projects) {
    const frag = document.createDocumentFragment();
    projects.forEach((p) => frag.append(buildTile(p)));
    grid.replaceChildren(frag);

    // Tiles come in groups of three. Mark any leftovers at the end so the
    // CSS can lay them out without leaving holes in the last row.
    const tiles = grid.children;
    const leftover = tiles.length % 3;
    for (let i = tiles.length - leftover; i < tiles.length; i++) {
      tiles[i].classList.add(leftover === 1 ? 'is-tail-1' : 'is-tail-2');
    }
  }

  // 'no-cache' makes browsers check for a fresh copy, so CMS edits show up
  // as soon as GitHub Pages has published them.
  fetch('data/projects.json', { cache: 'no-cache' })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((projects) => {
      if (Array.isArray(projects)) render(projects);
    })
    .catch((err) => {
      console.error(
        '[projects] Could not load data/projects.json. If you opened index.html ' +
        'directly from your computer, preview it with a local server instead ' +
        '(e.g. the VS Code "Live Server" extension).',
        err
      );
    });
})();

/* ==========================================================================
   Smooth scrolling (Lenis)
   Eases mouse-wheel and trackpad scrolling. Phones keep their native
   scrolling, and it's skipped for visitors who've asked for reduced motion.
   ========================================================================== */
(() => {
  if (typeof Lenis === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  window.lenis = new Lenis({
    autoRaf: true, // runs its own animation loop
    lerp: 0.15,     // smoothness: lower = floatier (0.05), higher = snappier (0.15)
    anchors: true, // smooth-scroll to #links on the same page too
  });
})();