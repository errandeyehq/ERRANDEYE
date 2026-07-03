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

  /* ---------------- Hero image slider ---------------- */
  const heroSlides = [...document.querySelectorAll('.hero-slide')];
  const heroDots = [...document.querySelectorAll('.hero-dot')];
  let heroSlideIndex = 0;
  let heroSlideTimer;

  function showHeroSlide(index) {
    if (!heroSlides.length) return;
    heroSlideIndex = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach((slide, i) => slide.classList.toggle('is-active', i === heroSlideIndex));
    heroDots.forEach((dot, i) => dot.classList.toggle('is-active', i === heroSlideIndex));
  }

  if (heroSlides.length) {
    const startHeroSlides = () => {
      clearInterval(heroSlideTimer);
      heroSlideTimer = setInterval(() => showHeroSlide(heroSlideIndex + 1), 5500);
    };

    heroDots.forEach(dot => {
      dot.addEventListener('click', () => {
        showHeroSlide(Number(dot.dataset.slide || 0));
        startHeroSlides();
      });
    });

    showHeroSlide(0);
    startHeroSlides();
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

  const applyHeroTransform = () => {
    if (!heroLayer) return;
    heroLayer.style.transform = `translate(${heroPointerX}px, ${heroPointerY + heroScrollY}px) scale(1.06)`;
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
