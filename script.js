/* ============================================
   Navigation
   ============================================ */
const navbar = document.getElementById('navbar');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const navAnchors = document.querySelectorAll('.nav-links a');

// Scroll effect
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// Mobile toggle
navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// Close mobile nav on link click
navAnchors.forEach(a => {
  a.addEventListener('click', () => {
    navToggle.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

// Active link tracking
const sections = document.querySelectorAll('section[id]');
const observerNav = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navAnchors.forEach(a => a.classList.remove('active'));
        const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  },
  { rootMargin: '-40% 0px -60% 0px' }
);
sections.forEach(s => observerNav.observe(s));

/* ============================================
   Scroll Reveal
   ============================================ */
const reveals = document.querySelectorAll(
  '.skill-category, .exp-card, .project-card, .blog-card, .contact-item, .highlight, .demo-card'
);

reveals.forEach(el => el.classList.add('reveal'));

const observerReveal = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observerReveal.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);
reveals.forEach(el => observerReveal.observe(el));

/* ============================================
   Hero Particle Effect
   ============================================ */
const particleContainer = document.getElementById('particles');

function createParticles() {
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.top = Math.random() * 100 + '%';
    p.style.animationDelay = Math.random() * 6 + 's';
    p.style.animationDuration = (4 + Math.random() * 4) + 's';
    particleContainer.appendChild(p);
  }
}

// Add particle styles dynamically
const particleStyle = document.createElement('style');
particleStyle.textContent = `
  .particle {
    position: absolute;
    width: 3px;
    height: 3px;
    background: var(--accent);
    border-radius: 50%;
    opacity: 0;
    animation: float-particle linear infinite;
  }
  @keyframes float-particle {
    0% { opacity: 0; transform: translateY(0) scale(1); }
    20% { opacity: 0.6; }
    80% { opacity: 0.2; }
    100% { opacity: 0; transform: translateY(-200px) scale(0.5); }
  }
`;
document.head.appendChild(particleStyle);
createParticles();

/* ============================================
   Stat Counter Animation
   ============================================ */
const statNumbers = document.querySelectorAll('.stat-number');
const observerStats = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        let current = 0;
        const step = Math.max(1, Math.floor(target / 30));
        const interval = setInterval(() => {
          current += step;
          if (current >= target) {
            current = target;
            clearInterval(interval);
          }
          el.textContent = current;
        }, 40);
        observerStats.unobserve(el);
      }
    });
  },
  { threshold: 0.5 }
);
statNumbers.forEach(s => observerStats.observe(s));

/* ============================================
   Testimonials Slider
   ============================================ */
const testimonialCards = document.querySelectorAll('.testimonial-card');
const dots = document.querySelectorAll('.dot');
let currentTestimonial = 0;

function showTestimonial(index) {
  testimonialCards.forEach(c => c.classList.remove('active'));
  dots.forEach(d => d.classList.remove('active'));
  testimonialCards[index].classList.add('active');
  dots[index].classList.add('active');
  currentTestimonial = index;
}

dots.forEach(dot => {
  dot.addEventListener('click', () => {
    showTestimonial(parseInt(dot.dataset.index));
  });
});

// Auto-rotate
setInterval(() => {
  showTestimonial((currentTestimonial + 1) % testimonialCards.length);
}, 6000);

/* ============================================
   Contact Form
   ============================================ */
document.getElementById('contact-form').addEventListener('submit', e => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.textContent = 'Message Sent!';
  btn.style.background = '#22c55e';
  setTimeout(() => {
    btn.textContent = 'Send Message';
    btn.style.background = '';
    e.target.reset();
  }, 3000);
});

/* ============================================
   Robot Arm Kinematics Demo
   ============================================ */
const kCanvas = document.getElementById('kinematics-canvas');
const kCtx = kCanvas.getContext('2d');
let kTarget = { x: 200, y: 150 };
const L1 = 90, L2 = 70;

function resizeCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * window.devicePixelRatio;
  canvas.height = rect.height * window.devicePixelRatio;
  const ctx = canvas.getContext('2d');
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  return { w: rect.width, h: rect.height };
}

function solveIK(target, originX, originY) {
  const dx = target.x - originX;
  const dy = target.y - originY;
  let dist = Math.sqrt(dx * dx + dy * dy);
  const maxReach = L1 + L2;
  const minReach = Math.abs(L1 - L2);
  dist = Math.max(minReach, Math.min(maxReach, dist));

  const cosAngle2 = (dist * dist - L1 * L1 - L2 * L2) / (2 * L1 * L2);
  const angle2 = Math.acos(Math.max(-1, Math.min(1, cosAngle2)));
  const angle1 = Math.atan2(dy, dx) - Math.atan2(L2 * Math.sin(angle2), L1 + L2 * Math.cos(angle2));

  return { angle1, angle2 };
}

function drawKinematics() {
  const { w, h } = resizeCanvas(kCanvas);
  const ctx = kCtx;
  const originX = w / 2;
  const originY = h * 0.75;

  // Background grid
  ctx.strokeStyle = 'rgba(42, 42, 62, 0.5)';
  ctx.lineWidth = 0.5;
  for (let x = 0; x < w; x += 20) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += 20) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  const { angle1, angle2 } = solveIK(kTarget, originX, originY);

  // Joint positions
  const joint1X = originX + L1 * Math.cos(angle1);
  const joint1Y = originY + L1 * Math.sin(angle1);
  const endX = joint1X + L2 * Math.cos(angle1 + angle2);
  const endY = joint1Y + L2 * Math.sin(angle1 + angle2);

  // Draw arm segments
  ctx.strokeStyle = '#00d4ff';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';

  // Segment 1
  ctx.beginPath();
  ctx.moveTo(originX, originY);
  ctx.lineTo(joint1X, joint1Y);
  ctx.stroke();

  // Segment 2
  ctx.beginPath();
  ctx.moveTo(joint1X, joint1Y);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  // Joints
  ctx.fillStyle = '#00d4ff';
  ctx.beginPath();
  ctx.arc(originX, originY, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#7c3aed';
  ctx.beginPath();
  ctx.arc(joint1X, joint1Y, 5, 0, Math.PI * 2);
  ctx.fill();

  // End effector
  ctx.fillStyle = '#00d4ff';
  ctx.beginPath();
  ctx.arc(endX, endY, 4, 0, Math.PI * 2);
  ctx.fill();

  // Target
  ctx.strokeStyle = 'rgba(0, 212, 255, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.arc(kTarget.x, kTarget.y, 12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Crosshair at target
  ctx.beginPath();
  ctx.moveTo(kTarget.x - 6, kTarget.y);
  ctx.lineTo(kTarget.x + 6, kTarget.y);
  ctx.moveTo(kTarget.x, kTarget.y - 6);
  ctx.lineTo(kTarget.x, kTarget.y + 6);
  ctx.stroke();

  requestAnimationFrame(drawKinematics);
}

kCanvas.addEventListener('mousemove', e => {
  const rect = kCanvas.getBoundingClientRect();
  kTarget.x = e.clientX - rect.left;
  kTarget.y = e.clientY - rect.top;
});

kCanvas.addEventListener('touchmove', e => {
  e.preventDefault();
  const rect = kCanvas.getBoundingClientRect();
  kTarget.x = e.touches[0].clientX - rect.left;
  kTarget.y = e.touches[0].clientY - rect.top;
}, { passive: false });

drawKinematics();

/* ============================================
   PID Controller Demo
   ============================================ */
const pidCanvas = document.getElementById('pid-canvas');
const pidCtx = pidCanvas.getContext('2d');
let pidState = { position: 0, velocity: 0, integral: 0, time: 0 };
let pidTarget = 70;
let pidHistory = []; // { t, actual, target }
const PID_MAX_HISTORY = 300;

function getPIDGains() {
  return {
    Kp: parseFloat(document.getElementById('pid-p').value),
    Ki: parseFloat(document.getElementById('pid-i').value),
    Kd: parseFloat(document.getElementById('pid-d').value),
  };
}

function resetPID() {
  pidState = { position: 0, velocity: 0, integral: 0, time: 0 };
  pidHistory = [];
}

document.getElementById('pid-reset').addEventListener('click', resetPID);

// Update slider value displays
['pid-p', 'pid-i', 'pid-d'].forEach(id => {
  const slider = document.getElementById(id);
  const display = document.getElementById(id + '-val');
  slider.addEventListener('input', () => {
    display.textContent = slider.value;
    resetPID();
  });
});

function pidStep(dt) {
  const { Kp, Ki, Kd } = getPIDGains();
  const error = pidTarget - pidState.position;

  pidState.integral += error * dt;
  // Anti-windup clamp
  pidState.integral = Math.max(-100, Math.min(100, pidState.integral));

  const derivative = -pidState.velocity; // derivative on measurement
  const force = Kp * error + Ki * pidState.integral + Kd * derivative;

  // Simple physics: mass = 1, friction = 0.3
  const friction = 0.3;
  const acceleration = force - friction * pidState.velocity;
  pidState.velocity += acceleration * dt;
  pidState.position += pidState.velocity * dt;
  pidState.time += dt;

  pidHistory.push({ t: pidState.time, actual: pidState.position, target: pidTarget });
  if (pidHistory.length > PID_MAX_HISTORY) pidHistory.shift();
}

function drawPID() {
  const { w, h } = resizeCanvas(pidCanvas);
  const ctx = pidCtx;

  // Run simulation steps
  const stepsPerFrame = 3;
  for (let i = 0; i < stepsPerFrame; i++) {
    pidStep(0.02);
  }

  // Background
  ctx.fillStyle = 'rgba(10, 10, 15, 0.3)';
  ctx.fillRect(0, 0, w, h);

  // Grid
  ctx.strokeStyle = 'rgba(42, 42, 62, 0.4)';
  ctx.lineWidth = 0.5;
  const graphTop = h * 0.05;
  const graphBottom = h * 0.65;
  const graphH = graphBottom - graphTop;

  for (let y = graphTop; y <= graphBottom; y += graphH / 4) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  // Draw target line (dashed)
  const targetY = graphTop + graphH * (1 - (pidTarget / 100));
  ctx.strokeStyle = 'rgba(124, 58, 237, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(0, targetY);
  ctx.lineTo(w, targetY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw response curve
  if (pidHistory.length > 1) {
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < pidHistory.length; i++) {
      const x = (i / PID_MAX_HISTORY) * w;
      const y = graphTop + graphH * (1 - (pidHistory[i].actual / 100));
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Labels
  ctx.fillStyle = '#71717a';
  ctx.font = '11px Inter, sans-serif';
  ctx.fillText('Target', w - 50, targetY - 6);
  ctx.fillText('Response', 8, graphTop + 14);

  // Draw motor visualization at bottom
  const motorY = h * 0.78;
  const motorCenterX = w / 2;
  const motorRadius = Math.min(w, h) * 0.12;

  // Motor body
  ctx.fillStyle = 'rgba(42, 42, 62, 0.8)';
  ctx.beginPath();
  ctx.arc(motorCenterX, motorY, motorRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2a2a3e';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Motor shaft indicator (rotates with position)
  const shaftAngle = (pidState.position / 100) * Math.PI * 2;
  ctx.strokeStyle = '#00d4ff';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(motorCenterX, motorY);
  ctx.lineTo(
    motorCenterX + Math.cos(shaftAngle) * motorRadius * 0.8,
    motorY + Math.sin(shaftAngle) * motorRadius * 0.8
  );
  ctx.stroke();

  // Target angle indicator
  const targetAngle = (pidTarget / 100) * Math.PI * 2;
  ctx.strokeStyle = 'rgba(124, 58, 237, 0.5)';
  ctx.lineWidth = 2;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(motorCenterX, motorY);
  ctx.lineTo(
    motorCenterX + Math.cos(targetAngle) * motorRadius * 0.8,
    motorY + Math.sin(targetAngle) * motorRadius * 0.8
  );
  ctx.stroke();
  ctx.setLineDash([]);

  // Center dot
  ctx.fillStyle = '#e4e4e7';
  ctx.beginPath();
  ctx.arc(motorCenterX, motorY, 3, 0, Math.PI * 2);
  ctx.fill();

  // Position readout
  ctx.fillStyle = '#00d4ff';
  ctx.font = '12px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`Pos: ${pidState.position.toFixed(1)}`, motorCenterX, motorY + motorRadius + 18);
  ctx.fillStyle = '#7c3aed';
  ctx.fillText(`Target: ${pidTarget}`, motorCenterX, motorY + motorRadius + 34);
  ctx.textAlign = 'left';

  requestAnimationFrame(drawPID);
}

drawPID();