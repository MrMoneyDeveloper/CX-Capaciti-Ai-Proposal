(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const btnViewProjects = document.getElementById('btn-view-projects');
  const btnNextSteps = document.getElementById('btn-next-steps');
  const btnPrint = document.getElementById('btn-print');
  const btnBackTop = document.getElementById('btn-back-top');
  const highlightTerms = [
    { term: 'brand presence', cls: 'hl-primary' },
    { term: 'resell potential', cls: 'hl-secondary' },
    { term: 'resell', cls: 'hl-secondary' },
    { term: 'sponsorship', cls: 'hl-primary' },
    { term: 'showcase', cls: 'hl-secondary' },
    { term: 'visibility', cls: 'hl-accent' },
    { term: 'delivery', cls: 'hl-primary' },
    { term: 'execution', cls: 'hl-accent' },
    { term: 'public demos', cls: 'hl-secondary' },
    { term: 'next step', cls: 'hl-accent' },
  ];

  function smoothScrollTo(targetId) {
    const target = document.querySelector(targetId);
    if (!target) {
      return;
    }
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function wireAnchors() {
    document.querySelectorAll('[data-scroll]').forEach((anchor) => {
      anchor.addEventListener('click', (event) => {
        const href = anchor.getAttribute('href');
        if (!href || !href.startsWith('#')) {
          return;
        }
        event.preventDefault();
        smoothScrollTo(href);
      });
    });
  }

  function addImageFallbacks() {
    document.querySelectorAll('img').forEach((img) => {
      img.loading = 'lazy';
      img.addEventListener(
        'error',
        () => {
          const placeholder = document.createElement('div');
          placeholder.className = 'image-placeholder';
          placeholder.textContent = img.alt || 'Image placeholder';
          img.replaceWith(placeholder);
        },
        { once: true },
      );
    });
  }

  function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function applyKeywordHighlights() {
    const scope = document.querySelector('.lp-main');
    if (!scope) {
      return;
    }

    const terms = [...highlightTerms].sort((a, b) => b.term.length - a.term.length);
    const termMap = new Map(terms.map((t) => [t.term.toLowerCase(), t]));
    const pattern = new RegExp(`\\b(${terms.map((t) => escapeRegex(t.term)).join('|')})\\b`, 'gi');

    const walker = document.createTreeWalker(
      scope,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (!node.nodeValue || !node.nodeValue.trim()) {
            return NodeFilter.FILTER_REJECT;
          }

          const parent = node.parentElement;
          if (!parent) {
            return NodeFilter.FILTER_REJECT;
          }

          if (parent.closest('.word-highlight')) {
            return NodeFilter.FILTER_REJECT;
          }

          if (parent.closest('script, style, noscript, code, pre')) {
            return NodeFilter.FILTER_REJECT;
          }

          return NodeFilter.FILTER_ACCEPT;
        },
      },
      false,
    );

    const textNodes = [];
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    textNodes.forEach((node) => {
      const sourceText = node.nodeValue;
      pattern.lastIndex = 0;
      if (!pattern.test(sourceText)) {
        return;
      }

      pattern.lastIndex = 0;
      const fragment = document.createDocumentFragment();
      let lastIndex = 0;
      let match;

      while ((match = pattern.exec(sourceText)) !== null) {
        const start = match.index;
        const end = pattern.lastIndex;

        if (start > lastIndex) {
          fragment.appendChild(document.createTextNode(sourceText.slice(lastIndex, start)));
        }

        const matchedText = match[0];
        const key = matchedText.toLowerCase();
        const config = termMap.get(key);
        const span = document.createElement('span');
        span.className = `word-highlight ${config ? config.cls : 'hl-primary'}`;
        span.textContent = matchedText;
        fragment.appendChild(span);

        lastIndex = end;
      }

      if (lastIndex < sourceText.length) {
        fragment.appendChild(document.createTextNode(sourceText.slice(lastIndex)));
      }

      node.parentNode.replaceChild(fragment, node);
    });
  }

  function animatePage() {
    if (typeof gsap === 'undefined' || prefersReducedMotion) {
      return;
    }

    const heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTimeline
      .from('.top-nav', { y: -18, opacity: 0, duration: 0.45 })
      .from('.hero-section .eyebrow', { y: 14, opacity: 0, duration: 0.4 }, '-=0.15')
      .from('.hero-section h1', { y: 18, opacity: 0, duration: 0.55 }, '-=0.22')
      .from('.hero-section .lead', { y: 14, opacity: 0, duration: 0.45 }, '-=0.25')
      .from('.hero-section .proposal-scope', { y: 10, opacity: 0, duration: 0.35 }, '-=0.22')
      .from('.hero-section .hero-event-links a', { y: 8, opacity: 0, duration: 0.3, stagger: 0.06 }, '-=0.2')
      .from('.hero-section .chip-row .stat-chip', { y: 10, opacity: 0, duration: 0.35, stagger: 0.06 }, '-=0.2')
      .from('.hero-section .hero-actions > *', { y: 12, opacity: 0, duration: 0.35, stagger: 0.07 }, '-=0.2')
      .from('.hero-section .logo-pill', { y: 10, opacity: 0, duration: 0.3, stagger: 0.06 }, '-=0.2')
      .from('.hero-section .hero-image', { y: 18, opacity: 0, duration: 0.55 }, '-=0.2');

    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      gsap.utils.toArray('.reveal').forEach((section) => {
        gsap.from(section, {
          y: 28,
          opacity: 0,
          duration: 0.66,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 84%',
            toggleActions: 'play none none reverse',
          },
        });
      });

      gsap.utils.toArray('.hover-lift, .project-card').forEach((card) => {
        gsap.from(card, {
          y: 18,
          opacity: 0,
          duration: 0.52,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
        });
      });
    }
  }

  function wireActions() {
    if (btnViewProjects) {
      btnViewProjects.addEventListener('click', () => {
        smoothScrollTo('#projects');
      });
    }

    if (btnNextSteps) {
      btnNextSteps.addEventListener('click', () => {
        smoothScrollTo('#next');
      });
    }

    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        window.print();
      });
    }

    if (btnBackTop) {
      btnBackTop.addEventListener('click', () => {
        smoothScrollTo('#hero');
      });
    }
  }

  function init() {
    wireAnchors();
    wireActions();
    addImageFallbacks();
    applyKeywordHighlights();
    animatePage();
  }

  init();
})();
