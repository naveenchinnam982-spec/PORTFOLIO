// lib/notifier.js - Secure Activity Notification Dispatcher
// Formats and routes visitor activity alerts to naveenchinnam982@gmail.com
// Supports Resend, SendGrid, and Brevo with zero-secret exposure.

const https = require('https');

function getEventMeta(eventType, eventLabel) {
  switch (eventType) {
    case 'instagram_click':
      return {
        subject: '🔔 Someone clicked Instagram — NAVEEN CHINNAM Portfolio',
        actionName: 'Instagram Profile Click',
        noticeText: 'Someone clicked your Instagram profile link.',
        icon: '📸',
        color: '#e1306c',
        platform: 'Instagram'
      };
    case 'github_click':
      return {
        subject: '🔔 Someone clicked GitHub — NAVEEN CHINNAM Portfolio',
        actionName: 'GitHub Profile Click',
        noticeText: 'Someone clicked your GitHub profile link.',
        icon: '💻',
        color: '#818cf8',
        platform: 'GitHub'
      };
    case 'linkedin_click':
      return {
        subject: '🔔 Someone clicked LinkedIn — NAVEEN CHINNAM Portfolio',
        actionName: 'LinkedIn Profile Click',
        noticeText: 'Someone clicked your LinkedIn profile link.',
        icon: '💼',
        color: '#0a66c2',
        platform: 'LinkedIn'
      };
    case 'resume_click':
      return {
        subject: '🔔 Someone viewed Resume — NAVEEN CHINNAM Portfolio',
        actionName: 'Resume View / Download',
        noticeText: 'Someone viewed or downloaded your Resume.',
        icon: '📄',
        color: '#10b981',
        platform: 'Resume'
      };
    case 'project_demo_click':
      return {
        subject: `🔔 Someone clicked Demo (${eventLabel || 'Project'}) — NAVEEN CHINNAM Portfolio`,
        actionName: `Project Live Demo Click (${eventLabel || 'Project'})`,
        noticeText: 'Someone opened a live project demo.',
        icon: '🚀',
        color: '#06b6d4',
        platform: 'Project Demo'
      };
    default:
      return {
        subject: `🔔 Someone clicked ${eventLabel || 'Portfolio Link'} — NAVEEN CHINNAM Portfolio`,
        actionName: eventLabel ? `${eventLabel} Click` : 'Portfolio Link Click',
        noticeText: 'Someone interacted with your portfolio.',
        icon: '⚡',
        color: '#6366f1',
        platform: eventLabel || 'Portfolio'
      };
  }
}

/**
 * Dispatch an email notification for a visitor interaction (normal visitor or voluntary sign-in)
 */
async function sendInteractionNotification({
  visitorEmail = null,
  visitorName = null,
  eventType,
  eventLabel,
  page = '/',
  device = 'Desktop',
  browser = 'Modern Browser',
  os = 'Unknown OS',
  location = 'Unknown'
}) {
  const recipientEmail = process.env.NOTIFICATION_EMAIL || 'naveenchinnam982@gmail.com';
  const meta = getEventMeta(eventType, eventLabel);

  const now = new Date();
  const timeFormatted = now.toLocaleString('en-US', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'medium'
  });

  const isIdentified = !!visitorEmail;
  const visitorDisplay = isIdentified
    ? `${visitorEmail} ${visitorName ? `(${visitorName})` : ''}`
    : 'Normal Visitor (Not Signed In)';

  const textBody = `Someone interacted with your portfolio.

Action:
${meta.actionName}

Time:
${timeFormatted}

Page:
${page}

Device:
${device}

Browser:
${browser}${os && os !== 'Unknown OS' ? ` (${os})` : ''}

${isIdentified ? `Visitor:\n${visitorDisplay}\n\n` : ''}Portfolio:
NAVEEN CHINNAM`;

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #07090f; color: #f8fafc; padding: 24px; margin: 0; }
        .card { background: #0e1424; border: 1px solid #1e293b; border-radius: 16px; max-width: 580px; margin: 0 auto; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(135deg, ${meta.color} 0%, #06b6d4 100%); padding: 26px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 21px; color: #ffffff; letter-spacing: -0.4px; }
        .body { padding: 28px 24px; }
        .alert-box { background: rgba(99, 102, 241, 0.12); border-left: 4px solid ${meta.color}; padding: 14px 18px; border-radius: 8px; margin-bottom: 24px; font-size: 14.5px; color: #e2e8f0; line-height: 1.5; }
        .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 13.5px; }
        .label { color: #94a3b8; font-weight: 500; }
        .val { color: #f8fafc; font-weight: 600; text-align: right; }
        .footer { text-align: center; padding: 18px; background: #090d18; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>${meta.icon} ${meta.actionName}</h1>
        </div>
        <div class="body">
          <div class="alert-box">
            <strong>Someone interacted with your portfolio.</strong><br>
            ${meta.noticeText}
          </div>

          <div class="row">
            <span class="label">Action:</span>
            <span class="val" style="color: ${meta.color};">${meta.actionName}</span>
          </div>

          ${isIdentified ? `
          <div class="row">
            <span class="label">Visitor:</span>
            <span class="val" style="color: #38bdf8;">${visitorDisplay}</span>
          </div>` : ''}

          <div class="row">
            <span class="label">Time (IST):</span>
            <span class="val">${timeFormatted}</span>
          </div>

          <div class="row">
            <span class="label">Page:</span>
            <span class="val">${page}</span>
          </div>

          <div class="row">
            <span class="label">Device:</span>
            <span class="val">${device}</span>
          </div>

          <div class="row">
            <span class="label">Browser:</span>
            <span class="val">${browser}</span>
          </div>

          <div class="row" style="border-bottom: none;">
            <span class="label">Portfolio:</span>
            <span class="val" style="color: #a5b4fc; font-weight: 700;">NAVEEN CHINNAM</span>
          </div>
        </div>
        <div class="footer">
          Portfolio: <strong>NAVEEN CHINNAM</strong> &bull; Social Link Notification Engine
        </div>
      </div>
    </body>
    </html>
  `;

  console.log(`[ACTIVITY ALERT] ${meta.actionName} (${visitorDisplay})`);

  // Provider 1: Resend
  if (process.env.RESEND_API_KEY) {
    try {
      const fromEmail = process.env.FROM_EMAIL || 'Portfolio Activity <onboarding@resend.dev>';
      const res = await sendViaResend({
        apiKey: process.env.RESEND_API_KEY,
        from: fromEmail,
        to: recipientEmail,
        subject: meta.subject,
        text: textBody,
        html: htmlBody
      });
      return { success: true, delivered: true, provider: 'resend', messageId: res.id || 'ok' };
    } catch (err) {
      console.warn('[NOTIFIER ERROR] Resend delivery failed:', err.message);
    }
  }

  // Provider 2: SendGrid
  if (process.env.SENDGRID_API_KEY) {
    try {
      const fromEmail = process.env.FROM_EMAIL || 'naveenchinnam982@gmail.com';
      await sendViaSendGrid({
        apiKey: process.env.SENDGRID_API_KEY,
        from: fromEmail,
        to: recipientEmail,
        subject: meta.subject,
        text: textBody,
        html: htmlBody
      });
      return { success: true, delivered: true, provider: 'sendgrid' };
    } catch (err) {
      console.warn('[NOTIFIER ERROR] SendGrid delivery failed:', err.message);
    }
  }

  // Provider 3: Brevo (Sendinblue)
  if (process.env.BREVO_API_KEY) {
    try {
      const fromEmail = process.env.FROM_EMAIL || 'naveenchinnam982@gmail.com';
      await sendViaBrevo({
        apiKey: process.env.BREVO_API_KEY,
        from: fromEmail,
        to: recipientEmail,
        subject: meta.subject,
        text: textBody,
        html: htmlBody
      });
      return { success: true, delivered: true, provider: 'brevo' };
    } catch (err) {
      console.warn('[NOTIFIER ERROR] Brevo delivery failed:', err.message);
    }
  }

  // Diagnostic Log when no provider is configured
  console.log('[NOTIFIER DIAGNOSTIC] No email API key (RESEND_API_KEY, SENDGRID_API_KEY, or BREVO_API_KEY) detected in environment.');
  console.log('[NOTIFIER DIAGNOSTIC] Notification payload prepared for delivery:');
  console.log({
    subject: meta.subject,
    recipient: recipientEmail,
    action: meta.actionName,
    time: timeFormatted,
    page,
    device,
    browser,
    portfolio: 'NAVEEN CHINNAM'
  });

  return { success: true, delivered: false, simulated: true, provider: 'simulation' };
}

/**
 * Resend HTTPS API Dispatcher
 */
function sendViaResend({ apiKey, from, to, subject, text, html }) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      from,
      to: [to],
      subject,
      text,
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
      let body = '';
      res.on('data', d => { body += d; });
      res.on('end', () => {
        let parsed = {};
        try { parsed = JSON.parse(body); } catch (_) {}
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(parsed);
        } else {
          reject(new Error(`Resend returned HTTP ${res.statusCode}: ${parsed.message || body}`));
        }
      });
    });

    req.on('error', e => reject(e));
    req.write(postData);
    req.end();
  });
}

/**
 * SendGrid HTTPS API Dispatcher
 */
function sendViaSendGrid({ apiKey, from, to, subject, text, html }) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: from },
      subject,
      content: [
        { type: 'text/plain', value: text },
        { type: 'text/html', value: html }
      ]
    });

    const options = {
      hostname: 'api.sendgrid.com',
      port: 443,
      path: '/v3/mail/send',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', d => { body += d; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true });
        } else {
          reject(new Error(`SendGrid returned HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', e => reject(e));
    req.write(postData);
    req.end();
  });
}

/**
 * Brevo (Sendinblue) HTTPS API Dispatcher
 */
function sendViaBrevo({ apiKey, from, to, subject, text, html }) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      sender: { email: from, name: 'Portfolio Notification' },
      to: [{ email: to }],
      subject,
      textContent: text,
      htmlContent: html
    });

    const options = {
      hostname: 'api.brevo.com',
      port: 443,
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', d => { body += d; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true });
        } else {
          reject(new Error(`Brevo returned HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', e => reject(e));
    req.write(postData);
    req.end();
  });
}

module.exports = {
  getEventMeta,
  sendInteractionNotification
};
