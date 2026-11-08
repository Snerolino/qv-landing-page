(function () {
  const doc = document;
  const header = doc.querySelector('[data-qv-header]');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function updateHeader() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 18);
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  doc.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = doc.querySelector(id);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start'
      });
    });
  });

  const chipGroup = doc.querySelector('[data-qv-chips]');
  if (chipGroup) {
    chipGroup.addEventListener('click', (event) => {
      const chip = event.target.closest('.qv-chip');
      if (!chip) return;
      chipGroup.querySelectorAll('.qv-chip').forEach((item) => {
        item.classList.remove('is-selected');
      });
      chip.classList.add('is-selected');
    });
  }

  const cards = doc.querySelectorAll('[data-qv-cards] .qv-card');
  cards.forEach((card) => {
    const activate = () => {
      cards.forEach((item) => item.classList.remove('is-active'));
      card.classList.add('is-active');
    };

    card.addEventListener('mouseenter', activate);
    card.addEventListener('focus', activate);
  });

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const revealItems = doc.querySelectorAll('.qv-card, .qv-bubble, .qv-principle-list article, .qv-asset-frame, .qv-copy-block, .qv-feature > div, .qv-photo-frame, .qv-photo-panel');
    revealItems.forEach((item) => item.classList.add('qv-reveal'));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14 });

    revealItems.forEach((item) => observer.observe(item));
  }
})();
