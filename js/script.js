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
