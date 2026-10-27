// tracker.js - Privacy-Conscious Visitor Analytics & Notification Dispatcher
// Dispatches non-sensitive visitor telemetry to secure backend /api/track-visitor
// Records session data locally for the private Admin Analytics Dashboard.

(function () {
  'use strict';

  const TRACK_API_URL = '/api/track-visitor';
  const SESSION_KEY = 'nc_session_id';
  const TRACKED_FLAG = 'nc_tracked_v2';
  const ANALYTICS_STORAGE_KEY = 'nc_analytics_logs';
  const SEEN_FLAG = 'nc_seen_before';

  // 1. Bot check
  function isBot() {
    const ua = navigator.userAgent || '';
    return /bot|crawler|spider|crawling|headless|lighthouse|preview|facebookexternalhit|whatsapp/i.test(ua);
  }

  // 2. Generate or retrieve session ID
  function getSessionId() {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = 'nc_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  }

  // 3. Detect device category
  function getDeviceType() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'Tablet';
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated/i.test(ua)) return 'Mobile';
    return 'Desktop / Laptop';
  }

  // 4. Detect browser
  function getBrowser() {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox/')) return 'Mozilla Firefox';
    if (ua.includes('Edg/')) return 'Microsoft Edge';
    if (ua.includes('Chrome/')) return 'Google Chrome';
    if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Apple Safari';
    if (ua.includes('OPR/') || ua.includes('Opera/')) return 'Opera';
    return 'Modern Web Browser';
  }

  // 5. Detect operating system
  function getOS() {
    const ua = navigator.userAgent;
    if (ua.includes('Win')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'Unknown OS';
  }

  // 6. Local Analytics Storage Manager
  function recordLocalAnalytics(record) {
    try {
      const existingStr = localStorage.getItem(ANALYTICS_STORAGE_KEY);
      let logs = existingStr ? JSON.parse(existingStr) : [];
      if (!Array.isArray(logs)) logs = [];
      
      // Keep latest 100 entries
      logs.unshift(record);
      if (logs.length > 100) logs = logs.slice(0, 100);
      
      localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {
      // Storage unavailable or disabled
    }
  }

  // 7. Track Visitor Execution
  async function initTracking() {
    if (isBot()) return;

    // Check if already tracked in this active tab session
    const alreadyTrackedInSession = sessionStorage.getItem(TRACKED_FLAG);
    if (alreadyTrackedInSession) {
      return;
    }

    const isReturning = !!localStorage.getItem(SEEN_FLAG);
    localStorage.setItem(SEEN_FLAG, 'true');

    const sessionId = getSessionId();
    const startTime = Date.now();

    // Basic client data
    const payload = {
      sessionId,
      timestamp: new Date().toISOString(),
      device: getDeviceType(),
      browser: getBrowser(),
      os: getOS(),
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      referrer: document.referrer ? new URL(document.referrer).hostname : 'Direct Visit',
      landingPage: window.location.pathname || '/',
      isReturning: isReturning,
      city: '',
      region: '',
      country: ''
    };

    // Attempt lightweight non-invasive IP geolocation lookup
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5s quick timeout

      const geoRes = await fetch('https://ipwho.is/', { signal: controller.signal });
      clearTimeout(timeoutId);

      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData.success) {
          payload.city = geoData.city || '';
          payload.region = geoData.region || '';
          payload.country = geoData.country || '';
          payload.ip = geoData.ip || '';
        }
      }
    } catch (e) {
      // Graceful fallback to backend header detection
    }

    // Mark as tracked for this session so we never spam
    sessionStorage.setItem(TRACKED_FLAG, 'true');

    // Save to local analytics store
    recordLocalAnalytics(payload);

    // Dispatch to secure backend endpoint
    try {
      await fetch(TRACK_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      // Silently catch in offline or static environments
    }
  }

  // Run tracking after window load
  if (document.readyState === 'complete') {
    initTracking();
  } else {
    window.addEventListener('load', initTracking);
  }

  // Expose API for private admin analytics reader
  window.NC_Analytics = {
    getLogs: function () {
      try {
        return JSON.parse(localStorage.getItem(ANALYTICS_STORAGE_KEY) || '[]');
      } catch (e) {
        return [];
      }
    },
    clearLogs: function () {
      localStorage.removeItem(ANALYTICS_STORAGE_KEY);
    }
  };
})();
