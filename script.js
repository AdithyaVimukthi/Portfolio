/**
 * Alex Chen — Robotics & AI Engineer Portfolio
 * script.js
 *
 * Contents:
 *  1.  DOM Ready helper
 *  2.  Navigation — scroll solidify & hamburger menu
 *  3.  Smooth active-link highlighting
 *  4.  Intersection Observer — scroll reveal animations
 *  5.  Staggered reveal for grid children
 *  6.  Contact form — client-side validation & submission feedback
 *  7.  Animated stat counters
 *  8.  Keyboard accessibility helpers
 */

'use strict';

/* =============================================================
   1. DOM READY HELPER
   ============================================================= */

/**
 * Runs callback when the DOM is fully parsed.
 * @param {Function} fn
 */
function onReady(fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}


/* =============================================================
   2. NAVIGATION — SCROLL SOLIDIFY & HAMBURGER MENU
   ============================================================= */

function initNav() {
  const navbar     = document.getElementById('navbar');
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('[data-mobile-link]');

  if (!navbar) return;

  // --- Scroll: make nav bg solid after scrolling 10px ---
  let lastScrollY = window.scrollY;

  function handleNavScroll() {
    const scrolled = window.scrollY > 10;
    navbar.classList.toggle('nav--scrolled', scrolled);
    lastScrollY = window.scrollY;
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll(); // run once on load in case page starts scrolled

  // --- Hamburger toggle ---
  if (!hamburger || !mobileMenu) return;

  let menuOpen = false;

  function openMenu() {
    menuOpen = true;
    hamburger.classList.add('nav__hamburger--open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('nav__mobile--open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    // Prevent body scroll while menu is open
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menuOpen = false;
    hamburger.classList.remove('nav__hamburger--open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('nav__mobile--open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    if (menuOpen) closeMenu(); else openMenu();
  });

  // Close menu when a mobile link is clicked
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen) closeMenu();
  });

  // Close menu if viewport resizes to desktop width
  const mediaQuery = window.matchMedia('(min-width: 769px)');
  mediaQuery.addEventListener('change', (e) => {
    if (e.matches && menuOpen) closeMenu();
  });
}


/* =============================================================
   3. ACTIVE LINK HIGHLIGHTING (highlights nav link of current section)
   ============================================================= */

function initActiveLinks() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav__link');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            const href = link.getAttribute('href');
            const active = href === `#${id}`;
            link.style.color = active ? 'var(--accent)' : '';
          });
        }
      });
    },
    {
      // Trigger when section is at least 30% in view
      threshold: 0.3,
      // Slightly negative top margin so nav height doesn't throw things off
      rootMargin: '-60px 0px -40% 0px',
    }
  );

  sections.forEach((section) => observer.observe(section));
}


/* =============================================================
   4. INTERSECTION OBSERVER — SCROLL REVEAL ANIMATIONS
   ============================================================= */

function initReveal() {
  // Select all elements with the .reveal class
  const revealEls = document.querySelectorAll('.reveal');

  if (!revealEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal--visible');
          // Once revealed, no need to keep observing
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -60px 0px',
    }
  );

  revealEls.forEach((el) => observer.observe(el));
}


/* =============================================================
   5. STAGGERED REVEAL FOR GRID CHILDREN
   Automatically staggers reveal delay for cards/tags inside
   containers that have the .reveal parent.
   ============================================================= */

function initStaggeredReveal() {
  // CUSTOMIZATION: Add selectors for any new grid sections here
  const staggerParents = document.querySelectorAll(
    '.projects__grid, .skills__grid, .about__stats, .contact__socials'
  );

  staggerParents.forEach((parent) => {
    // Each direct child that has .reveal gets a staggered delay
    const children = parent.querySelectorAll('.reveal, .stat-card, .skill-category, .project-card, .social-link');
    children.forEach((child, i) => {
      // Base delay 60ms, each card 80ms later (cap at 400ms)
      const delay = Math.min(60 + i * 80, 400);
      child.style.setProperty('--delay', `${delay}ms`);
      child.style.transitionDelay = `${delay}ms`;
    });
  });
}


/* =============================================================
   6. CONTACT FORM — CLIENT-SIDE VALIDATION & FEEDBACK
   (No backend — shows a success message instead of submitting)
   CUSTOMIZATION: Replace the submit handler body with a real
   fetch() call to your preferred form service (Formspree, etc.)
   ============================================================= */

function initContactForm() {
  const form       = document.getElementById('contactForm');
  const statusEl   = document.getElementById('formStatus');
  const submitBtn  = document.getElementById('submitBtn');

  if (!form || !statusEl || !submitBtn) return;

  // --- Inline validation helpers ---

  function setError(input, message) {
    input.style.borderColor = '#f87171';
    // Remove old error message if exists
    const old = input.parentElement.querySelector('.field-error');
    if (old) old.remove();
    const errEl = document.createElement('span');
    errEl.className = 'field-error';
    errEl.style.cssText = 'font-size:0.75rem;color:#f87171;margin-top:4px;display:block;';
    errEl.textContent = message;
    input.parentElement.appendChild(errEl);
  }

  function clearError(input) {
    input.style.borderColor = '';
    const errEl = input.parentElement.querySelector('.field-error');
    if (errEl) errEl.remove();
  }

  function isValidEmail(email) {
    // Simple RFC 5322-inspired pattern
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validateForm(fields) {
    let valid = true;

    fields.forEach(({ el, rules }) => {
      clearError(el);
      for (const rule of rules) {
        if (!rule.test(el.value)) {
          setError(el, rule.message);
          valid = false;
          break; // Only show the first failing rule per field
        }
      }
    });

    return valid;
  }

  // Clear errors on user input
  form.querySelectorAll('.form-input').forEach((input) => {
    input.addEventListener('input', () => clearError(input));
  });

  // --- Submission ---
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameEl    = form.querySelector('#name');
    const emailEl   = form.querySelector('#email');
    const messageEl = form.querySelector('#message');

    const fields = [
      {
        el: nameEl,
        rules: [
          { test: (v) => v.trim().length > 0,  message: 'Please enter your name.' },
          { test: (v) => v.trim().length >= 2,  message: 'Name must be at least 2 characters.' },
        ],
      },
      {
        el: emailEl,
        rules: [
          { test: (v) => v.trim().length > 0, message: 'Please enter your email.' },
          { test: isValidEmail,               message: 'Please enter a valid email address.' },
        ],
      },
      {
        el: messageEl,
        rules: [
          { test: (v) => v.trim().length > 0,   message: 'Please enter a message.' },
          { test: (v) => v.trim().length >= 20,  message: 'Message must be at least 20 characters.' },
        ],
      },
    ];

    const valid = validateForm(fields);
    if (!valid) return;

    // --- Simulate async send ---
    // CUSTOMIZATION: Replace this block with a real fetch() to your API/Formspree endpoint
    submitBtn.disabled = true;
    const btnText = submitBtn.querySelector('.btn__text');
    if (btnText) btnText.textContent = 'Sending…';

    statusEl.textContent = '';
    statusEl.className = 'form-status';

    // Simulate a 1.2s network request
    setTimeout(() => {
      // Simulate 95% success rate (change to real error handling with fetch)
      const success = Math.random() > 0.05;

      if (success) {
        statusEl.textContent = 'Message sent! I\'ll get back to you within 1–2 business days.';
        statusEl.classList.add('form-status--success');
        form.reset();
      } else {
        statusEl.textContent = 'Something went wrong. Please try again or email me directly.';
        statusEl.classList.add('form-status--error');
      }

      submitBtn.disabled = false;
      if (btnText) btnText.textContent = 'Send Message';

      // Clear status message after 8 seconds
      setTimeout(() => {
        statusEl.textContent = '';
        statusEl.className = 'form-status';
      }, 8000);
    }, 1200);
  });
}


/* =============================================================
   7. ANIMATED STAT COUNTERS
   Counts up numbers in .stat-card__number when the About
   section scrolls into view.
   ============================================================= */

function initStatCounters() {
  const statNumbers = document.querySelectorAll('.stat-card__number[data-count]');

  if (!statNumbers.length) return;

  /**
   * Animates a number from 0 to target over duration ms.
   * Uses requestAnimationFrame for smooth 60fps animation.
   */
  function animateCounter(el, target, duration = 1500) {
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed  = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = Math.round(eased * target);

      el.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target; // Ensure exact final value
      }
    }

    requestAnimationFrame(update);
  }

  // Only trigger once when About section enters viewport
  const aboutSection = document.getElementById('about');
  if (!aboutSection) return;

  let countersTriggered = false;

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !countersTriggered) {
        countersTriggered = true;
        statNumbers.forEach((el, i) => {
          const target = parseInt(el.getAttribute('data-count'), 10);
          if (isNaN(target)) return;
          // Slight stagger between counters
          setTimeout(() => animateCounter(el, target), i * 150);
        });
        observer.unobserve(aboutSection);
      }
    },
    { threshold: 0.3 }
  );

  observer.observe(aboutSection);
}


/* =============================================================
   8. KEYBOARD ACCESSIBILITY HELPERS
   ============================================================= */

function initA11y() {
  // Skip-to-content: if someone tabs to the first link before the nav,
  // allow Enter to jump to main content.
  // (The skip link markup isn't in the HTML by default; add if needed.)

  // Project cards: allow keyboard activation of the card itself (not just the link)
  const projectCards = document.querySelectorAll('.project-card');
  projectCards.forEach((card) => {
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        // Trigger the card's primary link
        const link = card.querySelector('.project-card__link-icon');
        if (link) {
          e.preventDefault();
          link.click();
        }
      }
    });
  });

  // Smooth-scroll for all anchor hash links (in case browser support varies)
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href').slice(1);
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Move focus to the target section for screen reader users
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
      }
    });
  });
}


/* =============================================================
   INIT — Run all modules when DOM is ready
   ============================================================= */

onReady(() => {
  initNav();
  initActiveLinks();
  initStaggeredReveal(); // Must run before initReveal so delays are set
  initReveal();
  initStatCounters();
  initContactForm();
  initA11y();

  // --- Console easter egg for fellow engineers ---
  // CUSTOMIZATION: Update with your own message/link
  console.log(
    '%c👾 Hey there, engineer! Source code always available on GitHub.',
    'color: #00d4ff; font-family: monospace; font-size: 14px;'
  );
});
