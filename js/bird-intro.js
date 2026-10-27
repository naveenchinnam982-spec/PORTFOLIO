// bird-intro.js - Cinematic Realistic Bird Flight & Identity Reveal
// Simulates an articulated, aerodynamic falcon/eagle flight across an atmospheric canvas,
// trailing luminescent stardust particles and triggering the reveal of "NAVEEN CHINNAM".

(function () {
  'use strict';

  const introOverlay = document.getElementById('intro-overlay');
  const introCanvas = document.getElementById('intro-canvas');
  const introContent = document.getElementById('intro-content');
  const skipBtn = document.getElementById('skip-intro-btn');
  const mainPortfolio = document.getElementById('main-portfolio');

  if (!introOverlay || !introCanvas) return;

  const ctx = introCanvas.getContext('2d');
  let animationFrameId = null;
  let startTime = null;
  let isCompleted = false;

  // Check prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Target flight duration in milliseconds (4.2 seconds total, smooth cinematic pacing)
  const TOTAL_DURATION = prefersReducedMotion ? 1200 : 4200;

  let width = 0;
  let height = 0;

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    introCanvas.width = width * window.devicePixelRatio || width;
    introCanvas.height = height * window.devicePixelRatio || height;
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
  }

  window.addEventListener('resize', () => {
    if (!isCompleted) resizeCanvas();
  });
  resizeCanvas();

  // Background Ambient Dust Particles
  const backgroundDust = [];
  const DUST_COUNT = 45;
  for (let i = 0; i < DUST_COUNT; i++) {
    backgroundDust.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2 + 0.6,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.2
    });
  }

  // Luminescent Wingtip Trail Particles
  const wakeParticles = [];

  // Bezier Flight Path definition
  function getBirdPosition(progress) {
    // Smooth ease-in-out progress
    const t = progress;
    // Cubic Bezier curve control points
    // P0: Offscreen bottom-left
    // P1: Mid-left ascent
    // P2: Center crest with swoop
    // P3: Offscreen top-right
    const p0 = { x: -0.15 * width, y: 0.85 * height };
    const p1 = { x: 0.28 * width, y: 0.65 * height };
    const p2 = { x: 0.62 * width, y: 0.28 * height };
    const p3 = { x: 1.18 * width, y: 0.12 * height };

    // Bezier formula B(t) = (1-t)^3 P0 + 3(1-t)^2 t P1 + 3(1-t) t^2 P2 + t^3 P3
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    const t2 = t * t;
    const t3 = t2 * t;

    const x = mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x;
    const y = mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y;

    // Tangent derivative for flight heading angle
    const dx = 3 * mt2 * (p1.x - p0.x) + 6 * mt * t * (p2.x - p1.x) + 3 * t2 * (p3.x - p2.x);
    const dy = 3 * mt2 * (p1.y - p0.y) + 6 * mt * t * (p2.y - p1.y) + 3 * t2 * (p3.y - p2.y);
    const angle = Math.atan2(dy, dx);

    return { x, y, angle };
  }

  // Draw Realistic Articulated Bird
  function drawRealisticBird(x, y, angle, wingPhase, scale = 1.0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(scale, scale);

    // Dynamic wing flap angle using harmonic sine wave
    // Downstroke is powerful, upstroke has slight drag angle
    const innerWingAngle = Math.sin(wingPhase) * 0.75;
    const outerWingAngle = Math.sin(wingPhase - 0.45) * 0.95;

    // Aerodynamic Glow Aura
    const auraGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, 50);
    auraGrad.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
    auraGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.2)');
    auraGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 50, 0, Math.PI * 2);
    ctx.fill();

    // 1. Tail Feathers (wedge shape behind bird)
    ctx.save();
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.6)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.lineTo(-44, -12);
    ctx.quadraticCurveTo(-48, 0, -44, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 2. Far Wing (Left / Top depending on angle)
    drawSingleWing(-1, innerWingAngle, outerWingAngle);

    // 3. Torso, Head, and Beak
    ctx.save();
    // Shading gradient across sleek body
    const bodyGrad = ctx.createLinearGradient(-20, -5, 30, 5);
    bodyGrad.addColorStop(0, '#0c1222');
    bodyGrad.addColorStop(0.6, '#1e293b');
    bodyGrad.addColorStop(1, '#38bdf8');

    ctx.fillStyle = bodyGrad;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    // Head & Beak
    ctx.moveTo(32, 0);
    ctx.lineTo(24, -5);
    ctx.quadraticCurveTo(10, -7, -10, -5);
    ctx.quadraticCurveTo(-22, 0, -20, 2);
    ctx.quadraticCurveTo(-10, 6, 12, 6);
    ctx.quadraticCurveTo(24, 4, 32, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Sharp Eagle Eye
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(18, -2, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 4. Near Wing (Foreground Wing)
    drawSingleWing(1, innerWingAngle, outerWingAngle);

    ctx.restore();
  }

  function drawSingleWing(side, innerAngle, outerAngle) {
    ctx.save();
    // side is 1 for right/bottom wing, -1 for left/top wing
    const effectiveInner = side * innerAngle;
    const effectiveOuter = side * outerAngle;

    // Wing gradient
    const wingGrad = ctx.createLinearGradient(0, 0, 0, side * 70);
    wingGrad.addColorStop(0, '#1e293b');
    wingGrad.addColorStop(0.7, '#0f172a');
    wingGrad.addColorStop(1, '#6366f1');

    ctx.fillStyle = wingGrad;
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.85)';
    ctx.lineWidth = 1.4;

    ctx.beginPath();
    ctx.moveTo(2, side * 2); // Shoulder joint

    // Inner wing bone
    const elbowX = -6;
    const elbowY = side * 32 * Math.cos(effectiveInner);
    ctx.quadraticCurveTo(elbowX - 4, elbowY * 0.6, elbowX, elbowY);

    // Outer wing bone & primary flight feathers
    const tipX = -14 + Math.sin(effectiveOuter) * 12;
    const tipY = elbowY + side * 46 * Math.cos(effectiveOuter);
    ctx.quadraticCurveTo(elbowX - 8, tipY * 0.7, tipX, tipY);

    // Trailing edge feather serrations
    ctx.quadraticCurveTo(elbowX - 16, elbowY + side * 14, -12, side * 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Luminous feather edge highlights
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.7)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(elbowX, elbowY);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();

    ctx.restore();
  }

  // Animation Loop
  function render(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / TOTAL_DURATION, 1.0);

    // Clear Canvas
    ctx.clearRect(0, 0, width, height);

    // 1. Draw drifting cosmic dust
    ctx.save();
    for (let i = 0; i < backgroundDust.length; i++) {
      const p = backgroundDust[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.fillStyle = `rgba(148, 163, 184, ${p.alpha * (1 - progress * 0.3)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 2. Compute Bird Position & Flap Cycle
    const birdPos = getBirdPosition(progress);
    // Flap frequency: 18 radians/second (smooth natural cadence)
    const flapSpeed = 16.5;
    const wingPhase = (elapsed / 1000) * flapSpeed;

    // Wingtip Particle Emitter
    if (progress < 0.96 && Math.random() > 0.15) {
      const scaleFactor = Math.min(width / 1100, 1.2);
      wakeParticles.push({
        x: birdPos.x - Math.cos(birdPos.angle) * 20 + (Math.random() - 0.5) * 10,
        y: birdPos.y - Math.sin(birdPos.angle) * 20 + (Math.random() - 0.5) * 10,
        vx: -Math.cos(birdPos.angle) * 1.5 + (Math.random() - 0.5) * 0.8,
        vy: -Math.sin(birdPos.angle) * 1.5 + (Math.random() - 0.5) * 0.8,
        r: Math.random() * 2.8 + 1.2,
        life: 1.0,
        decay: Math.random() * 0.03 + 0.02,
        color: Math.random() > 0.4 ? 'rgba(99, 102, 241,' : 'rgba(6, 182, 212,'
      });
    }

    // 3. Render Wake Particles
    ctx.save();
    for (let i = wakeParticles.length - 1; i >= 0; i--) {
      const pt = wakeParticles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life -= pt.decay;

      if (pt.life <= 0) {
        wakeParticles.splice(i, 1);
        continue;
      }

      ctx.fillStyle = `${pt.color}${pt.life * 0.85})`;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.r * pt.life, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 4. Render the Realistic Bird
    const scale = Math.max(0.85, Math.min(width / 900, 1.25));
    drawRealisticBird(birdPos.x, birdPos.y, birdPos.angle, wingPhase, scale);

    // 5. Trigger "NAVEEN CHINNAM" Typography Reveal when bird crosses center
    if (progress >= 0.32 && !introContent.classList.contains('revealed')) {
      introContent.classList.add('revealed');
    }

    // 6. Transition into homepage as flight finishes
    if (progress >= 0.88 && !introOverlay.classList.contains('fading-out')) {
      introOverlay.classList.add('fading-out');
      if (mainPortfolio) {
        mainPortfolio.classList.add('active');
      }
    }

    if (progress < 1.0 && !isCompleted) {
      animationFrameId = requestAnimationFrame(render);
    } else {
      completeIntro();
    }
  }

  function completeIntro() {
    if (isCompleted) return;
    isCompleted = true;
    if (animationFrameId) cancelAnimationFrame(animationFrameId);

    introOverlay.classList.add('fading-out');
    if (mainPortfolio) {
      mainPortfolio.classList.add('active');
    }

    // Completely hide and remove intro from accessibility tree after transition
    setTimeout(() => {
      introOverlay.style.display = 'none';
      document.body.classList.remove('intro-running');
      document.body.classList.add('intro-finished');
      sessionStorage.setItem('nc_intro_seen', 'true');
    }, 900);
  }

  // Skip button handler
  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      completeIntro();
    });
  }

  // Escape key handler
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !isCompleted) {
      completeIntro();
    }
  });

  // Replay Intro function (callable from anywhere)
  window.replayIntro = function () {
    isCompleted = false;
    startTime = null;
    introOverlay.style.display = 'flex';
    introOverlay.classList.remove('fading-out');
    introContent.classList.remove('revealed');
    document.body.classList.add('intro-running');
    document.body.classList.remove('intro-finished');
    if (mainPortfolio) mainPortfolio.classList.remove('active');
    resizeCanvas();
    animationFrameId = requestAnimationFrame(render);
  };

  // Start Intro on load
  document.body.classList.add('intro-running');

  // If user enabled reduced motion or already saw intro in current tab, allow immediate start or fast transition
  if (prefersReducedMotion) {
    introContent.classList.add('revealed');
    setTimeout(completeIntro, 1200);
  } else {
    animationFrameId = requestAnimationFrame(render);
  }
})();
