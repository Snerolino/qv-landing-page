/* Accessibility enhancement: no network, storage or data submission. */
(() => {
  const main = document.querySelector('main');
  main.setAttribute('tabindex', '-1');
  document.querySelector('.qv-skip').addEventListener('click', () => main.focus({preventScroll: true}));
  const group = document.querySelector('[data-qv-chips]');
  const sync = () => group.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.classList.contains('is-selected'))));
  sync();
  group.addEventListener('click', sync);
})();
