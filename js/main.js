/* 訪問介護サービスいのしかちょう ---------------------------------------- */
(function () {
  'use strict';

  /* --- ページトップボタン：少しスクロールしたら表示 --------------------- */
  var pagetop = document.querySelector('.pagetop');

  if (pagetop) {
    var toggle = function () {
      if (window.scrollY > 400) {
        pagetop.classList.add('is-visible');
      } else {
        pagetop.classList.remove('is-visible');
      }
    };

    window.addEventListener('scroll', toggle, { passive: true });
    toggle();

    pagetop.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* --- モバイルのメニュー開閉 ------------------------------------------
     動きの設定に関係なく必要な機能なので、演出の判定より前に置く。 */
  var gnav = document.querySelector('.gnav');
  var navToggle = gnav && gnav.querySelector('.gnav__toggle');

  if (navToggle) {
    /* CSS 側はこのクラスが付いて初めてメニューを畳む。
       JS が止まったときに項目が開けなくなるのを防ぐため。 */
    document.documentElement.classList.add('js-nav');

    var setNav = function (open) {
      gnav.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    };

    navToggle.addEventListener('click', function () {
      setNav(!gnav.classList.contains('is-open'));
    });

    /* 開いたまま迷子にならないよう、Esc と画面外タップで閉じる */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && gnav.classList.contains('is-open')) {
        setNav(false);
        navToggle.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (gnav.classList.contains('is-open') && !gnav.contains(e.target)) setNav(false);
    });
  }

  /* --- ここから下は演出。動かせない環境では何もしない ------------------- */
  if (!('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  /* CSS 側はこのクラスが付いて初めて要素を隠す。
     JS が止まったときに本文が読めなくなるのを防ぐため。 */
  document.documentElement.classList.add('js-anim');

  /* --- ヒーローのコピー：1文字ずつ順に浮かび上がらせる ------------------ */
  var heroCopy = document.querySelector('.hero__copy');

  if (heroCopy) {
    var charIndex = 0;

    Array.prototype.forEach.call(heroCopy.querySelectorAll('p'), function (line, lineNo) {
      var text = line.textContent;

      /* 1文字ずつ包むと読み上げが途切れることがあるので、
         行そのものに元の文字列を持たせておく。 */
      line.setAttribute('aria-label', text);
      line.textContent = '';

      text.split('').forEach(function (ch) {
        var span = document.createElement('span');
        span.textContent = ch;
        /* 通し番号で送らせ、行が変わるところでもう少し間を取る */
        span.style.transitionDelay = (charIndex * 80 + lineNo * 180) + 'ms';
        line.appendChild(span);
        charIndex++;
      });
    });

    /* requestAnimationFrame は裏に回ったタブでは止まるため setTimeout で待つ。 */
    setTimeout(function () { heroCopy.classList.add('is-in'); }, 260);
  }

  /* --- スクロールに合わせた表示 ----------------------------------------
     要素の性格ごとに動きを変える。数値は「順番に追いつく」ための遅延(ms)。 */
  var groups = [
    { sel: '.sec-head',       type: 'head', step: 0 },
    { sel: '.page-head',      type: 'head', step: 0 },
    { sel: '.about__body',    type: 'text', step: 0 },
    { sel: '.recruit__card',  type: 'zoom', step: 0 },
    { sel: '.more-wrap',      type: 'btn',  step: 0 },
    /* 採用ページの導入 */
    { sel: '.rec-lead__title', type: 'focus', step: 0 },
    { sel: '.rec-lead__img',   type: 'zoom', step: 0 },
    { sel: '.rec-lead .btn',   type: 'btn',  step: 150 }
  ];

  groups.forEach(function (g) {
    Array.prototype.forEach.call(document.querySelectorAll(g.sel), function (el) {
      el.setAttribute('data-reveal', g.type);
      if (g.step) el.setAttribute('data-delay', g.step);
    });
  });

  /* 採用ページの導入文は5行ある。まとめて出すと重いので1行ずつ送らせる。 */
  Array.prototype.forEach.call(document.querySelectorAll('.rec-lead__text span'), function (el, i) {
    el.setAttribute('data-reveal', 'focus');
    el.setAttribute('data-delay', 220 + i * 150);
  });

  /* 経営理念は4項目が縦に並ぶ。左から順に差し込んで積み上がるように見せる。 */
  Array.prototype.forEach.call(document.querySelectorAll('.creed__item'), function (el, i) {
    el.setAttribute('data-reveal', 'left');
    el.setAttribute('data-delay', i * 150);
  });

  /* 会社概要は8行の一覧。読み下ろす速さに合わせて短い間隔で送る。 */
  Array.prototype.forEach.call(document.querySelectorAll('.company > div'), function (el, i) {
    el.setAttribute('data-reveal', 'row');
    el.setAttribute('data-delay', i * 70);
  });

  /* 事業内容カードは2列グリッド。左列は左から、右列は右から差し込み、
     さらに少しずつ遅らせて順番に現れるようにする。 */
  Array.prototype.forEach.call(document.querySelectorAll('.services .service'), function (el, i) {
    el.setAttribute('data-reveal', i % 2 === 0 ? 'left' : 'right');
    el.setAttribute('data-delay', Math.floor(i / 2) * 190);
  });

  /* 事業内容ページは行ごとに写真と文章が左右入れ替わる。
     それぞれが自分のいる側から差し込むように向きを合わせる。 */
  Array.prototype.forEach.call(document.querySelectorAll('.biz__inner'), function (inner) {
    var reversed = inner.classList.contains('biz__inner--rev');
    var figure = inner.querySelector('.biz__figure');
    var body = inner.querySelector('.biz__body');

    if (figure) figure.setAttribute('data-reveal', reversed ? 'right' : 'left');
    if (body) {
      body.setAttribute('data-reveal', reversed ? 'left' : 'right');
      body.setAttribute('data-delay', 140);   // 写真より少し遅れて追いつく
    }
  });

  var targets = document.querySelectorAll('[data-reveal]');

  /* data-reveal を付けた瞬間に opacity 1 → 0 の遷移が走ると、
     読み込み直後に本文が消えていくように見える。
     初期状態だけは遷移を切って即座に適用する。 */
  Array.prototype.forEach.call(targets, function (el) { el.style.transition = 'none'; });
  void document.body.offsetHeight;               // 強制的に再計算させる
  Array.prototype.forEach.call(targets, function (el) {
    el.style.transition = '';
    /* transition はショートハンドなので、消したあとに遅延を入れ直す */
    var d = el.getAttribute('data-delay');
    if (d) el.style.transitionDelay = d + 'ms';
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.06 });

  Array.prototype.forEach.call(targets, function (el) { io.observe(el); });

  /* 保険。裏で開かれたタブなど、監視が動かない状況がある。
     そのままだと本文が消えたままになるので、画面に入っている要素は必ず出す。 */
  var failsafe = function () {
    Array.prototype.forEach.call(targets, function (el) {
      if (el.classList.contains('is-in')) return;
      var box = el.getBoundingClientRect();
      if (box.top < window.innerHeight && box.bottom > 0) {
        el.classList.add('is-in');
        io.unobserve(el);
      }
    });
  };

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') setTimeout(failsafe, 400);
  });
  setTimeout(failsafe, 2500);
})();
