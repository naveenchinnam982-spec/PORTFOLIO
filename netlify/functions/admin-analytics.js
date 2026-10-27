// netlify/functions/admin-analytics.js
// Secure server-side endpoint for the private admin dashboard

const db = require('../../lib/database');

exports.handler = async (event) => {
  // Read PIN from header or query param
  const pin = event.headers['x-admin-pin'] || event.queryStringParameters?.pin || '';

  if (!db.verifyAdminPin(pin)) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Unauthorized: Invalid Admin PIN' })
    };
  }

  try {
    const summary = db.getAnalyticsSummary();
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        data: summary
      })
    };
  } catch (err) {
    console.error('[ADMIN ANALYTICS ERROR]', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to generate analytics' })
    };
  }
};
