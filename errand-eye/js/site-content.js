/* ============================================================
   ERRAND EYE - DYNAMIC SITE CONTENT
   Fetches published content from the Django admin backend and
   overlays it onto the static markup (progressive enhancement:
   if the API is unreachable or a section is empty, the existing
   static HTML is left as-is).
   Also wires the lead ("Request a Quote") form to POST /api/leads/.
   ============================================================ */

(function () {
  const API_BASE = window.ERRAND_EYE_API_BASE || '';

  function digitsOnly(str) {
    return (str || '').replace(/[^\d+]/g, '');
  }

  function applyContactInfo(info) {
    if (!info || Object.keys(info).length === 0) return;

    if (info.phone_primary) {
      document.querySelectorAll('[data-contact="phone-primary"]').forEach((el) => {
        el.textContent = info.phone_primary;
        el.setAttribute('href', 'tel:' + digitsOnly(info.phone_primary));
      });
    }
    if (info.phone_secondary) {
      document.querySelectorAll('[data-contact="phone-secondary"]').forEach((el) => {
        el.textContent = info.phone_secondary;
        el.setAttribute('href', 'tel:' + digitsOnly(info.phone_secondary));
      });
    }
    if (info.email) {
      document.querySelectorAll('[data-contact="email"]').forEach((el) => {
        el.textContent = info.email;
        el.setAttribute('href', 'mailto:' + info.email);
      });
    }
    if (info.offices && info.offices.length) {
      const officesText = info.offices.join(' · ');
      document.querySelectorAll('[data-contact="offices"]').forEach((el) => {
        el.textContent = officesText;
      });
    }
    if (info.business_hours) {
      document.querySelectorAll('[data-contact="hours"]').forEach((el) => {
        el.textContent = info.business_hours;
      });
    }
    if (info.whatsapp_number) {
      document.querySelectorAll('[data-contact="whatsapp-link"]').forEach((el) => {
        el.setAttribute('href', 'https://wa.me/' + digitsOnly(info.whatsapp_number).replace('+', ''));
      });
    }
  }

  function quoteSvg() {
    return '<svg width="28" height="20" viewBox="0 0 28 20" fill="none" class="mx-auto mb-6 opacity-40"><path d="M0 20V11.4C0 4.2 4.4 0 11 0v4.5C7.5 4.5 5 6.8 5 11h6v9H0zm17 0V11.4C17 4.2 21.4 0 28 0v4.5c-3.5 0-6 2.3-6 6.5h6v9H17z" fill="#FAFAF7"/></svg>';
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function renderTestimonials(items) {
    if (!items || !items.length) return;
    const track = document.getElementById('testimonial-track');
    const dotsWrap = document.getElementById('testimonial-dots');
    if (!track || !dotsWrap) return;

    track.innerHTML = items.map((t) => `
      <div class="w-full flex-shrink-0 px-4">
        ${quoteSvg()}
        <p class="font-display text-xl sm:text-2xl italic leading-relaxed text-eye-cream/90">"${escapeHtml(t.quote)}"</p>
        <p class="mt-6 font-mono text-xs uppercase tracking-wider text-eye-cream/50">${escapeHtml(t.author_name)}${t.author_title ? ' · ' + escapeHtml(t.author_title) : ''}</p>
      </div>
    `).join('');

    dotsWrap.innerHTML = '';
    let current = 0;
    const slideCount = items.length;

    function goTo(i) {
      current = (i + slideCount) % slideCount;
      track.style.transform = `translateX(-${current * 100}%)`;
      [...dotsWrap.children].forEach((d, idx) => d.classList.toggle('active', idx === current));
    }

    for (let i = 0; i < slideCount; i++) {
      const dot = document.createElement('button');
      dot.className = 'testimonial-dot h-2 w-2 rounded-full bg-[var(--eye-gray-line)]';
      dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
    goTo(0);

    const prevBtn = document.getElementById('testimonial-prev');
    const nextBtn = document.getElementById('testimonial-next');
    if (prevBtn) prevBtn.onclick = () => goTo(current - 1);
    if (nextBtn) nextBtn.onclick = () => goTo(current + 1);
  }

  function renderStats(items) {
    if (!items || items.length !== 4) return; // homepage layout has exactly 4 stat slots
    const nodes = document.querySelectorAll('.stat-num');
    if (nodes.length !== 4) return;
    nodes.forEach((el, i) => {
      const stat = items[i];
      el.dataset.count = stat.value;
      if (stat.suffix) el.dataset.suffix = stat.suffix;
      el.textContent = stat.value + (stat.suffix || '');
    });
  }

  function renderAwards(items) {
    if (!items || !items.length) return;
    document.querySelectorAll('[data-dynamic="awards-track"]').forEach((track) => {
      const style = track.dataset.awardStyle || 'plain';
      const group = items.map((a) => {
        const meta = [a.issuer, a.year].filter(Boolean).join(' · ');
        if (style === 'icon') {
          return `
            <div class="award-item flex items-center gap-4">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#0EA55A" stroke-width="1.3" class="shrink-0 opacity-70"><circle cx="12" cy="8" r="6"/><path d="M8.5 13.2L7 22l5-2.6 5 2.6-1.5-8.8"/></svg>
              <div class="text-left">
                <p class="font-display text-2xl mb-1">${escapeHtml(a.title)}</p>
                <p class="font-mono text-xs uppercase tracking-wider text-eye-charcoal/50">${escapeHtml(meta)}</p>
              </div>
            </div>
            <div class="h-10 w-px bg-eye-gray-line"></div>`;
        }
        return `
          <div class="text-center">
            <p class="font-display text-2xl mb-1">${escapeHtml(a.title)}</p>
            <p class="font-mono text-xs uppercase tracking-wider text-eye-charcoal/50">${escapeHtml(meta)}</p>
          </div>
          <div class="h-10 w-px bg-eye-gray-line"></div>`;
      }).join('');
      // Strip the trailing divider, then duplicate the group for the seamless marquee loop.
      const trimmed = group.replace(/<div class="h-10 w-px bg-eye-gray-line"><\/div>\s*$/, '');
      track.innerHTML = `
        <div class="flex items-center gap-16 pr-16">${trimmed}</div>
        <div class="flex items-center gap-16 pr-16" aria-hidden="true">${trimmed}</div>
      `;
    });
  }

  function renderPricing(items) {
    if (!items || !items.length) return;
    const wrap = document.querySelector('[data-dynamic="pricing"]');
    if (!wrap) return;
    wrap.innerHTML = items.map((p) => `
      <div class="rounded-3xl border border-eye-gray-line bg-white p-8 shadow-sm">
        <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-eye-charcoal/50 mb-4">${escapeHtml(p.title)}</p>
        <ul class="space-y-3 text-sm text-eye-charcoal/75 leading-relaxed">
          ${p.features.map((f) => `<li class="flex items-start gap-2.5"><span class="mt-1.5 h-1 w-1 rounded-full bg-eye-green shrink-0"></span>${escapeHtml(f)}</li>`).join('')}
        </ul>
      </div>
    `).join('');
  }

  function renderGallery(items) {
    if (!items || !items.length) return;
    const grid = document.querySelector('[data-dynamic="gallery"]');
    if (!grid) return;
    grid.innerHTML = items.map((img) => `
      <div class="gallery-item relative rounded-2xl overflow-hidden cursor-pointer" data-lightbox data-caption="${escapeHtml(img.caption)}">
        <img src="${img.image_url}" alt="${escapeHtml(img.caption)}" class="w-full h-full object-cover" loading="lazy">
      </div>
    `).join('');
    // Re-wire the lightbox for the freshly injected items (main.js only wires it on initial load).
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    if (!lightbox) return;
    grid.querySelectorAll('[data-lightbox]').forEach((item) => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxCaption.textContent = item.dataset.caption || '';
        lightbox.classList.add('is-open');
        document.body.style.overflow = 'hidden';
      });
    });
  }

  function wireLeadForm() {
    const toggle = document.getElementById('lead-form-toggle');
    const wrap = document.getElementById('lead-form-wrap');
    if (toggle && wrap) {
      toggle.addEventListener('click', () => {
        const isOpen = wrap.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', isOpen);
        if (isOpen) {
          wrap.querySelector('#lead-name')?.focus({ preventScroll: false });
        }
      });
    }

    const form = document.getElementById('lead-form');
    if (!form) return;
    const statusEl = document.getElementById('lead-form-status');
    const submitBtn = document.getElementById('lead-form-submit');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        name: form.name.value.trim(),
        phone: form.phone.value.trim(),
        email: form.email.value.trim(),
        service: form.service.value,
        message: form.message.value.trim(),
      };

      if (!payload.name || !payload.message) {
        statusEl.textContent = 'Please fill in your name and message.';
        statusEl.className = 'mt-4 text-sm is-error';
        return;
      }

      submitBtn.disabled = true;
      statusEl.textContent = 'Sending...';
      statusEl.className = 'mt-4 text-sm';

      try {
        const res = await fetch(`${API_BASE}/leads/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Request failed');
        statusEl.textContent = "Thanks, we've got your request. We'll be in touch shortly.";
        statusEl.className = 'mt-4 text-sm is-success';
        form.reset();
      } catch (err) {
        statusEl.textContent = "Something went wrong sending that. Please try WhatsApp or email instead.";
        statusEl.className = 'mt-4 text-sm is-error';
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  async function init() {
    wireLeadForm();

    if (!API_BASE) return;
    try {
      const res = await fetch(`${API_BASE}/site-content/`);
      if (!res.ok) return;
      const data = await res.json();
      applyContactInfo(data.contact_info);
      renderTestimonials(data.testimonials);
      renderStats(data.stats);
      renderAwards(data.awards);
      renderPricing(data.pricing);
      renderGallery(data.gallery);
    } catch (err) {
      // API unreachable: leave the static fallback content as-is.
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
