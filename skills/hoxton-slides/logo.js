// Deck logo, injected into every [data-logo] element as a flattened PNG.
// logo-dark.png (black mark) goes on light slides, logo-light.png (white mark) on dark
// slides and over the dark panel of a roadmap slide. PNGs, not inline SVG, because the
// Figma Chrome extension adds a stroke to the vector on paste and defaces the mark.
// For a client deck, replace the two PNGs with the client's mark (see design-notes.md §5).
(function () {
  const base = new URL('.', document.currentScript.src).href;
  document.querySelectorAll('[data-logo]').forEach(el => {
    const onDark = el.closest('.slide--dark') || el.closest('.roadmap:not(.roadmap--flip)');
    const file = onDark ? 'logo-light.png' : 'logo-dark.png';
    el.innerHTML = `<img src="${base}${file}" alt="Shoreditch Design">`;
  });
})();
