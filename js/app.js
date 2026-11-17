/* ============================================================
   BOZZA RESTYLING — router + animazioni
   Le "pagine" sono pannelli nello stesso file: entrano da destra,
   scorrono al loro interno, e l'indirizzo cambia (#eventi, #poesia…)
   così il tasto Indietro del browser continua a funzionare.
   ============================================================ */
(function () {
  'use strict';

  var nav      = document.querySelector('.nav');
  var pages    = Array.prototype.slice.call(document.querySelectorAll('.page'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
  var menu     = document.querySelector('.nav-links');
  var toggle   = document.querySelector('.nav-toggle');

  /* ---------- router ---------- */
  function closeMenu() {
    if (!menu || !toggle) return;
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  function route() {
    var id = (location.hash || '').replace('#', '');
    var target = id ? document.getElementById(id) : null;
    var prev = null;
    pages.forEach(function (p) { if (p.classList.contains('active')) prev = p; });

    pages.forEach(function (p) {
      var on = (p === target);
      p.classList.toggle('active', on);
      if (on) p.scrollTop = 0;
    });

    /* pagina -> pagina: la precedente resta ferma sotto, non esce a destra */
    if (prev && target && prev !== target) {
      prev.classList.add('under');
      setTimeout(function () { prev.classList.remove('under'); }, 660);
    }

    document.body.classList.toggle('page-open', !!target);
    if (nav) nav.classList.toggle('scrolled', !!target);

    navLinks.forEach(function (a) {
      a.classList.toggle('is-active', !!target && a.getAttribute('href') === '#' + id);
    });

    closeMenu();
  }

  window.addEventListener('hashchange', route);

  /* chiudi (torna alla home) */
  var closeBtn = document.querySelector('.nav-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', function () { location.hash = '#home'; });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if ((pop && !pop.hidden) || (popNews && !popNews.hidden)) { closePop(); return; }
    if (document.body.classList.contains('page-open')) location.hash = '#home';
  });

  /* ---------- popup (contatti e newsletter) ---------- */
  var pop = document.getElementById('mail-pop');
  var popNews = document.getElementById('news-pop');

  function closePop() {
    if (pop) pop.hidden = true;
    if (popNews) popNews.hidden = true;
  }
  function apri(p) { if (p) p.hidden = false; }

  [[pop, '.mail-trigger'], [popNews, '.news-trigger']].forEach(function (coppia) {
    var box = coppia[0];
    if (!box) return;
    document.querySelectorAll(coppia[1]).forEach(function (b) {
      b.addEventListener('click', function (e) { e.preventDefault(); apri(box); });
    });
    box.querySelector('.mail-pop-backdrop').addEventListener('click', closePop);
    box.querySelector('.mail-pop-close').addEventListener('click', closePop);
  });

  /* ---------- copia la mail (popup + box eventi) ---------- */
  function copiaMail(btn) {
    var mail = 'chiara.pulin.90@gmail.com';
    function esito(ok) {
      btn.textContent = ok ? 'Copiata!' : 'Selezionala e copiala';
      setTimeout(function () { btn.textContent = 'Copia'; }, 2500);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(mail).then(function () { esito(true); }, function () { esito(false); });
    } else {
      esito(false);
    }
  }
  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () { copiaMail(b); });
  });

  /* ---------- menu mobile ---------- */
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') closeMenu();
    });
  }

  /* ---------- carosello recensioni (2 per volta) ---------- */
  document.querySelectorAll('.rec-carousel').forEach(function (car) {
    var slides = car.querySelectorAll('.rec-slide');
    if (slides.length < 2) return;
    var i = 0, timer;
    function goTo(n) {
      slides[i].classList.remove('active');
      i = (n + slides.length) % slides.length;
      slides[i].classList.add('active');
    }
    function restart() { clearInterval(timer); timer = setInterval(function () { goTo(i + 1); }, 8000); }
    var prev = car.querySelector('.rec-prev');
    var next = car.querySelector('.rec-next');
    if (prev) prev.addEventListener('click', function () { goTo(i - 1); restart(); });
    if (next) next.addEventListener('click', function () { goTo(i + 1); restart(); });
    restart();
  });

  /* ---------- hero su telefono: pallini di scorrimento ---------- */
  var grid = document.querySelector('.hero-grid');
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots span'));
  if (grid && dots.length) {
    grid.addEventListener('scroll', function () {
      var i = Math.round(grid.scrollLeft / grid.clientWidth);
      dots.forEach(function (d, n) { d.classList.toggle('on', n === i); });
    }, { passive: true });
    dots.forEach(function (d, n) {
      d.addEventListener('click', function () {
        grid.scrollTo({ left: n * grid.clientWidth, behavior: 'smooth' });
      });
    });
  }

  /* ---------- fade-in dei contenuti ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.fade-in').forEach(function (el) { io.observe(el); });

  /* ---------- box "Il Tarocco al tuo evento" ---------- */
  var scrivimi = document.getElementById('scrivimi-btn');
  var mailBox  = document.getElementById('mail-box');
  if (scrivimi && mailBox) {
    scrivimi.addEventListener('click', function () {
      mailBox.classList.add('open');
      scrivimi.setAttribute('aria-expanded', 'true');
    });
  }

  /* ---------- eventi: quelli passati scendono da soli ---------- */
  var futuri  = document.getElementById('eventi-futuri');
  var passati = document.getElementById('eventi-passati');
  if (futuri && passati) {
    var oggi = new Date();
    oggi.setHours(0, 0, 0, 0);
    Array.prototype.slice.call(futuri.querySelectorAll('.event-card')).forEach(function (card) {
      var fine = card.getAttribute('data-fine');
      if (!fine) return;
      var d = new Date(fine + 'T23:59:59');
      if (d < oggi) {
        card.classList.add('past');
        passati.insertBefore(card, passati.firstChild);
      }
    });
    if (!futuri.querySelector('.event-card')) {
      var vuoto = document.createElement('p');
      vuoto.className = 'upcoming-msg';
      vuoto.textContent = 'Le prossime date sono in arrivo. Iscriviti alla newsletter per saperle in anteprima.';
      futuri.appendChild(vuoto);
    }
  }

  /* ---------- il libro delle poesie ----------
     Ogni poesia occupa due facciate: il testo viene diviso fra pagina
     sinistra e destra misurando quanto ne entra davvero nella pagina. */
  var book = document.getElementById('book');
  if (book) {
    var poesie = Array.prototype.slice.call(book.querySelectorAll('.book-source > article'))
      .map(function (a) { return { titolo: a.getAttribute('data-titolo'), html: a.innerHTML }; });

    var left   = book.querySelector('.book-page.left');
    var right  = book.querySelector('.book-page.right');
    var misura = book.querySelector('.book-measure');
    var flip   = book.querySelector('.book-flip');
    var front  = book.querySelector('.flip-face.front');
    var back   = book.querySelector('.flip-face.back');
    var count  = book.querySelector('.book-count');
    var bPrev  = book.querySelector('.book-prev');
    var bNext  = book.querySelector('.book-next');
    var i = 0, busy = false;

    function componi(n) {
      misura.innerHTML = '<h3>' + poesie[n].titolo + '</h3>' + poesie[n].html;
      var wrap = misura.querySelector('.poem-text');
      var resto = [], guardia = 0;
      while (misura.scrollHeight > misura.clientHeight + 2 &&
             wrap.children.length > 1 && guardia++ < 80) {
        resto.unshift(wrap.lastElementChild.outerHTML);
        wrap.removeChild(wrap.lastElementChild);
      }
      return {
        sx: misura.innerHTML,
        dx: resto.length ? '<div class="poem-text">' + resto.join('') + '</div>' : ''
      };
    }

    function stato(n) {
      count.textContent = (n + 1) + ' / ' + poesie.length;
      bPrev.disabled = (n === 0);
      bNext.disabled = (n === poesie.length - 1);
    }

    function mostra(n) {
      var p = componi(n);
      left.innerHTML = p.sx;
      right.innerHTML = p.dx;
      stato(n);
    }

    function sfoglia(dir) {
      var n = i + dir;
      if (busy || n < 0 || n >= poesie.length) return;
      busy = true;
      var p = componi(n);

      if (dir > 0) {
        front.innerHTML = right.innerHTML;
        back.innerHTML  = p.sx;
        right.innerHTML = p.dx;
        flip.classList.add('turning');
      } else {
        front.innerHTML = p.dx;
        back.innerHTML  = left.innerHTML;
        left.innerHTML  = p.sx;
        flip.classList.add('turning-back');
      }

      setTimeout(function () {
        if (dir > 0) left.innerHTML = p.sx;
        else right.innerHTML = p.dx;
      }, 470);

      setTimeout(function () {
        i = n;
        stato(n);
        flip.classList.remove('turning', 'turning-back');
        busy = false;
      }, 950);
    }

    bPrev.addEventListener('click', function () { sfoglia(-1); });
    bNext.addEventListener('click', function () { sfoglia(1); });

    mostra(0);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { mostra(i); });
    }
    var tRid;
    window.addEventListener('resize', function () {
      clearTimeout(tRid);
      tRid = setTimeout(function () { if (!busy) mostra(i); }, 250);
    });
  }

  /* ---------- avvio ---------- */
  route();
})();
