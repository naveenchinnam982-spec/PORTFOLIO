// lib/database.js - Production-Ready Lightweight Storage & Analytics Engine
// Handles visitor identity, interaction logging, cooldown rate-limiting, and admin analytics
// Compatible with both local Node.js environment and Netlify Serverless Functions.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Determine appropriate storage directory
function getDbFilePath() {
  // In Netlify serverless / AWS Lambda, /tmp is the writable storage directory
  if (process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join('/tmp', 'portfolio-db.json');
  }
  return path.join(__dirname, '..', 'data', 'portfolio-db.json');
}

const DB_FILE = getDbFilePath();

// In-memory cache
let dbCache = null;
const cooldownCache = new Map(); // key: `${email}_${eventType}` -> timestamp

function initDb() {
  if (dbCache) return dbCache;

  const defaultSchema = {
    visitors: [],       // { id, provider, providerUserId, email, displayName, avatarUrl, sessionToken, firstSeen, lastSeen }
    interactions: [],   // { id, visitorId, visitorEmail, eventType, eventLabel, page, timestamp, device, browser, os, location }
    meta: {
      createdAt: new Date().toISOString(),
      version: '2.0.0'
    }
  };

  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      dbCache = JSON.parse(raw);
      if (!Array.isArray(dbCache.visitors)) dbCache.visitors = [];
      if (!Array.isArray(dbCache.interactions)) dbCache.interactions = [];
    } else {
      dbCache = defaultSchema;
      saveDbToFile();
    }
  } catch (err) {
    console.warn('[DB INIT WARNING] Using fallback in-memory store:', err.message);
    dbCache = defaultSchema;
  }

  return dbCache;
}

function saveDbToFile() {
  if (!dbCache) return;
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(dbCache, null, 2), 'utf8');
  } catch (err) {
    console.warn('[DB SAVE WARNING] Unable to persist to disk, running in memory:', err.message);
  }
}

// Generate secure session token
function generateToken() {
  return 'nc_tok_' + crypto.randomBytes(24).toString('hex');
}

/**
 * Register or update an identified Google visitor
 */
function saveVisitor({ provider = 'google', providerUserId, email, displayName, avatarUrl }) {
  const db = initDb();
  const normalizedEmail = (email || '').toLowerCase().trim();
  const now = new Date().toISOString();

  let visitor = db.visitors.find(v => v.email === normalizedEmail);

  if (visitor) {
    // Update existing visitor
    visitor.lastSeen = now;
    if (displayName) visitor.displayName = displayName;
    if (avatarUrl) visitor.avatarUrl = avatarUrl;
    if (providerUserId) visitor.providerUserId = providerUserId;
    if (!visitor.sessionToken) visitor.sessionToken = generateToken();
  } else {
    // Create new visitor record
    visitor = {
      id: 'vis_' + crypto.randomBytes(8).toString('hex'),
      provider,
      providerUserId: providerUserId || '',
      email: normalizedEmail,
      displayName: displayName || normalizedEmail.split('@')[0],
      avatarUrl: avatarUrl || '',
      sessionToken: generateToken(),
      firstSeen: now,
      lastSeen: now
    };
    db.visitors.push(visitor);
  }

  saveDbToFile();

  return {
    id: visitor.id,
    email: visitor.email,
    displayName: visitor.displayName,
    avatarUrl: visitor.avatarUrl,
    sessionToken: visitor.sessionToken,
    firstSeen: visitor.firstSeen
  };
}

/**
 * Look up visitor by session token
 */
function getVisitorByToken(sessionToken) {
  if (!sessionToken) return null;
  const db = initDb();
  return db.visitors.find(v => v.sessionToken === sessionToken) || null;
}

/**
 * Look up visitor by email
 */
function getVisitorByEmail(email) {
  if (!email) return null;
  const db = initDb();
  const normalized = email.toLowerCase().trim();
  return db.visitors.find(v => v.email === normalized) || null;
}

/**
 * Remove a visitor and permanently delete all their recorded activities
 */
function deleteVisitorData(sessionTokenOrEmail) {
  const db = initDb();
  const visitor = db.visitors.find(v => v.sessionToken === sessionTokenOrEmail || v.email === sessionTokenOrEmail.toLowerCase().trim());
  
  if (!visitor) return false;

  const visitorId = visitor.id;
  const visitorEmail = visitor.email;

  // Remove visitor
  db.visitors = db.visitors.filter(v => v.id !== visitorId);

  // Remove all related interactions
  db.interactions = db.interactions.filter(i => i.visitorId !== visitorId && i.visitorEmail !== visitorEmail);

  // Clear cooldowns
  for (const key of cooldownCache.keys()) {
    if (key.startsWith(`${visitorEmail}_`)) {
      cooldownCache.delete(key);
    }
  }

  saveDbToFile();
  return true;
}

/**
 * Record a visitor interaction (social click, resume click, live demo, etc.)
 */
function recordInteraction({
  sessionToken,
  eventType,
  eventLabel = '',
  page = '/',
  device = 'Desktop',
  browser = 'Modern Browser',
  os = 'Unknown OS',
  location = ''
}) {
  const db = initDb();
  const visitor = getVisitorByToken(sessionToken);
  const now = new Date().toISOString();

  const interaction = {
    id: 'act_' + crypto.randomBytes(8).toString('hex'),
    visitorId: visitor ? visitor.id : null,
    visitorEmail: visitor ? visitor.email : null,
    visitorName: visitor ? visitor.displayName : null,
    isIdentified: !!visitor,
    eventType: eventType || 'unknown_click',
    eventLabel: eventLabel || eventType,
    page: page || '/',
    device: device || 'Desktop',
    browser: browser || 'Unknown',
    os: os || 'Unknown',
    location: location || 'Unknown',
    timestamp: now
  };

  // Keep interaction log clean (latest 1000 items)
  db.interactions.unshift(interaction);
  if (db.interactions.length > 1000) {
    db.interactions = db.interactions.slice(0, 1000);
  }

  // Update visitor lastSeen
  if (visitor) {
    visitor.lastSeen = now;
  }

  saveDbToFile();

  return { interaction, visitor };
}

/**
 * Cooldown Check: prevents sending repeated notification emails for the same action
 * Cooldown period: 15 minutes per (identifier, eventType) pair
 * Works for both authenticated visitor emails and anonymous visitor client IDs/IPs
 */
function shouldSendNotification(identifier, eventType, cooldownMinutes = 15) {
  const safeId = String(identifier || 'anon_visitor').trim().toLowerCase();
  const key = `${safeId}_${eventType}`;
  const now = Date.now();
  const lastSent = cooldownCache.get(key);

  if (lastSent && (now - lastSent < cooldownMinutes * 60 * 1000)) {
    return false; // In cooldown
  }

  cooldownCache.set(key, now);
  return true;
}

/**
 * Comprehensive Analytics Summary for the Private Admin Dashboard
 */
function getAnalyticsSummary() {
  const db = initDb();
  const interactions = db.interactions || [];
  const visitors = db.visitors || [];

  const totalInteractions = interactions.length;
  const identifiedInteractions = interactions.filter(i => i.isIdentified).length;
  const anonymousInteractions = totalInteractions - identifiedInteractions;

  // Clicks breakdown
  const clicksByType = {
    github: 0,
    linkedin: 0,
    instagram: 0,
    resume: 0,
    contact: 0,
    demo: 0,
    other: 0
  };

  const deviceCounts = {};
  const browserCounts = {};
  const locationCounts = {};
  const platformCounts = {};

  interactions.forEach(item => {
    const type = item.eventType || '';
    if (type.includes('github')) {
      clicksByType.github++;
      platformCounts['GitHub'] = (platformCounts['GitHub'] || 0) + 1;
    } else if (type.includes('linkedin')) {
      clicksByType.linkedin++;
      platformCounts['LinkedIn'] = (platformCounts['LinkedIn'] || 0) + 1;
    } else if (type.includes('instagram')) {
      clicksByType.instagram++;
      platformCounts['Instagram'] = (platformCounts['Instagram'] || 0) + 1;
    } else if (type.includes('resume')) {
      clicksByType.resume++;
    } else if (type.includes('contact')) {
      clicksByType.contact++;
    } else if (type.includes('demo')) {
      clicksByType.demo++;
    } else {
      clicksByType.other++;
    }

    // Devices & Browsers
    if (item.device) deviceCounts[item.device] = (deviceCounts[item.device] || 0) + 1;
    if (item.browser) browserCounts[item.browser] = (browserCounts[item.browser] || 0) + 1;
    if (item.location && item.location !== 'Unknown') {
      locationCounts[item.location] = (locationCounts[item.location] || 0) + 1;
    }
  });

  // Most clicked platform
  let mostClickedPlatform = 'GitHub';
  let maxClicks = 0;
  for (const [p, c] of Object.entries(platformCounts)) {
    if (c > maxClicks) {
      maxClicks = c;
      mostClickedPlatform = p;
    }
  }

  return {
    totalVisitors: visitors.length,
    totalIdentifiedVisitors: visitors.length,
    totalInteractions,
    identifiedInteractions,
    anonymousInteractions,
    clicksByType,
    mostClickedPlatform,
    deviceCounts,
    browserCounts,
    locationCounts,
    recentInteractions: interactions.slice(0, 50), // 50 most recent events
    visitorsRoster: visitors.map(v => ({
      email: v.email,
      displayName: v.displayName,
      avatarUrl: v.avatarUrl,
      firstSeen: v.firstSeen,
      lastSeen: v.lastSeen,
      interactionCount: interactions.filter(i => i.visitorEmail === v.email).length
    }))
  };
}

/**
 * Verify Admin PIN
 */
function verifyAdminPin(providedPin) {
  const targetPin = (process.env.ADMIN_PIN || '9820').trim();
  return (providedPin || '').trim() === targetPin;
}

module.exports = {
  saveVisitor,
  getVisitorByToken,
  getVisitorByEmail,
  deleteVisitorData,
  recordInteraction,
  shouldSendNotification,
  getAnalyticsSummary,
  verifyAdminPin
};
