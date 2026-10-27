// server.js - Zero-dependency Node.js Local Dev & API Server
// Handles static asset delivery + API routes for Google Auth, Tracking, Notifications, and Admin Analytics

const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables from .env
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim();
          process.env[key] = val;
        }
      }
    });
  }
} catch (e) {
  console.log('No .env file found or error reading .env, using default environment');
}

const db = require('./lib/database');
const notifier = require('./lib/notifier');

const PORT = parseInt(process.env.PORT || '8000', 10);
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.pdf': 'application/pdf'
};

const recentVisitors = new Map();
const COOLDOWN_MS = 15 * 60 * 1000;

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // CORS Headers for API calls
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-pin, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // ==========================================
  // 1. API: Google Auth Registration
  // ==========================================
  if (pathname === '/api/auth/google' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { credential, clientDevUser } = JSON.parse(body || '{}');

        let email = '';
        let displayName = '';
        let avatarUrl = '';
        let providerUserId = '';

        if (credential) {
          const googleInfo = await verifyGoogleIdToken(credential);
          if (!googleInfo || !googleInfo.email) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid Google credential token' }));
            return;
          }
          email = googleInfo.email;
          displayName = googleInfo.name || googleInfo.given_name || email.split('@')[0];
          avatarUrl = googleInfo.picture || '';
          providerUserId = googleInfo.sub || '';
        } else if (clientDevUser && clientDevUser.email) {
          email = clientDevUser.email;
          displayName = clientDevUser.displayName || email.split('@')[0];
          avatarUrl = clientDevUser.avatarUrl || '';
          providerUserId = 'dev_' + Date.now();
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing authentication credential' }));
          return;
        }

        const visitor = db.saveVisitor({
          provider: 'google',
          providerUserId,
          email,
          displayName,
          avatarUrl
        });

        console.log(`[GOOGLE AUTH CONNECTED] Email: ${visitor.email}`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Successfully connected with Google',
          visitor: {
            email: visitor.email,
            displayName: visitor.displayName,
            avatarUrl: visitor.avatarUrl
          },
          sessionToken: visitor.sessionToken
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // ==========================================
  // 2. API: Track Interaction / Social Click (GitHub, LinkedIn, Instagram, etc.)
  // ==========================================
  if ((pathname === '/api/track-social-click' || pathname === '/api/track-interaction') && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const { sessionToken, eventType, eventLabel, page, device, browser, os, location } = payload;

        const { interaction, visitor } = db.recordInteraction({
          sessionToken,
          eventType,
          eventLabel,
          page,
          device,
          browser,
          os,
          location
        });

        let notificationSent = false;

        // Dedup key: visitor email if voluntarily authenticated, else client IP / client ID
        const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
        const cooldownKey = (visitor && visitor.email) ? visitor.email : (payload.clientId || clientIp);

        // Check deduplication cooldown (15 min cooldown per visitor/IP per action)
        const canNotify = db.shouldSendNotification(cooldownKey, eventType, 15);
        if (canNotify) {
          await notifier.sendInteractionNotification({
            visitorEmail: visitor ? visitor.email : null,
            visitorName: visitor ? visitor.displayName : null,
            eventType,
            eventLabel,
            page,
            device,
            browser,
            os,
            location
          });
          notificationSent = true;
        } else {
          console.log(`[COOLDOWN APPLIED] Suppressed duplicate notification for ${cooldownKey} on ${eventType}`);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          isIdentified: !!visitor,
          notificationSent,
          cooldownActive: !notificationSent
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // ==========================================
  // 3. API: Auth Manage (Disconnect / Delete Data)
  // ==========================================
  if (pathname === '/api/auth/manage' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { action, sessionToken } = JSON.parse(body || '{}');
        if (!sessionToken) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing session token' }));
          return;
        }

        if (action === 'delete-activity') {
          const deleted = db.deleteVisitorData(sessionToken);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, message: 'All visitor records and activity permanently removed.', deleted }));
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Disconnected successfully.' }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // ==========================================
  // 4. API: Admin Analytics (Server-side Protected)
  // ==========================================
  if (pathname === '/api/admin/analytics') {
    const pin = req.headers['x-admin-pin'] || parsedUrl.searchParams.get('pin') || '';
    if (!db.verifyAdminPin(pin)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized: Invalid Admin PIN' }));
      return;
    }

    const summary = db.getAnalyticsSummary();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, data: summary }));
    return;
  }

  // ==========================================
  // 5. API: Track Initial Visitor (General Pageview)
  // ==========================================
  if (pathname === '/api/track-visitor' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body || '{}');
        const userAgent = req.headers['user-agent'] || data.userAgent || 'Unknown';
        
        const botPattern = /bot|spider|crawl|slurp|headless|lighthouse/i;
        if (botPattern.test(userAgent)) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, skipped: 'Bot detected' }));
          return;
        }

        const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';
        const locationDisplay = [data.city, data.region, data.country].filter(Boolean).join(', ') || 'Local Development';
        const sessionId = data.sessionId || `sess_${Date.now()}`;
        const dedupeKey = `${clientIp}_${sessionId}`;

        const now = Date.now();
        const lastSeen = recentVisitors.get(dedupeKey);
        if (lastSeen && (now - lastSeen < COOLDOWN_MS)) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, cached: true, message: 'Visitor already logged' }));
          return;
        }
        recentVisitors.set(dedupeKey, now);

        console.log(`[VISITOR PAGEVIEW] Location: ${locationDisplay} | Device: ${data.device} | Browser: ${data.browser}`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Visitor tracked', location: locationDisplay }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }


  // ==========================================
  // 7. Static File Serving
  // ==========================================
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File Not Found');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

function verifyGoogleIdToken(idToken) {
  return new Promise((resolve) => {
    const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed && parsed.email) {
            resolve(parsed);
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}


server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Naveen Chinnam Portfolio Server Live on Port ${PORT}`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`====================================================`);
});
