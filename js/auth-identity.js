// js/auth-identity.js - Production-Ready Google Identity & Social Click Tracking
// Manages optional Google Sign-In, visitor consent, non-blocking beacon tracking, and disconnect options.

(function () {
  'use strict';

  const STORAGE_TOKEN_KEY = 'nc_session_token';
  const STORAGE_VISITOR_KEY = 'nc_visitor_info';

  // 1. Visitor Session State Management
  const AuthState = {
    sessionToken: localStorage.getItem(STORAGE_TOKEN_KEY) || null,
    visitor: null,

    init() {
      try {
        const stored = localStorage.getItem(STORAGE_VISITOR_KEY);
        if (stored) {
          this.visitor = JSON.parse(stored);
        }
      } catch (e) {
        this.visitor = null;
      }
      this.renderUI();
    },

    setSession(token, visitorInfo) {
      this.sessionToken = token;
      this.visitor = visitorInfo;
      localStorage.setItem(STORAGE_TOKEN_KEY, token);
      localStorage.setItem(STORAGE_VISITOR_KEY, JSON.stringify(visitorInfo));
      this.renderUI();
    },

    clearSession() {
      this.sessionToken = null;
      this.visitor = null;
      localStorage.removeItem(STORAGE_TOKEN_KEY);
      localStorage.removeItem(STORAGE_VISITOR_KEY);
      this.renderUI();
    },

    isIdentified() {
      return !!(this.sessionToken && this.visitor && this.visitor.email);
    },

    renderUI() {
      const authContainer = document.getElementById('visitor-auth-widget');
      if (!authContainer) return;

      if (this.isIdentified()) {
        const initial = (this.visitor.displayName || this.visitor.email || 'U').charAt(0).toUpperCase();
        const avatarHtml = this.visitor.avatarUrl 
          ? `<img src="${this.visitor.avatarUrl}" alt="Avatar" class="auth-avatar-img" />`
          : `<div class="auth-avatar-initial">${initial}</div>`;

        authContainer.innerHTML = `
          <div class="auth-connected-pill" id="auth-connected-pill" title="Connected as ${this.visitor.email}">
            <span class="auth-status-dot"></span>
            ${avatarHtml}
            <span class="auth-connected-text">Connected</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>

          <div class="auth-dropdown-menu" id="auth-dropdown-menu">
            <div class="auth-dropdown-header">
              <strong>${escapeHtml(this.visitor.displayName || 'Visitor')}</strong>
              <small>${escapeHtml(this.visitor.email)}</small>
            </div>
            <div class="auth-dropdown-divider"></div>
            <div class="auth-dropdown-info">
              Your interactions with Naveen's portfolio (GitHub, LinkedIn, Resume) are privately recognized.
            </div>
            <div class="auth-dropdown-divider"></div>
            <button class="auth-dropdown-item" id="auth-disconnect-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Disconnect Account
            </button>
            <button class="auth-dropdown-item text-danger" id="auth-delete-data-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              Delete My Activity
            </button>
          </div>
        `;

        // Toggle dropdown
        const pill = document.getElementById('auth-connected-pill');
        const menu = document.getElementById('auth-dropdown-menu');
        pill.addEventListener('click', (e) => {
          e.stopPropagation();
          menu.classList.toggle('active');
        });

        document.addEventListener('click', () => {
          if (menu) menu.classList.remove('active');
        });

        // Disconnect handler
        document.getElementById('auth-disconnect-btn').addEventListener('click', async () => {
          try {
            await fetch('/api/auth/manage', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'disconnect', sessionToken: this.sessionToken })
            });
          } catch (e) {}
          this.clearSession();
          showToast('Disconnected from portfolio.');
        });

        // Delete data handler
        document.getElementById('auth-delete-data-btn').addEventListener('click', async () => {
          if (confirm('Permanently delete your visitor profile and all recorded interaction activity?')) {
            try {
              await fetch('/api/auth/manage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete-activity', sessionToken: this.sessionToken })
              });
            } catch (e) {}
            this.clearSession();
            showToast('All your activity has been deleted.');
          }
        });

      } else {
        // Disconnected / Anonymous State
        authContainer.innerHTML = `
          <button class="auth-connect-btn" id="open-auth-modal-btn">
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Connect with Naveen</span>
          </button>
        `;

        document.getElementById('open-auth-modal-btn').addEventListener('click', () => {
          openAuthModal();
        });
      }
    }
  };

  // 2. Google Sign-In Modal Management
  function openAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Initialize Google Identity Services button if available
    initGoogleButton();
  }

  function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  function initGoogleButton() {
    const clientIdMeta = document.querySelector('meta[name="google-signin-client_id"]');
    const clientId = clientIdMeta ? clientIdMeta.getAttribute('content') : '';

    if (window.google && window.google.accounts && clientId && !clientId.includes('YOUR_GOOGLE_CLIENT_ID')) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false
        });

        const targetDiv = document.getElementById('google-btn-container');
        if (targetDiv) {
          window.google.accounts.id.renderButton(targetDiv, {
            theme: 'filled_black',
            size: 'large',
            shape: 'pill',
            text: 'continue_with',
            width: 280
          });
        }
      } catch (err) {
        console.warn('[GOOGLE GIS INIT ERROR]', err);
      }
    }
  }

  // Handle Google Credential Response
  async function handleGoogleCredentialResponse(response) {
    if (!response || !response.credential) return;

    const modalStatus = document.getElementById('auth-modal-status');
    if (modalStatus) {
      modalStatus.textContent = 'Connecting and verifying your Google account...';
      modalStatus.style.display = 'block';
    }

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        AuthState.setSession(data.sessionToken, data.visitor);
        closeAuthModal();
        showToast(`Connected as ${data.visitor.email}! Your interactions are recognized.`);
      } else {
        throw new Error(data.error || 'Authentication failed');
      }
    } catch (err) {
      if (modalStatus) {
        modalStatus.textContent = 'Error: ' + err.message;
        modalStatus.style.color = '#ef4444';
      }
    }
  }

  // Developer simulation sign-in for testing
  window.submitDevAuth = async function (testEmail, testName) {
    const email = (testEmail || document.getElementById('dev-test-email')?.value || '').trim();
    const name = (testName || document.getElementById('dev-test-name')?.value || '').trim();

    if (!email || !email.includes('@')) {
      alert('Please enter a valid test email address.');
      return;
    }

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientDevUser: {
            email,
            displayName: name || email.split('@')[0],
            avatarUrl: ''
          }
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        AuthState.setSession(data.sessionToken, data.visitor);
        closeAuthModal();
        showToast(`Connected as ${data.visitor.email}!`);
      } else {
        alert(data.error || 'Failed to sign in');
      }
    } catch (err) {
      alert('Sign in error: ' + err.message);
    }
  };

  // 3. Non-Blocking Social & Activity Tracking
  function setupInteractionTracking() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-track-event]');
      if (!target) return;

      const eventType = target.getAttribute('data-track-event');
      const eventLabel = target.getAttribute('data-track-label') || target.innerText.trim();

      // Gather non-sensitive client data
      const payload = {
        sessionToken: AuthState.sessionToken,
        clientId: getOrCreateClientId(),
        eventType,
        eventLabel,
        page: window.location.pathname || '/',
        device: getDeviceType(),
        browser: getBrowser(),
        os: getOS(),
        location: '',
        timestamp: new Date().toISOString()
      };

      // Asynchronous non-blocking dispatch via keepalive fetch & sendBeacon
      const payloadString = JSON.stringify(payload);
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const endpoint = isLocal ? '/api/track-social-click' : '/.netlify/functions/track-social-click';

      console.log(`[SOCIAL CLICK TRACK] Sending ${eventType} to ${endpoint}`);

      // Primary: Modern keepalive fetch (does not block navigation, reliable on Netlify)
      if (window.fetch) {
        fetch(endpoint, {
          method: 'POST',
          keepalive: true,
          headers: { 'Content-Type': 'application/json' },
          body: payloadString
        }).then(res => {
          if (res.ok) {
            console.log(`[SOCIAL CLICK TRACK SUCCESS] ${eventType} recorded (HTTP ${res.status})`);
          } else {
            console.warn(`[SOCIAL CLICK TRACK WARNING] Server returned HTTP ${res.status}`);
          }
        }).catch(err => {
          console.warn('[SOCIAL CLICK TRACK NETWORK ERROR]', err.message);
          // Fallback to sendBeacon if fetch network fails
          if (navigator.sendBeacon) {
            try {
              const blob = new Blob([payloadString], { type: 'application/json' });
              navigator.sendBeacon('/api/track-social-click', blob);
            } catch (_) {}
          }
        });
      } else if (navigator.sendBeacon) {
        try {
          const blob = new Blob([payloadString], { type: 'application/json' });
          navigator.sendBeacon(endpoint, blob);
        } catch (_) {}
      }
    }, true);
  }

  function getDeviceType() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'Tablet';
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle/i.test(ua)) return 'Mobile';
    return 'Desktop';
  }

  function getBrowser() {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox/')) return 'Firefox';
    if (ua.includes('Edg/')) return 'Edge';
    if (ua.includes('Chrome/')) return 'Chrome';
    if (ua.includes('Safari/')) return 'Safari';
    return 'Browser';
  }

  function getOS() {
    const ua = navigator.userAgent;
    if (ua.includes('Win')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'OS';
  }

  function getOrCreateClientId() {
    try {
      let cid = sessionStorage.getItem('nc_visitor_cid');
      if (!cid) {
        cid = 'cid_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
        sessionStorage.setItem('nc_visitor_cid', cid);
      }
      return cid;
    } catch (e) {
      return 'anon_' + Date.now();
    }
  }

  function showToast(msg) {
    let toast = document.getElementById('portfolio-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'portfolio-toast';
      toast.className = 'portfolio-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Expose Globally
  window.NC_Auth = {
    AuthState,
    openAuthModal,
    closeAuthModal,
    handleGoogleCredentialResponse
  };

  // Initialize on DOM load
  document.addEventListener('DOMContentLoaded', () => {
    AuthState.init();
    setupInteractionTracking();

    const closeBtn = document.getElementById('auth-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', closeAuthModal);

    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeAuthModal();
      });
    }
  });

})();
