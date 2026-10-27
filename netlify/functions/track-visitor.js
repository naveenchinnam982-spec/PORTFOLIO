// Netlify Serverless Function: track-visitor.js
// Securely handles visitor tracking and dispatches email alert to naveenchinnam982@gmail.com
// Secrets are read ONLY from environment variables (NEVER exposed in frontend).

const https = require('https');

// In-memory rate limiting cache for the container lifespan
const recentVisitors = new Map();
const COOLDOWN_MS = 15 * 60 * 1000; // 15-minute cooldown per IP / Session

exports.handler = async (event, context) => {
  // Only accept POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json', 'Allow': 'POST' },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    const userAgent = event.headers['user-agent'] || data.userAgent || 'Unknown';

    // 1. Bot & Crawler Detection
    const botPattern = /bot|spider|crawl|slurp|headless|lighthouse|bingpreview|googlebot|yandex|baiduspider/i;
    if (botPattern.test(userAgent)) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true, skipped: 'Bot detected' })
      };
    }

    // 2. Netlify Edge Geolocation & IP Resolution
    const clientIp = event.headers['x-nf-client-connection-ip'] || 
                     event.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                     data.ip || 'Unknown';
    
    const country = event.headers['x-country'] || data.country || 'Unknown';
    const city = event.headers['x-subdivision-1-name'] || data.city || '';
    const region = data.region || '';
    const locationDisplay = [city, region, country].filter(Boolean).join(', ') || 'Unknown Location';

    const sessionId = data.sessionId || `sess_${Date.now()}`;
    const dedupeKey = `${clientIp}_${sessionId}`;

    // 3. Abuse Protection / Rate Limiting (1 email per visitor session)
    const now = Date.now();
    const lastSeen = recentVisitors.get(dedupeKey);
    if (lastSeen && (now - lastSeen < COOLDOWN_MS)) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true, cached: true, message: 'Visitor already logged in current session' })
      };
    }
    recentVisitors.set(dedupeKey, now);

    // Clean up old cache entries
    for (const [key, timestamp] of recentVisitors.entries()) {
      if (now - timestamp > COOLDOWN_MS * 2) {
        recentVisitors.delete(key);
      }
    }

    // 4. Extract non-sensitive visitor parameters
    const timestamp = data.timestamp || new Date().toISOString();
    const localTimeStr = new Date(timestamp).toLocaleString('en-US', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'medium' });
    const device = data.device || 'Desktop / Laptop';
    const browser = data.browser || 'Modern Browser';
    const os = data.os || 'Unknown OS';
    const referrer = data.referrer || 'Direct Visit';
    const landingPage = data.landingPage || '/';
    const isReturning = data.isReturning ? 'Returning Visitor (Welcome Back!)' : 'First-Time New Visitor';
    const screenRes = data.screenResolution || 'Unknown';

    // 5. Send Notification Email if API Key is configured
    const recipientEmail = process.env.NOTIFICATION_EMAIL || 'naveenchinnam982@gmail.com';
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.FROM_EMAIL || 'Portfolio Alert <onboarding@resend.dev>';

    const htmlEmail = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #e2e8f0; margin: 0; padding: 24px; }
          .card { background: #131b2e; border: 1px solid #1e293b; border-radius: 16px; max-width: 600px; margin: 0 auto; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
          .header { background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%); padding: 32px 24px; text-align: center; }
          .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
          .header p { margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px; }
          .body { padding: 28px 24px; }
          .metric-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
          .metric { background: #182238; border: 1px solid #23314e; border-radius: 12px; padding: 14px; }
          .metric-label { font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.8px; font-weight: 600; }
          .metric-val { font-size: 14px; color: #f8fafc; font-weight: 600; margin-top: 4px; }
          .highlight { background: rgba(99, 102, 241, 0.12); border-left: 4px solid #6366f1; padding: 14px; border-radius: 6px; margin: 20px 0; font-size: 13px; color: #cbd5e1; }
          .footer { text-align: center; padding: 20px 24px; background: #0e1424; border-top: 1px solid #1e293b; font-size: 12px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1>🚀 New Portfolio Visitor</h1>
            <p>A new visitor just explored your personal portfolio website</p>
          </div>
          <div class="body">
            <div class="highlight">
              <strong>${isReturning}</strong> from <strong>${locationDisplay}</strong>
            </div>
            
            <div class="metric-grid">
              <div class="metric">
                <div class="metric-label">Approximate Location</div>
                <div class="metric-val">📍 ${locationDisplay}</div>
              </div>
              <div class="metric">
                <div class="metric-label">Device Type</div>
                <div class="metric-val">📱 ${device}</div>
              </div>
              <div class="metric">
                <div class="metric-label">Browser</div>
                <div class="metric-val">🌐 ${browser}</div>
              </div>
              <div class="metric">
                <div class="metric-label">Operating System</div>
                <div class="metric-val">💻 ${os}</div>
              </div>
              <div class="metric">
                <div class="metric-label">Traffic Source / Referrer</div>
                <div class="metric-val">🔗 ${referrer}</div>
              </div>
              <div class="metric">
                <div class="metric-label">Landing Route</div>
                <div class="metric-val">📄 ${landingPage}</div>
              </div>
              <div class="metric">
                <div class="metric-label">Screen Resolution</div>
                <div class="metric-val">🖥️ ${screenRes}</div>
              </div>
              <div class="metric">
                <div class="metric-label">Time (IST)</div>
                <div class="metric-val">⏱️ ${localTimeStr}</div>
              </div>
            </div>

            <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 24px;">
              Session ID: <code>${sessionId}</code>
            </p>
          </div>
          <div class="footer">
            Portfolio of Naveen Chinnam &bull; Autonomous Visitor Monitoring System
          </div>
        </div>
      </body>
      </html>
    `;

    // If Resend API Key is provided, dispatch email
    if (resendApiKey) {
      await sendResendEmail({
        apiKey: resendApiKey,
        from: fromEmail,
        to: recipientEmail,
        subject: `New Portfolio Visitor — ${locationDisplay}`,
        html: htmlEmail
      });
    } else {
      console.log('[VISITOR TRACKER] RESEND_API_KEY not configured. Visitor logged to console:');
      console.log({ location: locationDisplay, device, browser, os, referrer, timestamp: localTimeStr });
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Visitor notification recorded',
        location: locationDisplay
      })
    };
  } catch (err) {
    console.error('[VISITOR TRACKER ERROR]', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
};

function sendResendEmail({ apiKey, from, to, subject, html }) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      from,
      to: [to],
      subject,
      html
    });

    const options = {
      hostname: 'api.resend.com',
      port: 443,
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (d) => { responseBody += d; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(responseBody);
        } else {
          console.warn('[RESEND API RESPONSE]', res.statusCode, responseBody);
          resolve(responseBody); // Resolve so function doesn't crash
        }
      });
    });

    req.on('error', (e) => {
      console.error('[RESEND API REQUEST ERROR]', e);
      resolve(null);
    });

    req.write(postData);
    req.end();
  });
}
