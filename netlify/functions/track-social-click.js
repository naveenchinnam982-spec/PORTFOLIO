// netlify/functions/track-social-click.js
// Production Serverless Function for Netlify
// Tracks social profile clicks (GitHub, LinkedIn, Instagram) and sends email notification to naveenchinnam982@gmail.com.

const notifier = require('../../lib/notifier');
const db = require('../../lib/database');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Content-Type': 'application/json'
};

// In-memory rate limiting cache across warm function instances
const recentClicks = new Map();
const COOLDOWN_MS = 15 * 60 * 1000; // 15-minute cooldown per visitor session per platform

exports.handler = async (event) => {
  // 1. Handle CORS Preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: ''
    };
  }

  // 2. Validate HTTP Method
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method Not Allowed. Use POST.' })
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const {
      sessionToken,
      clientId,
      eventType = 'instagram_click',
      eventLabel,
      page = '/',
      device = 'Desktop',
      browser = 'Modern Browser',
      os = 'Unknown OS',
      location = ''
    } = payload;

    // Detect bots
    const userAgent = event.headers['user-agent'] || '';
    if (/bot|spider|crawl|lighthouse|headless/i.test(userAgent)) {
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: true, skipped: 'Bot detected' })
      };
    }

    // Resolve client IP from Netlify edge headers
    const clientIp = event.headers['x-nf-client-connection-ip'] || 
                     event.headers['client-ip'] || 
                     event.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                     '127.0.0.1';

    const edgeCountry = event.headers['x-country'] || '';
    const edgeCity = event.headers['x-subdivision-1-name'] || '';
    const edgeLocation = [edgeCity, edgeCountry].filter(Boolean).join(', ') || location || 'Unknown Location';

    // Check optional voluntary visitor identity from db
    let visitor = null;
    try {
      if (sessionToken && db.getVisitorBySession) {
        visitor = db.getVisitorBySession(sessionToken);
      }
    } catch (_) {}

    // Record interaction in database / local store if available
    try {
      if (db.recordInteraction) {
        db.recordInteraction({
          sessionToken,
          eventType,
          eventLabel,
          page,
          device,
          browser,
          os,
          location: edgeLocation
        });
      }
    } catch (_) {}

    // 3. Deduplication & Cooldown Mechanism
    // Key is combination of (visitor email OR client ID/IP) + eventType
    const dedupeIdentity = (visitor && visitor.email) ? visitor.email : (clientId || clientIp);
    const dedupeKey = `${dedupeIdentity}_${eventType}`;

    const now = Date.now();
    const lastClickTime = recentClicks.get(dedupeKey);
    let notificationSent = false;
    let cooldownActive = false;

    if (lastClickTime && (now - lastClickTime < COOLDOWN_MS)) {
      cooldownActive = true;
      console.log(`[COOLDOWN ACTIVE] Duplicate click suppressed for ${dedupeKey} (cooldown: 15m)`);
    } else {
      recentClicks.set(dedupeKey, now);

      // Clean up stale cache
      for (const [k, timestamp] of recentClicks.entries()) {
        if (now - timestamp > COOLDOWN_MS * 2) {
          recentClicks.delete(k);
        }
      }

      // 4. Send Email Notification
      const notifyResult = await notifier.sendInteractionNotification({
        visitorEmail: visitor ? visitor.email : null,
        visitorName: visitor ? visitor.displayName : null,
        eventType,
        eventLabel,
        page,
        device,
        browser,
        os,
        location: edgeLocation
      });

      notificationSent = notifyResult.delivered || notifyResult.simulated || false;
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        success: true,
        action: eventType,
        notificationSent,
        cooldownActive,
        recipient: 'naveenchinnam982@gmail.com',
        timestamp: new Date().toISOString()
      })
    };
  } catch (err) {
    console.error('[TRACK SOCIAL CLICK ERROR]', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Failed to process social click interaction' })
    };
  }
};
