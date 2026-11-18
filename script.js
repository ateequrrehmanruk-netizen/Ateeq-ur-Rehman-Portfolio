/* =========================================================
   Ateeq Ur Rehman — Portfolio interactions
   ========================================================= */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- Preloader ---------- */
  var preloader = $('#preloader');
  var countEl = $('#preloadCount');
  var barEl = $('#preloadBar');
  var started = false;

  function finishPreload() {
    if (!preloader || preloader.classList.contains('is-done')) return;
    preloader.classList.add('is-done');
    document.documentElement.classList.add('is-loaded');
    window.setTimeout(function () {
      if (preloader && preloader.parentNode) preloader.parentNode.removeChild(preloader);
    }, 1600);
  }

  function runPreloader() {
    if (started) return;
    started = true;
    if (!countEl || reduced) { finishPreload(); return; }

    var start = performance.now();
    var duration = 1150;

    /* never let a throttled tab keep the preloader on screen */
    window.setTimeout(finishPreload, duration + 1800);

    function tick(now) {
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var n = Math.round(eased * 100);
      countEl.textContent = n < 10 ? '0' + n : String(n);
      if (barEl) barEl.style.width = n + '%';
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        window.setTimeout(finishPreload, 220);
      }
    }
    requestAnimationFrame(tick);
  }

  if (document.readyState === 'complete') {
    runPreloader();
  } else {
    window.addEventListener('load', runPreloader);
    window.setTimeout(runPreloader, 2600); /* safety net */
  }

  /* ---------- Split hero lines for reveal masks ---------- */
  $$('[data-split]').forEach(function (line, i) {
    var inner = document.createElement('span');
    inner.className = 'line__in';
    inner.style.setProperty('--d', (0.18 + i * 0.13) + 's');
    while (line.firstChild) inner.appendChild(line.firstChild);
    line.appendChild(inner);
  });

  /* ---------- Rotating role ---------- */
  var roles = ['IT Support', 'Technical Support', 'Trainee Engineer', 'Systems Engineer'];
  var rotator = $('#roleRotator');
  var roleIndex = 0;
  if (rotator && !reduced) {
    window.setInterval(function () {
      rotator.classList.add('is-out');
      window.setTimeout(function () {
        roleIndex = (roleIndex + 1) % roles.length;
        rotator.textContent = roles[roleIndex];
        rotator.classList.remove('is-out');
      }, 320);
    }, 2800);
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = $$('[data-reveal]');
  revealEls.forEach(function (el) {
    var siblings = Array.prototype.filter.call(el.parentElement.children, function (c) {
      return c.hasAttribute('data-reveal');
    });
    if (siblings.length > 1) {
      el.style.setProperty('--d', (siblings.indexOf(el) * 80) + 'ms');
    }
  });

  if ('IntersectionObserver' in window && !reduced) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Animated counters ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);

    function format(value) {
      return value.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
    }

    if (reduced) { el.textContent = format(target); return; }

    var start = performance.now();
    var duration = 1500;

    function step(now) {
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 4);
      el.textContent = format(target * eased);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = format(target);
    }
    requestAnimationFrame(step);
  }

  var counters = $$('[data-count]');
  if ('IntersectionObserver' in window) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { countObserver.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- Navigation state + scroll progress ---------- */
  var nav = $('#nav');
  var progress = $('#scrollBar');
  var toTop = $('#toTop');
  var sections = $$('main section[id]');
  var navLinks = $$('.nav__links a[data-nav]');

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;

    if (nav) nav.classList.toggle('is-scrolled', y > 24);

    var docH = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (docH > 0 ? Math.min((y / docH) * 100, 100) : 0) + '%';

    if (toTop) toTop.classList.toggle('is-visible', y > 720);

    var current = '';
    sections.forEach(function (section) {
      if (section.offsetTop - 160 <= y) current = section.id;
    });
    navLinks.forEach(function (link) {
      link.classList.toggle('is-active', link.getAttribute('href') === '#' + current);
    });
  }

  var scrollQueued = false;
  window.addEventListener('scroll', function () {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(function () {
      onScroll();
      scrollQueued = false;
    });
  }, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Mobile menu ---------- */
  var burger = $('#burger');
  var menu = $('#menu');

  function setMenu(open) {
    if (!burger || !menu) return;
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('menu-open', open);
  }

  if (burger && menu) {
    burger.addEventListener('click', function () {
      setMenu(!menu.classList.contains('is-open'));
    });
    $$('a', menu).forEach(function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
  }

  /* ---------- Spotlight + custom cursor ---------- */
  var cursor = $('.cursor');
  var root = document.documentElement;
  var pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  var cursorPos = { x: pointer.x, y: pointer.y };
  var pointerActive = false;

  if (finePointer && cursor && !reduced) {
    window.addEventListener('pointermove', function (e) {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      if (!pointerActive) {
        pointerActive = true;
        cursor.classList.add('is-active');
      }
      root.style.setProperty('--sx', e.clientX + 'px');
      root.style.setProperty('--sy', e.clientY + 'px');
    }, { passive: true });

    (function loop() {
      cursorPos.x += (pointer.x - cursorPos.x) * 0.16;
      cursorPos.y += (pointer.y - cursorPos.y) * 0.16;
      cursor.style.transform = 'translate3d(' + cursorPos.x + 'px,' + cursorPos.y + 'px,0)';
      requestAnimationFrame(loop);
    })();

    var hoverTargets = 'a, button, [data-tilt], .copy, .chip';
    document.addEventListener('pointerover', function (e) {
      if (e.target.closest && e.target.closest(hoverTargets)) cursor.classList.add('is-hover');
    });
    document.addEventListener('pointerout', function (e) {
      if (e.target.closest && e.target.closest(hoverTargets)) cursor.classList.remove('is-hover');
    });
  }

  /* ---------- Card glow + tilt ---------- */
  $$('.card--glow').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
      card.style.setProperty('--my', (e.clientY - rect.top) + 'px');
    }, { passive: true });
  });

  if (finePointer && !reduced) {
    $$('[data-tilt]').forEach(function (card) {
      var raf = null;
      card.addEventListener('pointermove', function (e) {
        if (raf) return;
        raf = requestAnimationFrame(function () {
          var r = card.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width - 0.5;
          var py = (e.clientY - r.top) / r.height - 0.5;
          card.style.transform =
            'perspective(1000px) rotateX(' + (-py * 3).toFixed(2) + 'deg) rotateY(' +
            (px * 3).toFixed(2) + 'deg)';
          raf = null;
        });
      });
      card.addEventListener('pointerleave', function () {
        if (raf) { cancelAnimationFrame(raf); raf = null; }
        card.style.transform = '';
      });
    });
  }

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !reduced) {
    $$('.magnetic').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.18;
        var y = (e.clientY - r.top - r.height / 2) * 0.28;
        el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      });
      el.addEventListener('pointerleave', function () {
        el.style.transform = '';
      });
    });
  }

  /* ---------- Copy email ---------- */
  var toast = $('#toast');
  var toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 2200);
  }

  function legacyCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (err) { /* no-op */ }
    document.body.removeChild(ta);
  }

  $$('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var done = function () {
        showToast('Email copied to clipboard');
        var original = btn.textContent;
        btn.textContent = 'Copied';
        btn.classList.add('is-done');
        window.setTimeout(function () {
          btn.textContent = original;
          btn.classList.remove('is-done');
        }, 1800);
      };

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done).catch(function () {
          legacyCopy(text);
          done();
        });
      } else {
        legacyCopy(text);
        done();
      }
    });
  });

  /* ---------- Portrait photo (optional) ---------- */
  var portrait = $('.portrait__img');
  if (portrait) {
    var frame = portrait.closest('.portrait__frame');
    var revealPhoto = function () {
      if (frame) frame.classList.add('has-img');
      portrait.classList.add('is-loaded');
    };
    if (portrait.complete && portrait.naturalWidth > 0) {
      revealPhoto();
    } else {
      portrait.addEventListener('load', revealPhoto);
      portrait.addEventListener('error', function () {
        /* no photo supplied yet — the monogram stays */
      });
    }
  }

  /* ---------- Footer year ---------- */
  var year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

})();
