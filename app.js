/* ═══════════════════════════════════════════════════════════
   NASSIC.DEV — Interactive Engine
   ═══════════════════════════════════════════════════════════ */
'use strict';

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(hover: none)').matches;

/* ── Footer year ─────────────────────────────────────────── */
document.getElementById('footerYear').textContent = new Date().getFullYear();

/* ── Theme toggle (persisted) ────────────────────────────── */
const themeBtn = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('nassic-theme');
if (savedTheme === 'light') document.body.classList.add('light-mode');

function syncThemeIcon() {
  const light = document.body.classList.contains('light-mode');
  themeBtn.innerHTML = light
    ? '<i class="fa-solid fa-sun"></i>'
    : '<i class="fa-solid fa-moon"></i>';
}
syncThemeIcon();
themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
  localStorage.setItem('nassic-theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
  syncThemeIcon();
});

/* ── Particle network canvas ─────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, particles = [], raf;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const mouse = { x: -9999, y: -9999 };

  function resize() {
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w * DPR; canvas.height = h * DPR;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const count = Math.min(Math.floor((w * h) / 16000), 90);
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.8 + 0.6,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      hue: Math.random() < 0.72 ? 187 : (Math.random() < 0.5 ? 265 : 320) // cyan / violet / magenta
    }));
  }

  function tick() {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;

      // gentle attraction shimmer near cursor
      const dx = mouse.x - p.x, dy = mouse.y - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 180 && dist > 0.1) {
        p.x += (dx / dist) * 0.35;
        p.y += (dy / dist) * 0.35;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 100%, 72%, .9)`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = `hsla(${p.hue}, 100%, 65%, .8)`;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    // links
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 120) {
          ctx.strokeStyle = `hsla(210, 90%, 70%, ${(1 - d / 120) * 0.16})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    raf = requestAnimationFrame(tick);
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  resize();
  if (!prefersReduced) tick();
})();

/* ── Cursor glow follows mouse ───────────────────────────── */
(function initCursorGlow() {
  const glow = document.getElementById('cursorGlow');
  if (!glow || isTouch) return;
  let gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy;
  window.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
  (function loop() {
    gx += (tx - gx) * 0.09; gy += (ty - gy) * 0.09;
    glow.style.left = gx + 'px'; glow.style.top = gy + 'px';
    requestAnimationFrame(loop);
  })();
})();

/* ── Scroll progress bar ─────────────────────────────────── */
(function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ── Nav: scrolled state + scroll spy ────────────────────── */
(function initNav() {
  const nav = document.getElementById('nav');
  const links = document.querySelectorAll('.nav-link');
  const sections = ['home', 'about', 'portfolio', 'blogs', 'contact'].map(id => document.getElementById(id));

  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          links.forEach(l => l.classList.toggle('active', l.dataset.section === entry.target.id));
        }
      });
    }, { rootMargin: '-38% 0px -55% 0px', threshold: 0 });
    sections.forEach(s => s && spy.observe(s));
  }
})();

/* ── Mobile hamburger ────────────────────────────────────── */
(function initHamburger() {
  const burger = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  const toggle = force => {
    const open = force !== undefined ? force : !menu.classList.contains('open');
    menu.classList.toggle('open', open);
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => toggle());
  menu.querySelectorAll('.mobile-link').forEach(a => a.addEventListener('click', () => toggle(false)));
  window.addEventListener('keydown', e => { if (e.key === 'Escape') toggle(false); });
})();

/* ── Typing effect (rotating roles) ──────────────────────── */
(function initTyping() {
  const target = document.getElementById('typedRole');
  if (!target) return;
  const roles = [
    'React.js Developer',
    'Frontend Engineer',
    'JavaScript Craftsman',
    'Data Science Student',
    'Open Source Contributor'
  ];
  if (prefersReduced) { target.textContent = roles[0]; return; }
  let ri = 0, ci = 0, deleting = false;
  const tick = () => {
    const word = roles[ri];
    ci += deleting ? -1 : 1;
    target.textContent = word.slice(0, ci);
    let delay = deleting ? 34 : 62;
    if (!deleting && ci === word.length) { delay = 1700; deleting = true; }
    else if (deleting && ci === 0) { deleting = false; ri = (ri + 1) % roles.length; delay = 380; }
    setTimeout(tick, delay);
  };
  tick();
})();

/* ── Marquee: duplicate track for seamless loop ──────────── */
(function initMarquee() {
  const track = document.getElementById('marqueeTrack');
  if (track) track.innerHTML += track.innerHTML;
})();

/* ── 3D tilt on portfolio cards ──────────────────────────── */
function attachTilt(card) {
  if (isTouch || prefersReduced) return;
  const strength = 10;
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(900px) rotateY(${px * strength}deg) rotateX(${-py * strength}deg) translateY(-6px)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
}

/* ── Magnetic buttons ────────────────────────────────────── */
(function initMagnetic() {
  if (isTouch || prefersReduced) return;
  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * 0.28;
      const y = (e.clientY - (r.top + r.height / 2)) * 0.28;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
})();

/* ── Portfolio data & rendering + filters ────────────────── */
const PROJECTS = [
  { title: 'Smart Brain — AI Face Detect', tag: 'React · Clarifai API', img: 'img/port1.png', cat: 'react',
    gh: 'https://github.com/Nassic-badar/Smart-Brain/tree/master', live: 'https://nassic-badar.github.io/Smart-Brain/' },
  { title: 'CSS Preloader Collection', tag: 'CSS · Animation', img: 'img/port2.png', cat: 'css',
    gh: 'https://github.com/Nassic-badar/Css-Preloader', live: 'https://nassic-badar.github.io/Css-Preloader/' },
  { title: 'Prettify — Beautifier UI', tag: 'HTML · CSS · JS', img: 'img/port3.png', cat: 'js',
    gh: 'https://github.com/Nassic-badar/Prettify', live: 'https://nassic-badar.github.io/Prettify/' },
  { title: 'Restorante Confusion', tag: 'React · Bootstrap', img: 'img/port4.png', cat: 'react',
    gh: 'https://github.com/Nassic-badar/Restorante-Confusion', live: 'https://nassic-badar.github.io/Restorante-Confusion/' },
  { title: 'Background Generator', tag: 'JavaScript · DOM', img: 'img/port5.png', cat: 'js',
    gh: 'https://github.com/Nassic-badar/Background-Generator', live: 'https://nassic-badar.github.io/Background-Generator/' },
  { title: 'Robo Friends', tag: 'React · API', img: 'img/port6.png', cat: 'react',
    gh: 'https://github.com/Nassic-badar/Robo-Friends/tree/master', live: 'https://nassic-badar.github.io/Robo-Friends/' },
  { title: 'e-Commerce Storefront', tag: 'React · Redux', img: 'img/port7.png', cat: 'react',
    gh: 'https://github.com/Nassic-badar/e-Commerce/tree/master', live: 'https://nassic-badar.github.io/e-Commerce/' },
];

(function renderPortfolio() {
  const grid = document.getElementById('portfolioGrid');
  grid.innerHTML = PROJECTS.map(p => `
    <article class="p-card" data-cat="${p.cat}">
      <div class="p-visual"><img src="${p.img}" alt="${p.title} screenshot" loading="lazy"></div>
      <div class="p-body">
        <span class="p-tag">${p.tag}</span>
        <h3>${p.title}</h3>
        <div class="p-actions">
          <a class="p-link primary" href="${p.live}" target="_blank" rel="noopener"><i class="fa-solid fa-eye"></i>Live Demo</a>
          <a class="p-link" href="${p.gh}" target="_blank" rel="noopener"><i class="fa-brands fa-github"></i>Source</a>
        </div>
      </div>
    </article>`).join('');
  grid.querySelectorAll('.p-card').forEach(attachTilt);

  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.toggle('active', b === btn));
    const f = btn.dataset.filter;
    grid.querySelectorAll('.p-card').forEach(card => {
      const match = f === 'all' || card.dataset.cat === f;
      card.classList.toggle('hidden', !match);
      if (match) {
        card.classList.remove('shown');
        requestAnimationFrame(() => requestAnimationFrame(() => card.classList.add('shown')));
      }
    });
  }));

  // staggered reveal on scroll
  const io = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('shown'), i * 90);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  grid.querySelectorAll('.p-card').forEach(c => io.observe(c));
})();

/* ── Blog queue rendering ────────────────────────────────── */
const ARTICLES = [
  { num: '01', title: 'How to Create Your Own Website in a Weekend', tag: 'HTML · CSS · Deploy', blurb: 'From blank file to a live, responsive site — the exact checklist I use, minus the fluff.' },
  { num: '02', title: 'How to Become an Expert in Web Design', tag: 'Design Systems', blurb: 'Taste is a skill: the references, reps, and critique loops that compound into real design instinct.' },
  { num: '03', title: 'Become a Web Designer in 10 Days', tag: 'Learning Plan', blurb: 'A focused 10-day sprint plan covering layout, typography, color, and one shipped project.' },
  { num: '04', title: 'Debugging Made Easy with DevTools', tag: 'Tooling', blurb: 'Breakpoints, network waterfalls, and the inspector tricks that turn 3-hour hunts into 10 minutes.' },
  { num: '05', title: 'Getting Started with Web & UI Design', tag: 'UI Fundamentals', blurb: 'Spacing, hierarchy, and contrast — the boring rules that make interfaces feel expensive.' },
  { num: '06', title: 'This Is What You Need to Know About Web Design', tag: 'Opinion', blurb: 'The uncomfortable truths about the field: what matters, what is cargo-cult, and what to ignore.' },
];

(function renderBlogs() {
  const grid = document.getElementById('blogsGrid');
  grid.innerHTML = ARTICLES.map(a => `
    <article class="glass blog-card reveal-up">
      <span class="blog-num">ARTICLE ${a.num}</span>
      <h3>${a.title}</h3>
      <p>${a.blurb}</p>
      <div class="blog-foot">
        <span class="blog-status">In the oven</span>
        <span class="blog-tag">${a.tag}</span>
      </div>
    </article>`).join('');
})();

/* ── Scroll reveals + counters + skill bars ──────────────── */
(function initScrollFX() {
  const revealEls = document.querySelectorAll('.reveal-up');
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.transition = 'opacity .7s cubic-bezier(.22,1,.36,1), transform .7s cubic-bezier(.22,1,.36,1)';
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => io.observe(el));

  // Counters
  const counters = document.querySelectorAll('.counter');
  const cio = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = +el.dataset.target;
      const dur = 1600, start = performance.now();
      const step = now => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(2, -10 * p);
        el.textContent = Math.round(target * (p === 1 ? 1 : eased));
        if (p < 1) requestAnimationFrame(step); else el.textContent = target;
      };
      requestAnimationFrame(step);
      cio.unobserve(el);
    });
  }, { threshold: 0.6 });
  counters.forEach(c => cio.observe(c));

  // Skill bars
  const fills = document.querySelectorAll('.skill-fill');
  const sio = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.width = entry.target.dataset.value + '%';
        sio.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  fills.forEach(f => sio.observe(f));
})();

/* ── Hero entrance timeline (GSAP if available) ──────────── */
(function heroIntro() {
  if (prefersReduced) return;
  if (window.gsap) {
    gsap.from('.line', { yPercent: 110, duration: 1, ease: 'power4.out', stagger: 0.14, delay: 0.15 });
    gsap.from('.hero-badge', { opacity: 0, y: -16, duration: .7, ease: 'power2.out' });
    gsap.from('.hero-visual', { opacity: 0, scale: .82, duration: 1.2, ease: 'power3.out', delay: .35 });
    gsap.from('.float-card-1', { opacity: 0, x: 60, duration: .9, delay: .95, ease: 'back.out(1.6)' });
    gsap.from('.float-card-2', { opacity: 0, x: -60, duration: .9, delay: 1.1, ease: 'back.out(1.6)' });
    gsap.from('.orbit-dot', { opacity: 0, scale: 0, duration: .6, stagger: .15, delay: .8, ease: 'back.out(2)' });
  }
})();

/* ── Contact form → formsubmit.co AJAX ───────────────────── */
(function initContactForm() {
  const form = document.getElementById('contactForm');
  const btn = document.getElementById('submitBtn');
  const toast = document.getElementById('toast');

  const showToast = (msg, type) => {
    toast.textContent = msg;
    toast.className = `toast show ${type || ''}`;
    setTimeout(() => { toast.className = 'toast'; }, 4500);
  };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll('[required]').forEach(el => {
      const ok = el.checkValidity();
      el.classList.toggle('error', !ok);
      if (!ok) valid = false;
    });
    if (!valid) { showToast('Please fill in all fields correctly.', 'error'); return; }

    const label = btn.querySelector('.btn-label');
    const original = label.textContent;
    btn.disabled = true;
    label.textContent = 'Transmitting…';

    try {
      const res = await fetch('https://formsubmit.co/ajax/badarnasic@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name: form.elements.name.value,
          email: form.elements.email.value,
          subject: form.elements.subject.value,
          message: form.elements.message.value,
          _subject: 'Portfolio contact: ' + form.elements.subject.value
        })
      });
      if (!res.ok) throw new Error('FormSubmit responded ' + res.status);
      form.reset();
      showToast('Message transmitted! I will get back to you soon. 🚀', 'success');
    } catch (err) {
      console.error(err);
      showToast('Direct channel busy — opening your mail client instead…', 'error');
      const body = encodeURIComponent(`From: ${form.elements.name.value} (${form.elements.email.value})\n\n${form.elements.message.value}`);
      window.location.href = `mailto:badarnasic@gmail.com?subject=${encodeURIComponent(form.elements.subject.value || 'Portfolio inquiry')}&body=${body}`;
    } finally {
      btn.disabled = false;
      label.textContent = original;
    }
  });

  form.querySelectorAll('[required]').forEach(el => {
    el.addEventListener('input', () => el.classList.remove('error'));
  });
})();
