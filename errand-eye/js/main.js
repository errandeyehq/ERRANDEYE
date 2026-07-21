/* ============================================================
   ERRAND EYE - MAIN JS
   Vanilla JS only. No jQuery, no heavy frameworks.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------- Smooth page-load fade-in ---------------- */
  document.body.classList.add('page-fade-in');
  requestAnimationFrame(() => document.body.classList.add('page-fade-in-active'));

  /* ---------------- Button ripple on click ---------------- */
  document.querySelectorAll('.btn-primary, .btn-ghost, .fab-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height) * 1.6;
      ripple.className = 'btn-ripple';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  /* ---------------- Footer year ---------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- Hero cinematic video handoff ---------------- */
  const heroFilms = [...document.querySelectorAll('[data-hero-film]')];
  let activeHeroFilm = 0;
  let heroFilmTransitioning = false;

  const playVideo = (video) => {
    if (!video) return;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }
  };

  const resetVideoToStart = (video) => {
    if (!video) return;
    try {
      video.currentTime = 0.01;
    } catch (error) {
      video.addEventListener('loadedmetadata', () => {
        try { video.currentTime = 0.01; } catch (_) {}
      }, { once: true });
    }
  };

  const activateHeroFilm = (nextIndex) => {
    if (heroFilmTransitioning || !heroFilms.length) return;
    heroFilmTransitioning = true;

    const current = heroFilms[activeHeroFilm];
    const next = heroFilms[nextIndex % heroFilms.length];
    if (!current || !next || current === next) {
      heroFilmTransitioning = false;
      return;
    }

    resetVideoToStart(next);
    playVideo(next);
    next.classList.add('is-active');

    window.setTimeout(() => {
      current.classList.remove('is-active');
      window.setTimeout(() => {
        current.pause();
        resetVideoToStart(current);
        activeHeroFilm = nextIndex % heroFilms.length;
        heroFilmTransitioning = false;
      }, 900);
    }, 120);
  };

  if (heroFilms.length) {
    heroFilms.forEach((film, index) => {
      film.loop = heroFilms.length === 1;
      film.muted = true;
      film.playsInline = true;
      film.addEventListener('timeupdate', () => {
        const remaining = film.duration - film.currentTime;
        if (index === activeHeroFilm && Number.isFinite(remaining) && remaining <= 1.35) {
          activateHeroFilm(activeHeroFilm + 1);
        }
      });
      film.addEventListener('ended', () => {
        if (index === activeHeroFilm) activateHeroFilm(activeHeroFilm + 1);
      });
    });

    heroFilms[0].classList.add('is-active');
    playVideo(heroFilms[0]);
  }

  /* ---------------- Nav: glass state + hide on scroll down ---------------- */
  const nav = document.getElementById('site-nav');
  let lastY = window.scrollY;
  let navTicking = false;

  function handleNav() {
    const y = window.scrollY;
    if (y > 24) nav.classList.add('nav-scrolled');
    else nav.classList.remove('nav-scrolled');

    if (y > lastY && y > 160) nav.classList.add('nav-hidden');
    else nav.classList.remove('nav-hidden');

    lastY = y;
    navTicking = false;
  }

  window.addEventListener('scroll', () => {
    if (!navTicking) {
      requestAnimationFrame(handleNav);
      navTicking = true;
    }
  });

  /* ---------------- Mobile menu ---------------- */
  const menuBtn = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('is-open');
      menuBtn.classList.toggle('is-open', isOpen);
      menuBtn.setAttribute('aria-expanded', isOpen);
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('is-open');
        menuBtn.classList.remove('is-open');
        menuBtn.setAttribute('aria-expanded', false);
      });
    });
  }

  /* ---------------- Service selector: show one service detail at a time ---------------- */
  const serviceButtons = document.querySelectorAll('.service-option');
  const servicePanels = document.querySelectorAll('.service-detail-panel');

  if (serviceButtons.length && servicePanels.length) {
    const servicePanelWrap = document.querySelector('.service-detail-panels');
    const servicePanelHome = servicePanelWrap ? document.createComment('service-detail-home') : null;
    const mobileServicesQuery = window.matchMedia('(max-width: 1023px)');

    if (servicePanelWrap && servicePanelHome) {
      servicePanelWrap.parentNode.insertBefore(servicePanelHome, servicePanelWrap);
    }

    const placeServicePanel = (button) => {
      if (!servicePanelWrap || !servicePanelHome) return;

      if (mobileServicesQuery.matches) {
        button.insertAdjacentElement('afterend', servicePanelWrap);
      } else if (servicePanelHome.parentNode) {
        servicePanelHome.parentNode.insertBefore(servicePanelWrap, servicePanelHome.nextSibling);
      }
    };

    const collapseService = () => {
      serviceButtons.forEach((item) => {
        item.classList.remove('is-active');
        item.setAttribute('aria-selected', 'false');
      });

      servicePanels.forEach((panel) => {
        panel.classList.remove('is-active', 'is-visible');
        panel.setAttribute('aria-hidden', 'true');
      });

      if (servicePanelWrap) {
        servicePanelWrap.classList.add('is-collapsed');
      }
    };

    const activateService = (button) => {
      const target = button.dataset.service;
      placeServicePanel(button);

      if (servicePanelWrap) {
        servicePanelWrap.classList.remove('is-collapsed');
      }

      serviceButtons.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle('is-active', isActive);
        item.setAttribute('aria-selected', String(isActive));
      });

      servicePanels.forEach((panel) => {
        const isActive = panel.id === `service-panel-${target}`;
        if (isActive) {
          panel.classList.remove('is-visible');
          panel.classList.add('is-active');
          panel.setAttribute('aria-hidden', 'false');
          requestAnimationFrame(() => {
            requestAnimationFrame(() => panel.classList.add('is-visible'));
          });
        } else {
          panel.classList.remove('is-active', 'is-visible');
          panel.setAttribute('aria-hidden', 'true');
        }
      });
    };

    serviceButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const isOpenMobileItem = mobileServicesQuery.matches
          && button.classList.contains('is-active')
          && servicePanelWrap
          && !servicePanelWrap.classList.contains('is-collapsed');

        if (isOpenMobileItem) {
          collapseService();
        } else {
          activateService(button);
        }
      });
    });

    const handleServiceLayoutChange = () => {
      const activeButton = document.querySelector('.service-option.is-active');

      if (mobileServicesQuery.matches) {
        if (activeButton && servicePanelWrap && !servicePanelWrap.classList.contains('is-collapsed')) {
          placeServicePanel(activeButton);
        } else {
          collapseService();
        }
      } else {
        activateService(activeButton || serviceButtons[0]);
      }
    };

    if (mobileServicesQuery.addEventListener) {
      mobileServicesQuery.addEventListener('change', handleServiceLayoutChange);
    } else {
      mobileServicesQuery.addListener(handleServiceLayoutChange);
    }

    const hashTarget = window.location.hash.replace('#', '');
    const hashButton = hashTarget && Array.from(serviceButtons).find((item) => item.dataset.service === hashTarget);
    if (hashButton) {
      activateService(hashButton);
      window.requestAnimationFrame(() => {
        hashButton.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    } else if (mobileServicesQuery.matches) {
      collapseService();
    } else {
      placeServicePanel(document.querySelector('.service-option.is-active') || serviceButtons[0]);
    }
  }

  /* ---------------- Sticky FAB stack: hide on scroll down, show on scroll up ---------------- */
  const fabStack = document.getElementById('fab-stack');
  let lastFabY = window.scrollY;
  let fabTicking = false;

  function handleFab() {
    const y = window.scrollY;
    if (y < 200) {
      fabStack.classList.add('fab-hidden');
    } else if (y > lastFabY) {
      fabStack.classList.add('fab-hidden');
    } else {
      fabStack.classList.remove('fab-hidden');
    }
    lastFabY = y;
    fabTicking = false;
  }

  window.addEventListener('scroll', () => {
    if (!fabTicking) {
      requestAnimationFrame(handleFab);
      fabTicking = true;
    }
  });

  /* ---------------- Back to top ---------------- */
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------------- Scroll reveal via IntersectionObserver ---------------- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------------- Animated stat counters ---------------- */
  const statEls = document.querySelectorAll('.stat-num');
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const duration = 1600;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = (target * eased);
        el.textContent = (Number.isInteger(target) ? Math.round(current) : current.toFixed(1)) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      statObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  statEls.forEach(el => statObserver.observe(el));

  /* ---------------- Testimonial carousel ---------------- */
  const track = document.getElementById('testimonial-track');
  const dotsWrap = document.getElementById('testimonial-dots');
  if (track && dotsWrap) {
    const slides = track.children.length;
    let current = 0;

    for (let i = 0; i < slides; i++) {
      const dot = document.createElement('button');
      dot.className = 'testimonial-dot h-2 w-2 rounded-full bg-[var(--eye-gray-line)]';
      dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }

    function goTo(i) {
      current = (i + slides) % slides;
      track.style.transform = `translateX(-${current * 100}%)`;
      [...dotsWrap.children].forEach((d, idx) => d.classList.toggle('active', idx === current));
    }
    goTo(0);

    document.getElementById('testimonial-prev')?.addEventListener('click', () => goTo(current - 1));
    document.getElementById('testimonial-next')?.addEventListener('click', () => goTo(current + 1));

    let autoplay = setInterval(() => goTo(current + 1), 6000);
    track.closest('.testimonial-wrap')?.addEventListener('mouseenter', () => clearInterval(autoplay));
    track.closest('.testimonial-wrap')?.addEventListener('mouseleave', () => {
      autoplay = setInterval(() => goTo(current + 1), 6000);
    });
  }

  /* ---------------- Gallery lightbox (simple) ---------------- */
  const galleryItems = document.querySelectorAll('[data-lightbox]');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');

  if (lightbox) {
    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxCaption.textContent = item.dataset.caption || '';
        lightbox.classList.add('is-open');
        document.body.style.overflow = 'hidden';
      });
    });
    document.getElementById('lightbox-close')?.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
  }
  function closeLightbox() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  /* ---------------- Smooth anchor scroll offset for fixed nav ---------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId.length <= 1) return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const offset = 88;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ---------------- Subtle hero parallax on pointer move (desktop only) ---------------- */
  const heroLayer = document.getElementById('hero-parallax');
  const heroSection = document.getElementById('hero');
  let heroPointerX = 0;
  let heroPointerY = 0;
  let heroScrollY = 0;

  const heroParallaxScale = window.matchMedia('(max-width: 640px)').matches ? 1.02 : 1.06;
  const applyHeroTransform = () => {
    if (!heroLayer) return;
    heroLayer.style.transform = `translate(${heroPointerX}px, ${heroPointerY + heroScrollY}px) scale(${heroParallaxScale})`;
  };

  if (heroLayer && window.matchMedia('(pointer: fine)').matches) {
    heroSection?.addEventListener('mousemove', (e) => {
      const { innerWidth, innerHeight } = window;
      heroPointerX = (e.clientX / innerWidth - 0.5) * 14;
      heroPointerY = (e.clientY / innerHeight - 0.5) * 14;
      applyHeroTransform();
    });
  }

  /* ---------------- Subtle scroll parallax on hero imagery ---------------- */
  if (heroLayer && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.addEventListener('scroll', () => {
      const rect = heroSection.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      heroScrollY = window.scrollY * 0.12;
      applyHeroTransform();
    }, { passive: true });
  }

});
