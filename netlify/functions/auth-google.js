// netlify/functions/auth-google.js
// Verifies Google OAuth ID Token, registers or updates visitor, and issues secure session token.

const https = require('https');
const db = require('../../lib/database');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json', 'Allow': 'POST' },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { credential, clientDevUser } = JSON.parse(event.body || '{}');

    let email = '';
    let displayName = '';
    let avatarUrl = '';
    let providerUserId = '';

    // 1. If real Google ID Token is provided, verify it with Google OAuth2 API
    if (credential) {
      const googleInfo = await verifyGoogleIdToken(credential);
      if (!googleInfo || !googleInfo.email) {
        return {
          statusCode: 401,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Invalid Google credential token' })
        };
      }
      email = googleInfo.email;
      displayName = googleInfo.name || googleInfo.given_name || email.split('@')[0];
      avatarUrl = googleInfo.picture || '';
      providerUserId = googleInfo.sub || '';
    } 
    // 2. Development Simulation Fallback (when GOOGLE_CLIENT_ID is testing locally)
    else if (clientDevUser && clientDevUser.email) {
      email = clientDevUser.email;
      displayName = clientDevUser.displayName || email.split('@')[0];
      avatarUrl = clientDevUser.avatarUrl || '';
      providerUserId = 'dev_' + Date.now();
    } else {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing authentication credential' })
      };
    }

    // Save or update visitor in storage
    const visitor = db.saveVisitor({
      provider: 'google',
      providerUserId,
      email,
      displayName,
      avatarUrl
    });

    console.log(`[GOOGLE AUTH SUCCESS] Identified visitor: ${email}`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        message: 'Successfully connected with Google',
        visitor: {
          email: visitor.email,
          displayName: visitor.displayName,
          avatarUrl: visitor.avatarUrl
        },
        sessionToken: visitor.sessionToken
      })
    };
  } catch (err) {
    console.error('[AUTH ERROR]', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Authentication processing failed' })
    };
  }
};

/**
 * Verify Google ID Token with Google OAuth2 API
 */
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
    }).on('error', () => {
      resolve(null);
    });
  });
}
