/* NGS Black Friday webinar funnel — page behaviour.
   One page, one action: every CTA opens the same registration modal. */
(function () {
  'use strict';

  var CFG = window.NGS_CONFIG || {};
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- pixel */
  function loadPixel() {
    if (!CFG.loadPixel || !CFG.metaPixelId || window.fbq) return;
    /* eslint-disable */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq('init', CFG.metaPixelId);
    window.fbq('track', 'PageView');
  }
  // NOTE: never fire `Lead` from this funnel — the main site values Lead at
  // $4,000 on the retainer Typeform, and free signups would wreck that data.
  function track(event, params) {
    if (window.fbq) window.fbq('track', event, params || {});
  }
  loadPixel();

  /* ------------------------------------------------------------- countdown */
  var target = new Date(CFG.webinarAt || '').getTime();
  var hasDate = !isNaN(target);

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function renderLocalTime() {
    var el = $('[data-local-time]');
    if (!el) return;
    if (!hasDate) { el.textContent = '[PLACEHOLDER: webinar date + time — set webinarAt in config.js]'; return; }
    var narrow = window.innerWidth < 640;
    try {
      el.textContent = new Date(target).toLocaleString(undefined, {
        weekday: narrow ? 'short' : 'long',
        month: narrow ? 'short' : 'long',
        day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short'
      }) + (narrow ? '' : ' · your local time');
    } catch (e) {
      el.textContent = new Date(target).toString();
    }
  }

  function tick() {
    if (!hasDate) return;
    var left = Math.max(0, target - Date.now());
    var sec = Math.floor(left / 1000);
    var parts = {
      d: Math.floor(sec / 86400),
      h: Math.floor((sec % 86400) / 3600),
      m: Math.floor((sec % 3600) / 60),
      s: sec % 60
    };
    $$('[data-cd]').forEach(function (el) { el.textContent = pad(parts[el.getAttribute('data-cd')]); });
    var short = $('[data-sticky-cd]');
    if (short) short.textContent = parts.d + 'd ' + parts.h + 'h ' + pad(parts.m) + 'm';
  }
  renderLocalTime();
  tick();
  if (hasDate) setInterval(tick, 1000);

  /* ------------------------------------------------------------ accordions */
  $$('.accordion__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      if (panel) {
        if (open) panel.removeAttribute('data-open');
        else panel.setAttribute('data-open', '');
      }
      var sym = $('.accordion__sym', btn);
      if (sym) sym.textContent = open ? '+' : '−';
    });
  });

  /* ------------------------------------------------------------ stat count */
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var counters = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        counters.unobserve(el);
        var end = parseInt(el.getAttribute('data-count'), 10);
        var prefix = el.getAttribute('data-prefix') || '';
        var start = performance.now();
        var dur = 1100;
        (function step(now) {
          var p = Math.min(1, (now - start) / dur);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = prefix + Math.round(end * eased).toLocaleString();
          if (p < 1) requestAnimationFrame(step);
        })(start);
      });
    }, { threshold: 0.4 });
    $$('[data-count]').forEach(function (el) { counters.observe(el); });
  }

  /* ------------------------------------------------------------------- VSL */
  (function vsl() {
    var frame = $('[data-vsl]');
    if (!frame) return;
    var video = $('[data-vsl-video]', frame);
    var placeholder = $('[data-vsl-placeholder]', frame);
    var unmute = $('[data-vsl-unmute]', frame);
    var bar = $('[data-vsl-progress]', frame);
    var heroCta = $('[data-vsl-cta]');
    var nudged = false;
    var KEY = 'ngs-vsl-position';

    if (!CFG.vslSrc) {
      console.warn('NGS: vslSrc is empty \u2014 the VSL placeholder is showing.');
      return;
    }

    video.src = CFG.vslSrc;
    if (CFG.vslPoster) video.poster = CFG.vslPoster;
    video.hidden = false;
    placeholder.hidden = true;
    unmute.hidden = false;

    try {
      var saved = parseFloat(sessionStorage.getItem(KEY));
      if (saved > 0) video.currentTime = saved;
    } catch (e) { /* private mode */ }

    var play = video.play();
    if (play && play.catch) play.catch(function () { /* autoplay blocked; overlay still works */ });

    unmute.addEventListener('click', function () {
      video.muted = false;
      video.play();
      unmute.hidden = true;
      track('ViewContent', { content_name: 'BFCM VSL' });
    });

    video.addEventListener('timeupdate', function () {
      if (!video.duration) return;
      var pct = (video.currentTime / video.duration) * 100;
      if (bar) bar.style.width = pct + '%';
      try { sessionStorage.setItem(KEY, String(video.currentTime)); } catch (e) { /* noop */ }
      // Nudge the CTA once the viewer is 60% in — never move it, never hide it.
      if (!nudged && pct >= 60 && heroCta && !reduceMotion) {
        nudged = true;
        heroCta.classList.add('btn--pulse');
      }
    });

    // Pause when the player scrolls away, resume when it comes back.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { if (video.paused) video.play().catch(function () {}); }
          else if (!video.paused) video.pause();
        });
      }, { threshold: 0.35 }).observe(frame);
    }
  })();

  /* ---------------------------------------------------- video testimonials */
  $$('[data-testimonial]').forEach(function (box) {
    var src = box.getAttribute('data-src');
    if (!src) return;
    var v = document.createElement('video');
    v.src = src; v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'metadata';
    v.setAttribute('aria-label', 'Client testimonial');
    v.controls = true;
    box.innerHTML = '';
    box.appendChild(v);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { e.isIntersecting ? v.play().catch(function () {}) : v.pause(); });
      }, { threshold: 0.5 }).observe(box);
    }
  });

  /* ------------------------------------------------------- sticky mobile CTA */
  (function sticky() {
    var bar = $('[data-sticky]');
    var hero = $('.hero');
    if (!bar || !hero || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) bar.removeAttribute('data-show');
        else bar.setAttribute('data-show', '');
      });
    }, { threshold: 0.15 }).observe(hero);
  })();

  /* ----------------------------------------------------------------- modal */
  var modal = $('[data-modal]');
  var form = $('[data-form]');
  var lastFocus = null;

  function focusables() {
    return $$('a[href], button:not([disabled]), input, select, textarea', modal)
      .filter(function (el) { return el.offsetParent !== null && el.tabIndex !== -1; });
  }

  function openModal() {
    if (!modal) return;
    lastFocus = document.activeElement;
    modal.hidden = false;
    modal.setAttribute('data-open', '');
    document.body.setAttribute('data-locked', '');
    var first = $('#f-name', modal);
    if (first) first.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.removeAttribute('data-open');
    modal.hidden = true;
    document.body.removeAttribute('data-locked');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  $$('[data-register]').forEach(function (btn) {
    btn.addEventListener('click', function (e) { e.preventDefault(); openModal(); });
  });
  $$('[data-modal-close]').forEach(function (btn) {
    btn.addEventListener('click', closeModal);
  });
  document.addEventListener('keydown', function (e) {
    if (!modal || modal.hidden) return;
    if (e.key === 'Escape') { closeModal(); return; }
    if (e.key !== 'Tab') return;
    var items = focusables();
    if (!items.length) return;
    var first = items[0];
    var last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* ------------------------------------------------------------------ form */
  if (form) {
    var status = $('[data-form-status]', form);
    var submit = $('[data-form-submit]', form);
    var consent = $('#f-sms');
    var consentError = $('[data-consent-error]', form);

    function markField(input, invalid) {
      var field = input.closest('.field');
      if (!field) return;
      if (invalid) field.setAttribute('data-invalid', '');
      else field.removeAttribute('data-invalid');
    }

    function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }
    function validPhone(v) { return (v.replace(/\D/g, '').length >= 10); }

    function validate() {
      var ok = true;
      $$('.field input[required], .field select[required]', form).forEach(function (input) {
        var v = (input.value || '').trim();
        var bad = !v;
        if (!bad && input.type === 'email') bad = !validEmail(v);
        if (!bad && input.type === 'tel') bad = !validPhone(v);
        markField(input, bad);
        if (bad && ok) { input.focus(); ok = false; }
      });
      if (consent && !consent.checked) {
        if (consentError) consentError.hidden = false;
        if (ok) { consent.focus(); ok = false; }
      } else if (consentError) {
        consentError.hidden = true;
      }
      return ok;
    }

    $$('.field input, .field select', form).forEach(function (input) {
      input.addEventListener('input', function () { markField(input, false); });
      input.addEventListener('change', function () { markField(input, false); });
    });
    if (consentError) consentError.hidden = true;
    if (consent) consent.addEventListener('change', function () {
      if (consentError) consentError.hidden = consent.checked;
    });

    // GoHighLevel takes this as a workflow Inbound Webhook: flat keys map
    // straight onto contact fields in the workflow builder.
    function normalisePhone(raw) {
      var digits = (raw || '').replace(/\D/g, '');
      if (!digits) return '';
      if (digits.length === 10) return '+1' + digits;            // US default, as on the Typeform
      if (digits.length === 11 && digits.charAt(0) === '1') return '+' + digits;
      return (raw.trim().charAt(0) === '+' ? '+' : '') + digits;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (status) status.textContent = '';
      if (!validate()) return;

      var params = new URLSearchParams(window.location.search);
      var fullName = $('#f-name').value.trim();
      var firstSpace = fullName.indexOf(' ');
      var consentLabel = $('label[for="f-sms"]');

      var payload = {
        // contact
        full_name: fullName,
        first_name: firstSpace === -1 ? fullName : fullName.slice(0, firstSpace),
        last_name: firstSpace === -1 ? '' : fullName.slice(firstSpace + 1).trim(),
        email: $('#f-email').value.trim(),
        phone: normalisePhone($('#f-phone').value),
        // answers
        instagram_url: $('#f-ig').value.trim(),
        monthly_revenue: $('#f-rev').value,
        running_paid_ads: $('#f-ads').value,
        heard_about_ngs: $('#f-source').value,
        // SMS consent record — keep the wording and the timestamp, not just the flag
        sms_consent: !!(consent && consent.checked),
        sms_consent_text: consentLabel ? consentLabel.textContent.replace(/\s+/g, ' ').trim() : '',
        sms_consent_at: new Date().toISOString(),
        // context
        registration_source: 'BFCM Webinar Registration Page',
        webinar_at: CFG.webinarAt || '',
        page_url: window.location.href,
        submitted_at: new Date().toISOString(),
        utm_source: params.get('utm_source') || '',
        utm_medium: params.get('utm_medium') || '',
        utm_campaign: params.get('utm_campaign') || '',
        utm_content: params.get('utm_content') || '',
        utm_term: params.get('utm_term') || ''
      };

      function done() {
        track('CompleteRegistration', { content_name: 'BFCM Webinar', value: 0, currency: 'USD' });
        try { sessionStorage.setItem('ngs-registered-name', payload.first_name || fullName); } catch (err) { /* noop */ }
        window.location.href = CFG.thankYouUrl || 'thank-you.html';
      }

      if (!CFG.registerEndpoint) {
        // No backend wired yet. Do not pretend it sent.
        console.warn('NGS: registerEndpoint is empty \u2014 registration was not sent anywhere.');
        done();
        return;
      }

      submit.disabled = true;
      var label = submit.textContent;
      submit.textContent = 'Saving your seat\u2026';

      var body = JSON.stringify(payload);

      fetch(CFG.registerEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body
      })
        .then(function (r) {
          if (!r.ok) throw new Error('Registration failed: ' + r.status);
          done();
        })
        .catch(function (err) {
          // GHL inbound webhooks don't always answer with CORS headers, so a
          // delivered POST can still land here. Retry once as a simple
          // no-cors request, which the browser sends but won't let us read.
          console.warn('NGS: registration POST could not be read back, retrying opaque.', err);
          fetch(CFG.registerEndpoint, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
            body: body
          })
            .then(done)
            .catch(function (err2) {
              submit.disabled = false;
              submit.textContent = label;
              if (status) status.textContent = 'That didn\u2019t go through. Check your connection and try again \u2014 or email us and we\u2019ll add you by hand.';
              console.error(err2);
            });
        });
    });
  }
})();
