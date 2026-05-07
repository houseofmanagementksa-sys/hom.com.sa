/* =============================================
   HOM — main.js  |  All 12 Enhancement Parts
   ============================================= */

// ─── Global pause flag (hidden tab) ─────────
let pageVisible = true;
document.addEventListener('visibilitychange', () => {
  pageVisible = !document.hidden;
});

gsap.registerPlugin(ScrollTrigger);

// ─── REDUCED MOTION CHECK ────────────────────
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = () => window.innerWidth <= 768;

/* ══════════════════════════════════════════════
   PAGE LOAD — Instant hero entrance (no loader)
══════════════════════════════════════════════ */
function initPageLoad() {
  // Fire banner layers right away
  ScrollTrigger.refresh();
  initBannerLayers();

  // Quick staggered entrance — runs immediately
  gsap.timeline({ delay: 0.15 })
    .from('.nav-brand',    { opacity: 0, y: -10, duration: 0.4, ease: 'power2.out' })
    .from('.nav-links li', { opacity: 0, y: -8, stagger: 0.05, duration: 0.35, ease: 'power2.out' }, '-=0.3')
    .from('.ann-bar',      { opacity: 0, duration: 0.3 }, '-=0.3')
    .from('.hero-slide-content[data-slide="0"] .hero-badge',   { opacity: 0, y: 22, duration: 0.5, ease: 'power3.out' }, '-=0.1')
    .from('.hero-slide-content[data-slide="0"] .hero-title',   { opacity: 0, y: 32, duration: 0.65, ease: 'power3.out' }, '-=0.35')
    .from('.hero-slide-content[data-slide="0"] .hero-sub',     { opacity: 0, y: 18, duration: 0.5, ease: 'power3.out' }, '-=0.4')
    .from('.hero-slide-content[data-slide="0"] .hero-actions', { opacity: 0, y: 14, duration: 0.4, ease: 'power3.out' }, '-=0.3')
    .from('.hero-slider-controls', { opacity: 0, duration: 0.35 }, '-=0.3')
    .from('.hero-scroll',          { opacity: 0, duration: 0.3 },  '-=0.2');
}

/* ══════════════════════════════════════════════
   PART 3 — TEXT SPLIT REVEAL
══════════════════════════════════════════════ */
function splitTextIntoWords(el) {
  if (el.dataset.split) return;
  el.dataset.split = true;
  const words = el.innerText.split(' ');
  el.innerHTML = words.map(w =>
    `<span class="word"><span class="word-inner">${w}</span></span>`
  ).join(' ');
}

function initTextSplits() {
  document.querySelectorAll('.section-title, .hero-title').forEach(el => {
    splitTextIntoWords(el);
  });

  // ScrollTrigger reveals for section-titles (not hero-title, handled by loader)
  document.querySelectorAll('.section-title').forEach(el => {
    if (prefersReduced) {
      el.querySelectorAll('.word-inner').forEach(w => gsap.set(w, { yPercent: 0 }));
      return;
    }
    gsap.set(el.querySelectorAll('.word-inner'), { yPercent: 110 });
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(el.querySelectorAll('.word-inner'), {
          yPercent: 0, duration: 0.7, ease: 'power3.out', stagger: 0.05
        });
      }
    });
  });
}

/* ══════════════════════════════════════════════
   PART 1 — CUSTOM CURSOR
══════════════════════════════════════════════ */
function initCursor() {
  if (isMobile() || prefersReduced) return;

  const circle = document.getElementById('cursor-circle');
  const dot    = document.getElementById('cursor-dot');
  if (!circle || !dot) return;

  document.body.style.cursor = 'none';

  let mx = -200, my = -200;  // mouse
  let cx = -200, cy = -200;  // lerped circle
  const LERP = 0.08;

  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function cursorLoop() {
    cx += (mx - cx) * LERP;
    cy += (my - cy) * LERP;
    circle.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    dot.style.transform    = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    requestAnimationFrame(cursorLoop);
  }
  cursorLoop();

  const hoverTargets = 'a, button, .industry-card, .about-card, .logo-card, .logo-card-lg, .btn-primary, .btn-outline';
  document.querySelectorAll(hoverTargets).forEach(el => {
    el.addEventListener('mouseenter', () => circle.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => circle.classList.remove('cursor-hover'));
  });
}

/* ══════════════════════════════════════════════
   PART 2 — OPTIMISED PARTICLE SYSTEM
   55 particles + spatial cell-grid (O(n) links)
══════════════════════════════════════════════ */
function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });

  const PARTICLE_COUNT = 55;
  const LINK_DIST      = 100;   // px — connection radius
  const CELL           = 110;   // spatial grid cell size

  let W, H, particles = [], burstParticles = [];
  let mouseX = -9999, mouseY = -9999;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildParticles();
  }

  function buildParticles() {
    particles = Array.from({ length: PARTICLE_COUNT }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 0.4 + 0.1;
      return {
        x: Math.random() * W, y: Math.random() * H,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        r: Math.random() * 1.4 + 0.8,
        a: Math.random() * 0.5 + 0.3
      };
    });
  }

  resize();
  // Debounced resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  });

  window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; }, { passive: true });
  canvas.addEventListener('click', e => {
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      burstParticles.push({ x: e.clientX, y: e.clientY,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        r: Math.random() + 0.5, life: 1 });
    }
  });

  // Build spatial grid for O(n) neighbour lookup
  function buildGrid() {
    const cols = Math.ceil(W / CELL) + 1;
    const grid = {};
    particles.forEach((p, i) => {
      const cx = Math.floor(p.x / CELL);
      const cy = Math.floor(p.y / CELL);
      const key = cx + ',' + cy;
      (grid[key] = grid[key] || []).push(i);
    });
    return { grid, cols };
  }

  function drawLoop() {
    if (!pageVisible) { requestAnimationFrame(drawLoop); return; }
    ctx.clearRect(0, 0, W, H);

    // Build cell grid once per frame
    const { grid } = buildGrid();

    // Batch all lines into one path per opacity band
    const lines = [];

    particles.forEach((p, i) => {
      // Mouse repulsion
      const dx = p.x - mouseX, dy = p.y - mouseY;
      const d2 = dx * dx + dy * dy;
      if (d2 < 8100) { // 90² — avoid sqrt
        const d = Math.sqrt(d2);
        const force = (90 - d) / 90 * 1.8;
        p.vx += (dx / d) * force * 0.08;
        p.vy += (dy / d) * force * 0.08;
      }
      p.vx *= 0.985; p.vy *= 0.985;
      p.x += p.vx;   p.y += p.vy;
      if (p.x < 0) p.x = W; else if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; else if (p.y > H) p.y = 0;

      // Draw dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,168,76,${p.a})`;
      ctx.fill();

      // Check only neighbouring cells (3×3 = up to ~9 cells vs all n)
      const gcx = Math.floor(p.x / CELL);
      const gcy = Math.floor(p.y / CELL);
      for (let nx = gcx - 1; nx <= gcx + 1; nx++) {
        for (let ny = gcy - 1; ny <= gcy + 1; ny++) {
          const neighbours = grid[nx + ',' + ny];
          if (!neighbours) continue;
          neighbours.forEach(j => {
            if (j <= i) return; // avoid duplicates
            const p2 = particles[j];
            const ex = p.x - p2.x, ey = p.y - p2.y;
            const dist2 = ex * ex + ey * ey;
            if (dist2 < LINK_DIST * LINK_DIST) {
              const alpha = (1 - Math.sqrt(dist2) / LINK_DIST) * 0.14;
              lines.push({ x1: p.x, y1: p.y, x2: p2.x, y2: p2.y, a: alpha });
            }
          });
        }
      }
    });

    // Draw all lines in one pass
    ctx.lineWidth = 0.5;
    lines.forEach(l => {
      ctx.beginPath();
      ctx.moveTo(l.x1, l.y1); ctx.lineTo(l.x2, l.y2);
      ctx.strokeStyle = `rgba(201,168,76,${l.a})`;
      ctx.stroke();
    });

    // Burst particles
    burstParticles = burstParticles.filter(p => p.life > 0);
    burstParticles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      p.life -= 0.025;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(226,196,120,${p.life})`;
      ctx.fill();
    });

    requestAnimationFrame(drawLoop);
  }
  drawLoop();
}

/* ══════════════════════════════════════════════
   PART 4 — SCROLL PROGRESS BAR
══════════════════════════════════════════════ */
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const pct = (scrollY / (document.body.scrollHeight - innerHeight)) * 100;
    bar.style.width = Math.min(pct, 100) + '%';
  }, { passive: true });
}

/* ══════════════════════════════════════════════
   PART 5 — FLOATING DOT NAVIGATION
══════════════════════════════════════════════ */
function initDotNav() {
  const nav = document.getElementById('dot-nav');
  if (!nav) return;

  const sections = ['home','about','industries','services','feasibility','branding','quality','clients','contact'];
  const labels   = ['Home','About','Industries','Services','Feasibility','Branding','Quality','Clients','Contact'];

  nav.innerHTML = sections.map((id, i) => `
    <div class="dot-nav-item" data-section="${id}">
      <div class="dot-nav-dot"></div>
      <span class="dot-nav-label">${labels[i]}</span>
    </div>`).join('');

  nav.querySelectorAll('.dot-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const target = document.getElementById(item.dataset.section);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        nav.querySelectorAll('.dot-nav-item').forEach(d => d.classList.remove('active'));
        const active = nav.querySelector(`[data-section="${e.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
}

/* ══════════════════════════════════════════════
   PART 6 — MAGNETIC BUTTONS
══════════════════════════════════════════════ */
function initMagneticButtons() {
  if (isMobile() || prefersReduced) return;
  document.querySelectorAll('.btn-primary, .btn-outline').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dx = e.clientX - cx, dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 80) {
        btn.style.transition = 'transform 0.1s linear';
        btn.style.transform = `translate(${dx * 0.25}px, ${dy * 0.25}px)`;
      }
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)';
      btn.style.transform = 'translate(0,0)';
    });
  });
}

/* ══════════════════════════════════════════════
   PART 7 — ANIMATED COUNTERS (easeOutQuart)
══════════════════════════════════════════════ */
function initCounters() {
  const easeOutQuart = t => 1 - Math.pow(1 - t, 4);
  const statsBar = document.querySelector('.stats-bar');
  if (!statsBar) return;

  const obs = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    obs.disconnect();
    document.querySelectorAll('[data-target]').forEach(el => {
      const target = parseInt(el.getAttribute('data-target'));
      const start = performance.now();
      const dur = 2000;
      const tick = now => {
        const t = Math.min((now - start) / dur, 1);
        el.textContent = Math.floor(easeOutQuart(t) * target);
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.5 });
  obs.observe(statsBar);
}

/* ══════════════════════════════════════════════
   PART 9 — HORIZONTAL SCROLL SERVICES
══════════════════════════════════════════════ */
function initHorizontalScroll() {
  if (isMobile() || prefersReduced) return;
  const panels = document.querySelector('.service-panels');
  if (!panels) return;
  const totalWidth = panels.scrollWidth;
  gsap.to(panels, {
    x: -(totalWidth - window.innerWidth),
    ease: 'none',
    scrollTrigger: {
      trigger: '#services',
      pin: true,
      scrub: 1,
      end: '+=' + totalWidth,
      invalidateOnRefresh: true
    }
  });
}

/* ══════════════════════════════════════════════
   LIVE ACTIVITY NOTIFICATIONS
══════════════════════════════════════════════ */
function initLiveToasts() {
    const toast = document.getElementById('liveToast');
    const closeBtn = document.getElementById('ltClose');
    const titleEl = document.getElementById('ltTitle');
    const descEl = document.getElementById('ltDesc');
    const timeEl = document.getElementById('ltTime');
    if (!toast) return;

    const isRTL = document.documentElement.dir === 'rtl';

    const citiesEn = ['Riyadh', 'Jeddah', 'Dubai', 'Madinah', 'Makkah', 'Dammam', 'Doha', 'Manama', 'Kuwait City'];
    const actionsEn = ['just downloaded the Company Profile', 'booked a free consultation', 'is viewing Feasibility Studies', 'requested a call back', 'is reading about Pre-Opening Services', 'is exploring Brand Development'];
    const timesEn = ['Just now', '1 min ago', '2 mins ago', '4 mins ago'];

    const citiesAr = ['الرياض', 'جدة', 'دبي', 'المدينة المنورة', 'مكة المكرمة', 'الدمام', 'الدوحة', 'المنامة', 'مدينة الكويت'];
    const actionsAr = ['قام بتحميل الملف التعريفي للشركة', 'حجز استشارة مجانية', 'يتصفح دراسات الجدوى', 'طلب مكالمة هاتفية', 'يقرأ عن خدمات ما قبل الافتتاح', 'يستكشف تطوير العلامة التجارية'];
    const timesAr = ['الآن', 'قبل دقيقة', 'قبل دقيقتين', 'قبل ٤ دقائق'];

    const cities = isRTL ? citiesAr : citiesEn;
    const actions = isRTL ? actionsAr : actionsEn;
    const times = isRTL ? timesAr : timesEn;
    
    const someoneStr = isRTL ? 'مستثمر من ' : 'Someone from ';

    let toastInterval;

    function showRandomToast() {
        if (toast.classList.contains('show')) return;

        const randomCity = cities[Math.floor(Math.random() * cities.length)];
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        const randomTime = times[Math.floor(Math.random() * times.length)];

        titleEl.textContent = someoneStr + randomCity;
        descEl.textContent = randomAction;
        timeEl.textContent = randomTime;

        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 6000); // Hide after 6 seconds
    }

    if(closeBtn) {
        closeBtn.addEventListener('click', () => {
            toast.classList.remove('show');
        });
    }

    // Start random toasts
    setTimeout(() => {
        showRandomToast();
        toastInterval = setInterval(showRandomToast, 22000); // Show every 22 seconds
    }, 4000); // Initial delay
}

/* ══════════════════════════════════════════════
   NAVBAR SCROLL + HAMBURGER
══════════════════════════════════════════════ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  hamburger?.addEventListener('click', () => mobileNav.classList.toggle('open'));
  mobileNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileNav.classList.remove('open')));
}

/* ══════════════════════════════════════════════
   HERO SLIDER
══════════════════════════════════════════════ */
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const contents = document.querySelectorAll('.hero-slide-content');
  const dots = document.querySelectorAll('.hsc-dot');
  const prevBtn = document.getElementById('heroPrev');
  const nextBtn = document.getElementById('heroNext');
  const progressFill = document.getElementById('heroProgressFill');
  
  if (!slides.length) return;

  let current = 0;
  let autoTimer;
  let progressTimer;
  const slideDuration = 6000;

  function goToSlide(idx) {
    // Hide old
    slides[current].classList.remove('active');
    contents[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    
    current = (idx + slides.length) % slides.length;
    
    // Show new
    slides[current].classList.add('active');
    contents[current].classList.add('active');
    dots[current]?.classList.add('active');
    
    // Quick enter animation for new content
    gsap.fromTo(contents[current].children, 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
    );
    
    resetTimers();
  }

  function resetTimers() {
    clearInterval(autoTimer);
    cancelAnimationFrame(progressTimer);
    
    if (progressFill) {
      let start = performance.now();
      function step(now) {
        let progress = ((now - start) / slideDuration) * 100;
        progressFill.style.width = Math.min(progress, 100) + '%';
        if (progress < 100) {
          progressTimer = requestAnimationFrame(step);
        }
      }
      progressTimer = requestAnimationFrame(step);
    }
    
    autoTimer = setInterval(() => goToSlide(current + 1), slideDuration);
  }

  prevBtn?.addEventListener('click', () => goToSlide(current - 1));
  nextBtn?.addEventListener('click', () => goToSlide(current + 1));
  
  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      if (idx !== current) goToSlide(idx);
    });
  });

  resetTimers();
}

/* ══════════════════════════════════════════════
   SCROLL REVEAL (IntersectionObserver)
══════════════════════════════════════════════ */
function initReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal-up').forEach(el => obs.observe(el));
}

/* ══════════════════════════════════════════════
   BOOT SEQUENCE — No loader, instant open
══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initPageLoad();       // Instant entrance (no loader)
  initCanvas();         // Optimised particles
  initScrollProgress(); // Progress bar
  initDotNav();         // Dot nav
  initNavbar();
  initHeroSlider();     // Hero slider
  initReveal();
  initCursor();
  initMagneticButtons();
  initCounters();
  initHorizontalScroll();
  initLiveToasts();

});

/* ══════════════════════════════════════════════
   PART 10 — CONTACT FORM SUBMIT HANDLER
══════════════════════════════════════════════ */
document.getElementById('contactForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  const btn = document.getElementById('cf-submit');
  const text = btn.querySelector('.btn-text');
  const spinner = btn.querySelector('.btn-spinner');
  text.style.display = 'none';
  spinner.style.display = 'inline';
  btn.disabled = true;

  setTimeout(() => {
    this.style.display = 'none';
    document.getElementById('cf-success').style.display = 'block';
  }, 1800);
});

/* ══════════════════════════════════════════════
   BANNER LAYERS — Ticker Bar & Update Modal
   (both fire after loader completes)
══════════════════════════════════════════════ */
function initBannerLayers() {

  /* ── LAYER 1: Ticker Announcement Bar ── */
  const annBar      = document.getElementById('annBar');
  const annBarClose = document.getElementById('annBarClose');
  const navbar      = document.getElementById('navbar');
  const isMob       = window.innerWidth <= 768;
  const barH        = isMob ? '34px' : '38px';

  // Don't show if closed this session
  if (sessionStorage.getItem('annBarClosed')) {
    annBar.style.display = 'none';
    navbar.style.top = '0';
  } else {
    // Slide down 400ms after loader hides
    setTimeout(() => {
      annBar.classList.add('visible');
      navbar.style.top = barH;
      document.body.classList.add('ann-bar-open');
    }, 400);
  }

  annBarClose.addEventListener('click', () => {
    annBar.style.transform = 'translateY(-100%)';
    annBar.style.transition = 'transform 0.4s ease';
    navbar.style.top = '0px';
    navbar.style.transition = 'top 0.4s ease';
    document.body.classList.remove('ann-bar-open');
    sessionStorage.setItem('annBarClosed', '1');
  });

  /* ── LAYER 2: Update Popup Modal ── */
  const updateOverlay  = document.getElementById('updateOverlay');
  const updateModalX   = document.getElementById('updateModalClose');
  const updateDontShow = document.getElementById('updateDontShow');
  const updateCTA      = document.getElementById('updateCTA');

  function openUpdateModal() {
    updateOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeUpdateModal() {
    updateOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Show modal 1200ms after loader ends — only if not dismissed
  if (!localStorage.getItem('homUpdateModalDismissed')) {
    setTimeout(openUpdateModal, 1200);
  }

  // Close on ✕ button
  updateModalX?.addEventListener('click', closeUpdateModal);

  // Close on overlay background click
  updateOverlay?.addEventListener('click', (e) => {
    if (e.target === updateOverlay) closeUpdateModal();
  });

  // Close on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeUpdateModal();
  });

  // "Don't show again" — persists to localStorage across visits
  updateDontShow?.addEventListener('click', () => {
    localStorage.setItem('homUpdateModalDismissed', '1');
    closeUpdateModal();
  });

  // CTA: close modal then smooth-scroll to #about
  updateCTA?.addEventListener('click', (e) => {
    e.preventDefault();
    closeUpdateModal();
    setTimeout(() => {
      document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  });
}

/* ══════════════════════════════════════════════
   PRESENCE SECTION — Starfield + Radar Canvases
══════════════════════════════════════════════ */
function initPresenceSection() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── CANVAS 1: Starfield ────────────────────── */
  const starCanvas = document.getElementById('starCanvas');
  if (starCanvas) {
    const sCtx = starCanvas.getContext('2d');
    let stars = [];
    let starT = 0;

    function resizeStarCanvas() {
      starCanvas.width  = starCanvas.offsetWidth;
      starCanvas.height = starCanvas.offsetHeight;
      buildStars();
    }

    function buildStars() {
      stars = Array.from({ length: 200 }, () => ({
        x: Math.random() * starCanvas.width,
        y: Math.random() * starCanvas.height * 0.72,
        r: Math.random() * 1.2 + 0.3,
        twinkleSpeed:  Math.random() * 0.03 + 0.01,
        twinkleOffset: Math.random() * Math.PI * 2,
        baseAlpha:     Math.random() * 0.5 + 0.2
      }));
    }

    function drawStars() {
      sCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
      stars.forEach(s => {
        const alpha = reducedMotion
          ? s.baseAlpha
          : Math.max(0, Math.min(1,
              s.baseAlpha + Math.sin(starT * s.twinkleSpeed + s.twinkleOffset) * 0.3));
        sCtx.beginPath();
        sCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        sCtx.fillStyle = `rgba(255,250,240,${alpha})`;
        sCtx.fill();
      });
      if (!reducedMotion) starT++;
      requestAnimationFrame(drawStars);
    }

    resizeStarCanvas();
    window.addEventListener('resize', resizeStarCanvas);
    drawStars();
  }


  /* ── GSAP ScrollTrigger entrance ── */
  gsap.timeline({
    scrollTrigger: { trigger: '#presence', start: 'top 75%' }
  })
  .from('.presence-center .section-label', { opacity: 0, y: 20, duration: 0.5 })
  .from('.presence-center .section-title', { opacity: 0, y: 25, duration: 0.7 }, '-=0.3')
  .from('.presence-tagline',               { opacity: 0, y: 20, duration: 0.6 }, '-=0.4')
  .from('.globe-wrap',                     { opacity: 0, scale: 0.9, duration: 1.0, ease: 'power3.out' }, '-=0.3')
  .from('.presence-reach-stats',           { opacity: 0, y: 20, duration: 0.5 }, '-=0.5')
  .from('#skylineSVG',                     { opacity: 0, y: 40,     duration: 1.2, ease: 'power2.out' }, '-=1.0');

  /* ── Skyline parallax on scroll ── */
  window.addEventListener('scroll', () => {
    const section = document.getElementById('presence');
    if (!section) return;
    const rect     = section.getBoundingClientRect();
    const progress = -rect.top / window.innerHeight;
    if (progress > -0.5 && progress < 1.5) {
      const parallax = progress * 30;
      const wrap = document.querySelector('.skyline-wrap');
      if (wrap) wrap.style.transform = `translateY(${parallax}px)`;
    }
  }, { passive: true });
}

// Call on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initPresenceSection);

/* ══════════════════════════════════════════════
   HERO IMAGE SLIDER
══════════════════════════════════════════════ */
function initHeroSlider() {
  const slides       = document.querySelectorAll('.hero-slide');
  const contents     = document.querySelectorAll('.hero-slide-content');
  const dots         = document.querySelectorAll('.hsc-dot');
  const prevBtn      = document.getElementById('heroPrev');
  const nextBtn      = document.getElementById('heroNext');
  const progressFill = document.getElementById('heroProgressFill');

  if (!slides.length) return;

  let current   = 0;
  let autoTimer = null;
  const DURATION = 6000; // ms per slide
  let progressStart = null;
  let progressRAF   = null;

  function goTo(idx) {
    // Clean up prev
    slides[current].classList.remove('active');
    slides[current].classList.add('prev');
    contents[current].classList.remove('active', 'entering');
    dots[current].classList.remove('active');

    setTimeout(() => {
      slides[current < slides.length - 1 ? current : current].classList.remove('prev');
    }, 1200);

    current = (idx + slides.length) % slides.length;

    slides[current].classList.add('active');
    contents[current].classList.add('active', 'entering');
    dots[current].classList.add('active');

    // Remove 'entering' after animation completes
    setTimeout(() => {
      contents[current]?.classList.remove('entering');
    }, 1200);

    // Restart progress bar
    startProgress();
  }

  function startProgress() {
    if (progressRAF) cancelAnimationFrame(progressRAF);
    progressStart = performance.now();

    function tick(now) {
      const elapsed = now - progressStart;
      const pct = Math.min((elapsed / DURATION) * 100, 100);
      if (progressFill) progressFill.style.width = pct + '%';
      if (pct < 100) {
        progressRAF = requestAnimationFrame(tick);
      }
    }
    progressRAF = requestAnimationFrame(tick);
  }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), DURATION);
  }

  // Button handlers
  prevBtn?.addEventListener('click', () => {
    clearInterval(autoTimer); goTo(current - 1); startAuto();
  });
  nextBtn?.addEventListener('click', () => {
    clearInterval(autoTimer); goTo(current + 1); startAuto();
  });

  // Dot handlers
  dots.forEach(d => {
    d.addEventListener('click', () => {
      clearInterval(autoTimer);
      goTo(parseInt(d.dataset.idx));
      startAuto();
    });
  });

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { clearInterval(autoTimer); goTo(current - 1); startAuto(); }
    if (e.key === 'ArrowRight') { clearInterval(autoTimer); goTo(current + 1); startAuto(); }
  });

  // Touch/swipe
  let touchX = 0;
  const heroEl = document.getElementById('home');
  heroEl?.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  heroEl?.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) {
      clearInterval(autoTimer);
      goTo(dx < 0 ? current + 1 : current - 1);
      startAuto();
    }
  });

  // Init: trigger entering animation on first slide
  contents[0]?.classList.add('entering');
  setTimeout(() => contents[0]?.classList.remove('entering'), 1200);

  startProgress();
  startAuto();
}

document.addEventListener('DOMContentLoaded', () => {
  initHeroSlider();
  initWebGLGlobe();
});

/* ══════════════════════════════════════════════
   INTERACTIVE 3D GLOBE (Globe.gl)
══════════════════════════════════════════════ */
function initWebGLGlobe() {
  const globeViz = document.getElementById('globeViz');
  if (!globeViz || typeof Globe === 'undefined') return;

  const markerData = [
    { name: 'Madinah (HQ)', lat: 24.4672, lng: 39.6111, isHQ: true },
    { name: 'Riyadh', lat: 24.7136, lng: 46.6753, isHQ: false },
    { name: 'Jeddah', lat: 21.4858, lng: 39.1925, isHQ: false },
    { name: 'Dubai', lat: 25.2048, lng: 55.2708, isHQ: false },
    { name: 'Kuwait City', lat: 29.3759, lng: 47.9774, isHQ: false },
    { name: 'Abu Dhabi', lat: 24.4539, lng: 54.3773, isHQ: false },
    { name: 'Doha', lat: 25.2854, lng: 51.5310, isHQ: false },
    { name: 'Muscat', lat: 23.5859, lng: 58.4059, isHQ: false },
    { name: 'Bahrain', lat: 26.0667, lng: 50.5577, isHQ: false }
  ];

  // Configure arcs from HQ to other cities
  const hq = markerData[0];
  const arcData = markerData.slice(1).map(d => ({
    startLat: hq.lat,
    startLng: hq.lng,
    endLat: d.lat,
    endLng: d.lng
  }));

  const myGlobe = Globe()(globeViz)
    .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-night.jpg')
    .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
    .backgroundColor('rgba(0,0,0,0)')
    .width(700)
    .height(700)
    .showAtmosphere(true)
    .atmosphereColor('#c9a84c')
    .atmosphereAltitude(0.15)
    
    // Add rings for HQ
    .ringsData([hq])
    .ringColor(() => '#c9a84c')
    .ringMaxRadius(3)
    .ringPropagationSpeed(1.5)
    .ringRepeatPeriod(1000)
    
    // Add markers
    .htmlElementsData(markerData)
    .htmlElement(d => {
      const el = document.createElement('div');
      el.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); pointer-events: auto;">
          <div style="background: ${d.isHQ ? '#c9a84c' : 'rgba(10,13,22,0.8)'}; 
                      border: 1px solid #c9a84c; 
                      color: ${d.isHQ ? '#0a0d16' : '#fff'}; 
                      padding: 4px 8px; 
                      border-radius: 4px; 
                      font-size: ${d.isHQ ? '14px' : '11px'}; 
                      font-weight: ${d.isHQ ? 'bold' : 'normal'}; 
                      white-space: nowrap;
                      box-shadow: 0 2px 10px rgba(0,0,0,0.5);">
            ${d.name}
          </div>
          <div style="width: 2px; height: 10px; background: #c9a84c;"></div>
          <div style="width: ${d.isHQ ? '12px' : '8px'}; height: ${d.isHQ ? '12px' : '8px'}; border-radius: 50%; background: ${d.isHQ ? '#fff' : '#c9a84c'}; border: 2px solid ${d.isHQ ? '#c9a84c' : 'transparent'}; box-shadow: 0 0 10px #c9a84c;"></div>
        </div>
      `;
      return el;
    })
    
    // Add arcs
    .arcsData(arcData)
    .arcColor(() => '#c9a84c')
    .arcDashLength(0.4)
    .arcDashGap(0.2)
    .arcDashAnimateTime(1500)
    .arcStroke(0.6);

  // Set initial point to Middle East
  myGlobe.pointOfView({ lat: 25, lng: 45, altitude: 1.5 }, 0);

  // Controls config
  const controls = myGlobe.controls();
  controls.enableZoom = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;

  // Make it responsive
  window.addEventListener('resize', () => {
    const wrap = document.getElementById('globeVizWrap');
    if (wrap) {
      const width = Math.min(wrap.offsetWidth, 700);
      myGlobe.width(width);
      myGlobe.height(width); // keep square aspect ratio
    }
  });

  // initial resize trigger
  window.dispatchEvent(new Event('resize'));
}
