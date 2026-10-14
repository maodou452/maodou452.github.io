/* =========================================================
   个人主页交互脚本（原生 JS，无任何依赖）
   ========================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- 1. 年份 ---------- */
  var yearEl = $('#year');
  if (yearEl) { yearEl.textContent = String(new Date().getFullYear()); }

  /* ---------- 2. 主题切换（深色 / 浅色，记忆在 localStorage） ---------- */
  var THEME_KEY = 'pw-theme';
  var themeBtn = $('#themeToggle');
  var themeIcon = themeBtn ? $('.icon-btn__icon', themeBtn) : null;
  var themeColorMeta = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeIcon) { themeIcon.textContent = theme === 'light' ? '☀️' : '🌙'; }
    if (themeColorMeta) { themeColorMeta.setAttribute('content', theme === 'light' ? '#f5f6fb' : '#0a0c14'); }
    if (themeBtn) { themeBtn.setAttribute('title', theme === 'light' ? '切换到深色' : '切换到浅色'); }
  }

  var savedTheme = null;
  try { savedTheme = localStorage.getItem(THEME_KEY); } catch (e) { savedTheme = null; }
  if (!savedTheme) {
    savedTheme = (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark';
  }
  applyTheme(savedTheme);

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* 隐私模式忽略 */ }
    });
  }

  /* ---------- 3. 导航：滚动态 / 当前区块高亮 / 移动端菜单 ---------- */
  var nav = $('#nav');
  var navMenu = $('#navMenu');
  var burger = $('#navBurger');
  var navLinks = $$('.nav__link');
  var sections = navLinks
    .map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); })
    .filter(Boolean);

  function closeMenu() {
    if (!navMenu || !burger) { return; }
    navMenu.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', '打开菜单');
  }

  if (burger && navMenu) {
    burger.addEventListener('click', function () {
      var open = navMenu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    });
  }

  navLinks.forEach(function (a) { a.addEventListener('click', closeMenu); });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeMenu(); }
  });

  document.addEventListener('click', function (e) {
    if (!navMenu || !burger || !navMenu.classList.contains('is-open')) { return; }
    if (!navMenu.contains(e.target) && !burger.contains(e.target)) { closeMenu(); }
  });

  /* ---------- 4. 回到顶部按钮 ---------- */
  var toTop = $('#toTop');
  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- 5. 滚动相关（合并到一个 scroll 监听里，用 rAF 节流） ---------- */
  var ticking = false;

  function onScroll() {
    var y = window.pageYOffset || root.scrollTop;

    if (nav) { nav.classList.toggle('is-scrolled', y > 12); }
    if (toTop) { toTop.classList.toggle('is-on', y > 460); }

    // 当前所在区块高亮
    var offset = y + 140;
    var current = sections[0];
    sections.forEach(function (sec) {
      if (sec.offsetTop <= offset) { current = sec; }
    });
    if (current) {
      navLinks.forEach(function (a) {
        a.classList.toggle('is-active', a.getAttribute('href') === '#' + current.id);
      });
    }

    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onScroll);
    }
  }, { passive: true });

  window.addEventListener('resize', onScroll, { passive: true });

  /* ---------- 6. 打字机效果 ---------- */
  var typed = $('#typed');
  if (typed) {
    var words = (typed.getAttribute('data-words') || '').split(',').map(function (w) { return w.trim(); }).filter(Boolean);
    var wIndex = 0, cIndex = 0, deleting = false;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce || words.length === 0) {
      typed.textContent = words[0] || '';
    } else {
      (function tick() {
        var word = words[wIndex];
        typed.textContent = word.slice(0, cIndex);
        var delay = deleting ? 70 : 150;

        if (!deleting && cIndex === word.length) {
          deleting = true;
          delay = 1500;               // 整词停留
        } else if (deleting && cIndex === 0) {
          deleting = false;
          wIndex = (wIndex + 1) % words.length;
          delay = 320;
        } else {
          cIndex += deleting ? -1 : 1;
        }
        window.setTimeout(tick, delay);
      })();
    }
  }

  /* ---------- 7. 滚动进场动画 ---------- */
  var revealEls = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- 8. 数字滚动 ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-target')) || 0;
    var duration = 1400;
    var start = null;

    function step(ts) {
      if (start === null) { start = ts; }
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);          // easeOutCubic
      el.textContent = Math.round(target * eased).toLocaleString('en-US');
      if (p < 1) { window.requestAnimationFrame(step); }
    }
    window.requestAnimationFrame(step);
  }

  var counters = $$('.count');
  if (counters.length && 'IntersectionObserver' in window) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { countObserver.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = el.getAttribute('data-target'); });
  }

  /* ---------- 9. 属性条展开 ---------- */
  var skills = $$('.skill');
  skills.forEach(function (el) {
    el.style.setProperty('--level', el.getAttribute('data-level') || '0');
  });

  if (skills.length && 'IntersectionObserver' in window) {
    var skillObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-on');
          skillObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    skills.forEach(function (el) { skillObserver.observe(el); });
  } else {
    skills.forEach(function (el) { el.classList.add('is-on'); });
  }

  /* ---------- 10. 猫派 / 狗派 小投票（纯前端，仅本地演示） ---------- */
  var voteResult = $('#voteResult');
  var voteLabels = { cat: '🐱 猫派 +1，你很有品味！', dog: '🐶 狗派 +1，热情满满！', both: '🐾 全都要，这才是正确答案。' };

  $$('[data-vote]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!voteResult) { return; }
      voteResult.textContent = voteLabels[btn.getAttribute('data-vote')] || '谢谢参与～';
      voteResult.classList.remove('is-bump');
      void voteResult.offsetWidth;                 // 重启动画
      voteResult.classList.add('is-bump');
    });
  });

  /* ---------- 11. 彩蛋：爪印雨 ---------- */
  var PAW_EMOJI = ['🐾', '🐱', '🐶', '🐰', '🐹', '🎮', '🕹️'];
  var pawTimer = null;

  function makePaw() {
    var el = document.createElement('span');
    el.className = 'paw';
    el.textContent = PAW_EMOJI[Math.floor(Math.random() * PAW_EMOJI.length)];
    el.style.left = Math.random() * 100 + 'vw';
    el.style.fontSize = (16 + Math.random() * 26) + 'px';
    el.style.animationDuration = (2.6 + Math.random() * 2.2) + 's';
    el.style.animationDelay = (Math.random() * 0.5) + 's';
    document.body.appendChild(el);
    window.setTimeout(function () { el.remove(); }, 6000);
  }

  function pawRain() {
    if (pawTimer) { return; }                      // 防止重复触发
    var count = 0;
    pawTimer = window.setInterval(function () {
      makePaw();
      count += 1;
      if (count > 36) {
        window.clearInterval(pawTimer);
        pawTimer = null;
      }
    }, 90);
  }

  var eggBtn = $('#eggBtn');
  if (eggBtn) { eggBtn.addEventListener('click', pawRain); }
  if ($('.brand__logo')) { $('.brand__logo').addEventListener('click', pawRain); }

  /* 键盘输入 konami 彩蛋：↑↑↓↓←→←→BA */
  var KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  var progress = 0;
  document.addEventListener('keydown', function (e) {
    var key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === KONAMI[progress]) {
      progress += 1;
      if (progress === KONAMI.length) { progress = 0; pawRain(); }
    } else {
      progress = (key === KONAMI[0]) ? 1 : 0;
    }
  });

  /* ---------- 12. 首屏状态初始化 ---------- */
  onScroll();
  window.setTimeout(function () { window.dispatchEvent(new Event('scroll')); }, 60);
})();
