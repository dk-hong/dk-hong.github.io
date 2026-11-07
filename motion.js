'use strict';

(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const motionButton = document.querySelector('#page-motion');
  const activeAnimations = new Set();
  const seenFigures = new WeakSet();
  const figureRuns = new WeakMap();
  let paused = reducedMotion.matches;

  function run(element, keyframes, options, collection) {
    if (paused || !element || !element.animate) return;
    const animation = element.animate(keyframes, { duration: 550, easing: 'ease-out', fill: 'backwards', ...options });
    activeAnimations.add(animation);
    if (collection) collection.push(animation);
    const forget = () => activeAnimations.delete(animation);
    animation.onfinish = forget;
    animation.oncancel = forget;
    return animation;
  }
  function playConcept(figure) {
    if (paused) return;
    (figureRuns.get(figure) || []).forEach(animation => animation.cancel());
    const animations = [];
    figureRuns.set(figure, animations);
    const paths = [...figure.querySelectorAll('.concept-trace')];
    paths.forEach((path, index) => {
      // Keep the chosen-architecture feedback dashed during playback too.
      // A full-length dash used for line drawing would temporarily make it solid.
      if (path.classList.contains('flow-feedback')) {
        run(path, [
          { strokeDasharray: '4 4', strokeDashoffset: '24', opacity: .35 },
          { strokeDasharray: '4 4', strokeDashoffset: '0', opacity: 1 },
        ], { duration: 4000, delay: 500, easing: 'linear' }, animations);
        return;
      }
      const length = path.getTotalLength();
      const hdx = figure.dataset.concept === 'hdx';
      const dance = figure.dataset.concept === 'dance';
      run(path, [{ strokeDasharray: `${length}`, strokeDashoffset: `${length}`, opacity: .3 },{ strokeDasharray: `${length}`, strokeDashoffset: '0', opacity: 1 }], { duration: hdx ? 1800 : dance ? 2600 : 1250, delay: hdx ? 500 : index * 280 }, animations);
    });
    if (figure.dataset.concept === 'hdx') {
      const path = figure.querySelector('.concept-trace');
      const marker = figure.querySelector('.search-marker');
      const length = path.getTotalLength();
      const frames = Array.from({ length: 31 }, (_, index) => {
        const point = path.getPointAtLength(length * index / 30);
        return { transform: `translate(${point.x}px,${point.y}px)` };
      });
      figure.querySelectorAll('.candidate-points circle').forEach((candidate, index) => {
        run(candidate, [{ opacity: 0 },{ opacity: 1 }], { duration: 400, delay: index * 65 }, animations);
      });
      run(marker, frames, { duration: 1800, delay: 500, easing: 'linear' }, animations);
      run(figure.querySelector('.concept-halo'), [{ opacity: 0 }, { opacity: 0, offset: .8 }, { opacity: 1 }], { duration: 2600 }, animations);
      run(figure.querySelector('.selected-annotation'), [{ opacity: 0 }, { opacity: 1 }], { duration: 450, delay: 2200 }, animations);
      run(figure.querySelector('.feasible-region'), [{ opacity: .2 },{ opacity: 1 }], { duration: 850 }, animations);
    } else if (figure.dataset.concept === 'dance') {
      figure.querySelectorAll('.design-box').forEach((box, index) => {
        run(box, [{ fill: '#f5f9ff', stroke: '#bdcfea' },{ fill: '#e2eeff', stroke: '#709bdc', offset: .5 },{ fill: '#f5f9ff', stroke: '#bdcfea' }], { duration: 2800, delay: 900 + index * 250 }, animations);
      });
      run(figure.querySelector('.evaluator-box'), [{ fill: '#e8f1ff' },{ fill: '#cbdfff', offset: .5 },{ fill: '#e8f1ff' }], { duration: 2200 }, animations);
    } else if (figure.dataset.concept === 'qimera') {
      // Matching cubic segments let the quantized boundary deform continuously.
      // The reference full-precision boundary stays fixed throughout.
      const before = 'M24 56 C65 54 90 57 126 61 C167 66 188 70 223 70 C244 69 258 67 277 68';
      const after = figure.querySelector('.qimera-quantized-boundary').getAttribute('d');
      run(figure.querySelector('.qimera-quantized-boundary'), [
        { d: `path("${before}")`, offset: 0 },
        { d: `path("${before}")`, offset: .28 },
        { d: `path("${after}")`, offset: 1 },
      ], { duration: 3800, easing: 'ease-in-out' }, animations);
      run(figure.querySelector('.qimera-support'), [
        { opacity: 0, offset: 0 },
        { opacity: 0, offset: .1 },
        { opacity: 1, offset: .55 },
        { opacity: 1, offset: 1 },
      ], { duration: 2800 }, animations);
      run(figure.querySelector('.qimera-support-label'), [{ opacity: 0 },{ opacity: 1 }], { duration: 500, delay: 1000 }, animations);
    }
  }

  const figures = [...document.querySelectorAll('.concept-figure')];
  figures.forEach(figure => figure.querySelector('.concept-replay').addEventListener('click', () => playConcept(figure)));
  const reveals = [...document.querySelectorAll('.section-heading,.section-intro,.research-item,.timeline-row,.project-placeholder,.project-entry,.activity-grid>div,.contact-links')];
  reveals.forEach(element => element.classList.add('reveal'));
  // Progressive enhancement: if observers are unavailable all content stays readable.
  if ('IntersectionObserver' in window) {
    document.body.classList.add('motion-ready');
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-seen');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: .04 });
    reveals.forEach(element => revealObserver.observe(element));
    const conceptObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || seenFigures.has(entry.target)) return;
        seenFigures.add(entry.target);
        playConcept(entry.target);
      });
    }, { threshold: .5 });
    figures.forEach(figure => conceptObserver.observe(figure));
  } else {
    reveals.forEach(element => element.classList.add('is-seen'));
  }
  function updateMotionState() {
    document.body.classList.toggle('motion-paused', paused);
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.textContent = paused ? 'Enable animations ▷' : 'Pause animations Ⅱ';
    figures.forEach(figure => {
      const replay = figure.querySelector('.concept-replay');
      replay.disabled = paused;
      replay.title = paused ? 'Enable animations at the top of the page to replay.' : 'Replay this research concept';
    });
    if (paused) {
      [...activeAnimations].forEach(animation => animation.finish());
      activeAnimations.clear();
    }
  }
  motionButton.addEventListener('click', () => { paused = !paused; updateMotionState(); });
  reducedMotion.addEventListener('change', () => { paused = reducedMotion.matches; updateMotionState(); });
  updateMotionState();
  // Both identities remain visible after this brief, non-repeating introduction.
  run(document.querySelector('h1'), [{ opacity: 0, transform: 'translateY(10px)' },{ opacity: 1, transform: 'none' }], { duration: 500 });
  document.querySelectorAll('.identity-line').forEach((line, index) => {
    run(line, [{ opacity: 0, transform: 'translateY(8px)' },{ opacity: 1, transform: 'none' }], { delay: 150 + index * 180, duration: 500 });
  });
  run(document.querySelector('.intro'), [{ opacity: 0 },{ opacity: 1 }], { delay: 340, duration: 550 });
  document.addEventListener('publications:updated', () => {
    run(document.querySelector('#publication-list'), [{ opacity: .35, transform: 'translateY(5px)' },{ opacity: 1, transform: 'none' }], { duration: 240 });
  });
})();
