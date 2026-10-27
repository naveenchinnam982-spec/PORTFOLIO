// netlify/functions/auth-manage.js
// Handles visitor disconnect / sign-out and "Delete My Activity" requests

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
    const { action, sessionToken } = JSON.parse(event.body || '{}');

    if (!sessionToken) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing session token' })
      };
    }

    if (action === 'delete-activity') {
      const deleted = db.deleteVisitorData(sessionToken);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true, message: 'Your visitor record and activity logs have been permanently deleted.', deleted })
      };
    }

    // Default action: disconnect
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, message: 'Disconnected successfully.' })
    };
  } catch (err) {
    console.error('[AUTH MANAGE ERROR]', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to manage session' })
    };
  }
};
