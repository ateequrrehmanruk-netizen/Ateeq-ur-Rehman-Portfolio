/* =========================================================
   Ateeq Ur Rehman — Portfolio interactions
   ========================================================= */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- Navigation state ---------- */
  var nav = $('#nav');
  var toTop = $('#toTop');
  var sections = $$('main section[id]');
  var navLinks = $$('.nav__links a[data-nav]');

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;

    if (nav) nav.classList.toggle('is-scrolled', y > 24);
    if (toTop) toTop.classList.toggle('is-visible', y > 720);

    var current = '';
    sections.forEach(function (section) {
      if (section.offsetTop - 160 <= y) current = section.id;
    });
    navLinks.forEach(function (link) {
      link.classList.toggle('is-active', link.getAttribute('href') === '#' + current);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo(0, 0);
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
