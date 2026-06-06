// Nav scroll behavior
// Solo sulla homepage (che ha .hero) il nav cambia con lo scroll.
// Nelle pagine interne il nav ha già la classe 'scrolled' nel HTML e rimane tale.
const nav = document.querySelector('.nav');
if (nav) {
  const hasHero = !!document.querySelector('.hero');
  if (hasHero) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }
}

// Mobile menu toggle
const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');
if (toggle && links) {
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
    });
  });
}

// Fade-in on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Ripristina visibilità se la pagina viene dal bfcache (tasto Indietro/Avanti)
window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    document.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
  }
});

// Carosello testimonianze
const carousel = document.querySelector('.testimonials-carousel');
if (carousel) {
  const slides = carousel.querySelectorAll('.carousel-slide');
  const prevBtn = carousel.querySelector('.carousel-prev');
  const nextBtn = carousel.querySelector('.carousel-next');
  let current = 0;
  let timer;

  function goTo(n) {
    slides[current].classList.remove('active');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
  }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 8000);
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); startTimer(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); startTimer(); });
  startTimer();
}
