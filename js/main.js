// main.js - Portfolio Master Orchestrator for Naveen Chinnam
// Manages Custom Cursor, Navigation, Modals, Filter Tabs, Projects, Contact Form, and Admin Analytics

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ==========================================
  // 1. THEME MANAGEMENT
  // ==========================================
  const themeToggle = document.getElementById('theme-toggle');
  const htmlRoot = document.documentElement;

  function initTheme() {
    const saved = localStorage.getItem('nc_theme');
    if (saved) {
      htmlRoot.setAttribute('data-theme', saved);
    } else {
      // Default to sleek dark mode
      htmlRoot.setAttribute('data-theme', 'dark');
    }
  }
  initTheme();

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = htmlRoot.getAttribute('data-theme') || 'dark';
      const target = current === 'dark' ? 'light' : 'dark';
      htmlRoot.setAttribute('data-theme', target);
      localStorage.setItem('nc_theme', target);
    });
  }

  // ==========================================
  // 2. STICKY NAVBAR & SCROLL PROGRESS
  // ==========================================
  const nav = document.getElementById('navbar');
  const scrollBar = document.getElementById('scroll-progress');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const mobileMenuToggle = document.getElementById('mobile-toggle');
  const mobileNavDrawer = document.getElementById('mobile-drawer');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    // Progress bar
    if (scrollBar && docHeight > 0) {
      const progress = Math.min(100, Math.max(0, (scrollY / docHeight) * 100));
      scrollBar.style.width = `${progress}%`;
    }

    // Glass navbar state
    if (nav) {
      if (scrollY > 50) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }

    // Active link highlighting
    let currentSectionId = '';
    sections.forEach(section => {
      const top = section.offsetTop - 140;
      const height = section.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${currentSectionId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }, { passive: true });

  // Mobile Menu Toggle
  if (mobileMenuToggle && mobileNavDrawer) {
    mobileMenuToggle.addEventListener('click', () => {
      const isOpen = mobileNavDrawer.classList.toggle('open');
      mobileMenuToggle.setAttribute('aria-expanded', isOpen);
      mobileMenuToggle.classList.toggle('active', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileNavDrawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNavDrawer.classList.remove('open');
        mobileMenuToggle.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // ==========================================
  // 3. DESKTOP CUSTOM CURSOR
  // ==========================================
  const cursorDot = document.getElementById('cursor-dot');
  const cursorCircle = document.getElementById('cursor-circle');

  if (cursorDot && cursorCircle && window.matchMedia('(pointer: fine)').matches) {
    let mouseX = -100;
    let mouseY = -100;
    let circleX = -100;
    let circleY = -100;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    });

    function renderCursor() {
      circleX += (mouseX - circleX) * 0.18;
      circleY += (mouseY - circleY) * 0.18;
      cursorCircle.style.transform = `translate3d(${circleX}px, ${circleY}px, 0)`;
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    // Expand cursor on interactive targets
    const interactives = 'a, button, input, textarea, select, .project-card, .skill-card, .filter-btn';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactives)) {
        cursorCircle.classList.add('expanded');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactives)) {
        cursorCircle.classList.remove('expanded');
      }
    });
  }

  // ==========================================
  // 4. HERO ROLE TYPEWRITER
  // ==========================================
  const typewriterEl = document.getElementById('hero-typewriter');
  if (typewriterEl) {
    const roles = [
      'Full Stack Developer',
      'AI & Machine Learning Engineer',
      'Android App Developer',
      'Computer Vision Researcher',
      'Autonomous Systems Creator'
    ];
    let roleIdx = 0;
    let charIdx = 0;
    let isDeleting = false;

    function tick() {
      const currentRole = roles[roleIdx];
      if (isDeleting) {
        charIdx--;
      } else {
        charIdx++;
      }

      typewriterEl.textContent = currentRole.substring(0, charIdx);

      let delta = isDeleting ? 40 : 85;

      if (!isDeleting && charIdx === currentRole.length) {
        delta = 1800; // Pause at end of word
        isDeleting = true;
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
        delta = 400;
      }

      setTimeout(tick, delta);
    }
    setTimeout(tick, 900);
  }

  // ==========================================
  // 5. ANIMATED STATS COUNTER
  // ==========================================
  const statNumbers = document.querySelectorAll('[data-target]');
  const statsObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = +el.getAttribute('data-target');
        const suffix = el.getAttribute('data-suffix') || '';
        let current = 0;
        const duration = 1600;
        const stepTime = 25;
        const steps = duration / stepTime;
        const increment = target / steps;

        const counter = setInterval(() => {
          current += increment;
          if (current >= target) {
            el.textContent = target + suffix;
            clearInterval(counter);
          } else {
            el.textContent = Math.floor(current) + suffix;
          }
        }, stepTime);

        obs.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  statNumbers.forEach(stat => statsObserver.observe(stat));

  // ==========================================
  // 6. SCROLL REVEAL OBSERVER
  // ==========================================
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealElements.forEach(el => revealObserver.observe(el));

  // ==========================================
  // 7. PROJECTS SHOWCASE & FILTERING
  // ==========================================
  const projectsGrid = document.getElementById('projects-grid');
  const filterButtons = document.querySelectorAll('.filter-btn');

  function renderProjects(filter = 'all') {
    if (!projectsGrid || typeof PROJECTS_DATA === 'undefined') return;

    projectsGrid.innerHTML = '';

    const filtered = filter === 'all' 
      ? PROJECTS_DATA 
      : PROJECTS_DATA.filter(p => p.category === filter);

    filtered.forEach((proj, idx) => {
      const card = document.createElement('div');
      card.className = `project-card ${proj.featured ? 'is-featured' : ''} reveal visible`;
      card.setAttribute('data-id', proj.id);

      const badgesHtml = proj.tech.slice(0, 4).map(t => `<span class="tech-chip">${t}</span>`).join('');
      const demoBtn = proj.demo 
        ? `<a href="${proj.demo}" target="_blank" rel="noopener" class="card-action-btn demo-btn" title="Live Demo">
             <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
             Live Demo
           </a>` 
        : '';

      card.innerHTML = `
        <div class="card-image-wrap">
          <img src="${proj.image}" alt="${proj.title} Preview" loading="lazy" class="card-img" />
          <div class="card-category-badge">${proj.categoryName}</div>
          <div class="card-overlay-actions">
            <button class="view-details-btn" data-id="${proj.id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              View Architecture & Details
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="card-header">
            <h3 class="card-title">${proj.title}</h3>
            <span class="card-year">2025–26</span>
          </div>
          <p class="card-description">${proj.tagline}</p>
          <div class="card-tech-chips">
            ${badgesHtml}
          </div>
          <div class="card-footer">
            <div class="card-links">
              <a href="${proj.github}" target="_blank" rel="noopener noreferrer" class="card-action-btn github-btn" title="View Source Code" data-track-event="github_click" data-track-label="${proj.title} Code">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                Code
              </a>
              ${demoBtn}
            </div>
            <button class="text-details-link view-details-btn" data-id="${proj.id}">Details &rarr;</button>
          </div>
        </div>
      `;

      // 3D Card Tilt effect on desktop
      if (window.matchMedia('(pointer: fine)').matches) {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = ((y - centerY) / centerY) * -6;
          const rotateY = ((x - centerX) / centerX) * 6;
          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
        });

        card.addEventListener('mouseleave', () => {
          card.style.transform = '';
        });
      }

      projectsGrid.appendChild(card);
    });

    // Attach modal openers
    document.querySelectorAll('.view-details-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        openProjectModal(id);
      });
    });
  }

  // Filter Buttons
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-filter');
      renderProjects(cat);
    });
  });

  // Initial render
  renderProjects('all');

  // ==========================================
  // 8. PROJECT DETAIL MODAL
  // ==========================================
  const projectModal = document.getElementById('project-modal');
  const projectModalBody = document.getElementById('project-modal-body');
  const projectModalClose = document.getElementById('project-modal-close');

  function openProjectModal(id) {
    if (!projectModal || !projectModalBody || typeof PROJECTS_DATA === 'undefined') return;

    const proj = PROJECTS_DATA.find(p => p.id === id);
    if (!proj) return;

    const statsHtml = proj.stats.map(s => `
      <div class="modal-stat-box">
        <span class="modal-stat-val">${s.value}</span>
        <span class="modal-stat-lbl">${s.label}</span>
      </div>
    `).join('');

    const featuresHtml = proj.features.map(f => `
      <li>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        <span>${f}</span>
      </li>
    `).join('');

    const allTechHtml = proj.tech.map(t => `<span class="tech-chip">${t}</span>`).join('');

    projectModalBody.innerHTML = `
      <div class="modal-banner-wrap">
        <img src="${proj.image}" alt="${proj.title} Banner" class="modal-banner-img" />
        <div class="modal-banner-badge">${proj.categoryName}</div>
      </div>
      <div class="modal-inner-content">
        <div class="modal-top-meta">
          <div>
            <h2 class="modal-title">${proj.title}</h2>
            <p class="modal-tagline">${proj.tagline}</p>
          </div>
          <div class="modal-cta-group">
            <a href="${proj.github}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" data-track-event="github_click" data-track-label="${proj.title} Modal Code">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              View Source Code
            </a>
            ${proj.demo ? `<a href="${proj.demo}" target="_blank" rel="noopener" class="btn btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
              Open Live Application
            </a>` : ''}
          </div>
        </div>

        <div class="modal-stats-row">
          ${statsHtml}
        </div>

        <div class="modal-section-block">
          <h3>Project Overview</h3>
          <p>${proj.overview}</p>
        </div>

        <div class="modal-grid-two">
          <div class="modal-section-block">
            <h3>Problem Addressed</h3>
            <p>${proj.problem}</p>
          </div>
          <div class="modal-section-block">
            <h3>Engineering Solution</h3>
            <p>${proj.solution}</p>
          </div>
        </div>

        <div class="modal-section-block">
          <h3>Key Capabilities & Features</h3>
          <ul class="modal-features-list">
            ${featuresHtml}
          </ul>
        </div>

        <div class="modal-section-block">
          <h3>Architecture & Pipeline</h3>
          <div class="architecture-box">
            <code>${proj.architecture}</code>
          </div>
        </div>

        <div class="modal-section-block">
          <h3>Technology Stack</h3>
          <div class="card-tech-chips" style="margin-top: 10px;">
            ${allTechHtml}
          </div>
        </div>
      </div>
    `;

    projectModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeProjectModal() {
    if (projectModal) {
      projectModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (projectModalClose) projectModalClose.addEventListener('click', closeProjectModal);
  if (projectModal) {
    projectModal.addEventListener('click', (e) => {
      if (e.target === projectModal) closeProjectModal();
    });
  }

  // ==========================================
  // 9. RESUME MODAL & DOWNLOAD
  // ==========================================
  const resumeModal = document.getElementById('resume-modal');
  const viewResumeBtns = document.querySelectorAll('.open-resume-btn');
  const resumeModalClose = document.getElementById('resume-modal-close');
  const printResumeBtn = document.getElementById('print-resume-btn');

  viewResumeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (resumeModal) {
        resumeModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  function closeResumeModal() {
    if (resumeModal) {
      resumeModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (resumeModalClose) resumeModalClose.addEventListener('click', closeResumeModal);
  if (resumeModal) {
    resumeModal.addEventListener('click', (e) => {
      if (e.target === resumeModal) closeResumeModal();
    });
  }

  if (printResumeBtn) {
    printResumeBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // ==========================================
  // 10. SKILLS FILTERING
  // ==========================================
  const skillCategoryButtons = document.querySelectorAll('.skill-tab-btn');
  const skillCards = document.querySelectorAll('.skill-card');

  skillCategoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      skillCategoryButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.getAttribute('data-skill-category');
      skillCards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        if (category === 'all' || cardCat === category) {
          card.style.display = 'flex';
          card.classList.add('visible');
        } else {
          card.style.display = 'none';
        }
      });
    });
  });


  // ==========================================
  // 12. PRIVATE ADMIN ANALYTICS DASHBOARD
  // ==========================================
  const adminModal = document.getElementById('admin-modal');
  const adminModalClose = document.getElementById('admin-modal-close');
  const adminTriggerBtn = document.getElementById('admin-trigger-btn');
  const adminAuthView = document.getElementById('admin-auth-view');
  const adminDataView = document.getElementById('admin-data-view');
  const adminPinInput = document.getElementById('admin-pin-input');
  const adminPinSubmit = document.getElementById('admin-pin-submit');
  const adminPinError = document.getElementById('admin-pin-error');
  const clearLogsBtn = document.getElementById('clear-logs-btn');

  const CORRECT_PIN = '9820'; // Configurable default PIN for Naveen

  function openAdmin() {
    if (!adminModal) return;
    adminModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // If authenticated in current session, go directly to data view
    if (sessionStorage.getItem('nc_admin_authed') === 'true') {
      showAdminDashboard();
    } else {
      adminAuthView.style.display = 'block';
      adminDataView.style.display = 'none';
      adminPinInput.value = '';
      adminPinError.textContent = '';
      setTimeout(() => adminPinInput.focus(), 200);
    }
  }

  function closeAdmin() {
    if (adminModal) {
      adminModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (adminTriggerBtn) adminTriggerBtn.addEventListener('click', openAdmin);
  if (adminModalClose) adminModalClose.addEventListener('click', closeAdmin);
  if (adminModal) {
    adminModal.addEventListener('click', (e) => {
      if (e.target === adminModal) closeAdmin();
    });
  }

  // URL Hash shortcut `#admin` or `#analytics`
  if (window.location.hash === '#admin' || window.location.hash === '#analytics') {
    setTimeout(openAdmin, 1000);
  }
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#admin' || window.location.hash === '#analytics') {
      openAdmin();
    }
  });

  // Keyboard shortcut Ctrl + Shift + A
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
      e.preventDefault();
      openAdmin();
    }
    if (e.key === 'Escape') {
      closeProjectModal();
      closeResumeModal();
      closeAdmin();
    }
  });

  if (adminPinSubmit && adminPinInput) {
    adminPinSubmit.addEventListener('click', handlePinVerification);
    adminPinInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handlePinVerification();
    });
  }

  async function renderAdminData() {
    const adminPin = sessionStorage.getItem('nc_admin_pin') || '9820';

    const totalIdentifiedEl = document.getElementById('adm-identified-visitors');
    const totalAnonEl = document.getElementById('adm-anon-visitors');
    const clicksBreakdownEl = document.getElementById('adm-clicks-breakdown');
    const recentActivityBody = document.getElementById('adm-activity-table-body');
    const visitorsRosterBody = document.getElementById('adm-roster-table-body');

    try {
      const res = await fetch('/api/admin/analytics', {
        headers: { 'x-admin-pin': adminPin }
      });
      const data = await res.json();

      if (res.ok && data.success && data.data) {
        const stats = data.data;

        if (totalIdentifiedEl) totalIdentifiedEl.textContent = stats.totalIdentifiedVisitors || 0;
        if (totalAnonEl) totalAnonEl.textContent = stats.anonymousInteractions || 0;

        if (clicksBreakdownEl) {
          const c = stats.clicksByType || {};
          clicksBreakdownEl.innerHTML = `
            <div class="adm-device-chip" style="border-color: #818cf8;"><span>💻 GitHub</span><strong>${c.github || 0}</strong></div>
            <div class="adm-device-chip" style="border-color: #0a66c2;"><span>💼 LinkedIn</span><strong>${c.linkedin || 0}</strong></div>
            <div class="adm-device-chip" style="border-color: #e1306c;"><span>📸 Instagram</span><strong>${c.instagram || 0}</strong></div>
            <div class="adm-device-chip" style="border-color: #10b981;"><span>📄 Resume</span><strong>${c.resume || 0}</strong></div>
            <div class="adm-device-chip" style="border-color: #f59e0b;"><span>✉️ Contact</span><strong>${c.contact || 0}</strong></div>
            <div class="adm-device-chip" style="border-color: #06b6d4;"><span>🚀 Live Demos</span><strong>${c.demo || 0}</strong></div>
          `;
        }

        // Recent Activity Feed
        if (recentActivityBody) {
          const items = stats.recentInteractions || [];
          if (items.length === 0) {
            recentActivityBody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:20px;">No interaction events recorded yet. Click GitHub or LinkedIn to see real-time updates!</td></tr>`;
          } else {
            recentActivityBody.innerHTML = items.map(it => {
              const time = new Date(it.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
              const visitorDisplay = it.isIdentified 
                ? `<span style="color:#38bdf8;font-weight:600;">${escapeHtml(it.visitorEmail)}</span>`
                : `<span style="color:var(--text-muted);">Anonymous Visitor</span>`;
              return `
                <tr>
                  <td>${visitorDisplay}</td>
                  <td><strong style="color:var(--primary-light);">${escapeHtml(it.eventLabel || it.eventType)}</strong></td>
                  <td>${time}</td>
                  <td>${escapeHtml(it.device || 'Desktop')} &bull; ${escapeHtml(it.browser || '')}</td>
                  <td>${escapeHtml(it.location || 'Local')}</td>
                </tr>
              `;
            }).join('');
          }
        }

        // Identified Visitors Roster
        if (visitorsRosterBody) {
          const roster = stats.visitorsRoster || [];
          if (roster.length === 0) {
            visitorsRosterBody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:20px;">No visitors have connected with Google yet. Use 'Connect with Naveen' to test!</td></tr>`;
          } else {
            visitorsRosterBody.innerHTML = roster.map(v => {
              const firstSeen = new Date(v.firstSeen).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              const lastSeen = new Date(v.lastSeen).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
              return `
                <tr>
                  <td><strong>${escapeHtml(v.displayName || 'Visitor')}</strong></td>
                  <td><code>${escapeHtml(v.email)}</code></td>
                  <td>${firstSeen}</td>
                  <td><span class="tech-chip" style="color:#10b981;">${v.interactionCount} events</span></td>
                </tr>
              `;
            }).join('');
          }
        }

      }
    } catch (err) {
      console.warn('[ADMIN FETCH ERROR]', err);
    }
  }

  function handlePinVerification() {
    const pin = adminPinInput.value.trim();
    if (pin === CORRECT_PIN) {
      sessionStorage.setItem('nc_admin_authed', 'true');
      sessionStorage.setItem('nc_admin_pin', pin);
      showAdminDashboard();
    } else {
      adminPinError.textContent = 'Invalid PIN code. Please try again.';
      adminPinInput.value = '';
    }
  }

  if (clearLogsBtn) {
    clearLogsBtn.addEventListener('click', () => {
      renderAdminData();
    });
  }

  // ==========================================
  // 13. AMBIENT BACKGROUND PARTICLES CANVAS
  // ==========================================
  const bgCanvas = document.getElementById('bg-particles');
  if (bgCanvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const bgCtx = bgCanvas.getContext('2d');
    let bgW = bgCanvas.width = window.innerWidth;
    let bgH = bgCanvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      bgW = bgCanvas.width = window.innerWidth;
      bgH = bgCanvas.height = window.innerHeight;
    }, { passive: true });

    const particles = [];
    const COUNT = Math.min(45, Math.floor(window.innerWidth / 35));

    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * bgW,
        y: Math.random() * bgH,
        radius: Math.random() * 1.8 + 0.6,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        alpha: Math.random() * 0.45 + 0.15
      });
    }

    function animateBg() {
      bgCtx.clearRect(0, 0, bgW, bgH);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = bgW;
        if (p.x > bgW) p.x = 0;
        if (p.y < 0) p.y = bgH;
        if (p.y > bgH) p.y = 0;

        bgCtx.fillStyle = `rgba(99, 102, 241, ${p.alpha})`;
        bgCtx.beginPath();
        bgCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        bgCtx.fill();
      }

      requestAnimationFrame(animateBg);
    }
    requestAnimationFrame(animateBg);
  }

  // Helper escape
  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
