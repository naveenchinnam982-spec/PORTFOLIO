===================================================================
Naveen Chinnam - Executive Developer Portfolio & AI Systems Engineer
Visitor Identification & Social-Link Notification Engine
===================================================================

This repository contains the complete portfolio for Naveen Chinnam, featuring:
1. Cinematic Opening Bird-Flight Animation
2. High-Impact Executive Hero section with authentic portrait photography
3. Voluntary Google Sign-In & Visitor Identification System
4. High-Performance Non-Blocking Interaction Tracking for Social Links
5. Email Alert Dispatcher sending notifications to naveenchinnam982@gmail.com
6. 15-Minute Deduplication Cooldown per visitor per action
7. Privacy Compliance & "Delete My Activity" Self-Service
8. Private Server-Side PIN-Protected Admin Analytics Dashboard (PIN: 9820)
9. Dual-Runtime Compatibility (Netlify Functions & Node.js server.js)

-------------------------------------------------------------------
1. LOCAL DEVELOPMENT & TESTING
-------------------------------------------------------------------
Requirements: Node.js (v18+)

To start the local server:
  npm start
  # or: node server.js

The server starts at:
  http://localhost:8000

To run the automated end-to-end integration test suite:
  node test-e2e.js

-------------------------------------------------------------------
2. ENVIRONMENT VARIABLES CONFIGURATION (.env)
-------------------------------------------------------------------
Copy `.env.example` to `.env`:

  # Google OAuth 2.0 Client ID (Web Application)
  GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
  GOOGLE_CLIENT_SECRET=your_google_client_secret

  # Recipient Email for visitor notifications & contact form messages
  NOTIFICATION_EMAIL=naveenchinnam982@gmail.com

  # Email Delivery API Key (Resend - Free tier at resend.com)
  RESEND_API_KEY=re_your_api_key_here

  # Verified Sender Address
  FROM_EMAIL=Portfolio Alert <onboarding@resend.dev>

  # Session Secret for tokens
  SESSION_SECRET=nc_secret_entropy_key_change_in_production

  # Admin Dashboard Access PIN (default: 9820)
  ADMIN_PIN=9820

  # Port for local dev server (default 8000)
  PORT=8000

Note: In local development, if RESEND_API_KEY is not yet set, the server
gracefully logs all visitor activity notifications directly to the terminal!

-------------------------------------------------------------------
3. GOOGLE OAUTH CONFIGURATION STEPS
-------------------------------------------------------------------
To enable real Google Sign-In with your own Google Cloud project:
1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Create a project named "Naveen Chinnam Portfolio" (or select an existing one).
3. Navigate to "APIs & Services" -> "OAuth consent screen":
   - User Type: External
   - App Name: Naveen Chinnam Portfolio
   - User support email: naveenchinnam982@gmail.com
   - Scopes: openid, email, profile
4. Navigate to "Credentials" -> "Create Credentials" -> "OAuth client ID":
   - Application type: Web application
   - Name: Portfolio Web Client
   - Authorized JavaScript origins:
       http://localhost:8000
       https://<your-netlify-site-name>.netlify.app
       https://<your-custom-domain> (if applicable)
   - Authorized redirect URIs:
       http://localhost:8000
       https://<your-netlify-site-name>.netlify.app
5. Copy your "Client ID" and set it in:
   - Your `.env` as `GOOGLE_CLIENT_ID`
   - In `js/auth-identity.js` (line 15) or via window.GOOGLE_CLIENT_ID

-------------------------------------------------------------------
4. EMAIL PROVIDER CONFIGURATION (RESEND)
-------------------------------------------------------------------
1. Sign up for free at https://resend.com
2. Go to "API Keys" -> "Create API Key" (Full Access)
3. Copy the key (starts with `re_...`)
4. Set `RESEND_API_KEY` in `.env` (and Netlify Environment Variables).
5. For initial testing, set `FROM_EMAIL=Portfolio Alert <onboarding@resend.dev>`.
   When you connect your custom domain to Resend, set `FROM_EMAIL=Portfolio Alert <hello@yourdomain.com>`.

-------------------------------------------------------------------
5. NETLIFY DEPLOYMENT STEPS
-------------------------------------------------------------------
1. Push this project to GitHub.
2. In Netlify (https://app.netlify.com): "Add new site" -> "Import from Git".
3. Build Settings:
   - Base directory: (leave empty)
   - Build command: (leave empty or `npm test` if desired)
   - Publish directory: .
   - Functions directory: netlify/functions
4. Go to Site settings -> Environment variables -> Add variables:
   - `NOTIFICATION_EMAIL` = naveenchinnam982@gmail.com
   - `RESEND_API_KEY` = your_resend_api_key
   - `FROM_EMAIL` = Portfolio Alert <onboarding@resend.dev>
   - `ADMIN_PIN` = 9820 (or your custom secret PIN)
   - `GOOGLE_CLIENT_ID` = your_client_id.apps.googleusercontent.com
5. Deploy Site. Netlify deploys all static assets and serverless functions:
   - `/.netlify/functions/auth-google`
   - `/.netlify/functions/track-interaction`
   - `/.netlify/functions/auth-manage`
   - `/.netlify/functions/admin-analytics`
   - `/.netlify/functions/track-visitor`
   - `/.netlify/functions/contact`

-------------------------------------------------------------------
6. HOW TO TEST THE COMPLETE VISITOR FLOW
-------------------------------------------------------------------
A. Testing as an Anonymous Visitor:
   1. Open http://localhost:8000
   2. Watch the opening bird-flight intro (or skip with the Skip button).
   3. Explore projects, skills, journey, and resume.
   4. Click GitHub or LinkedIn - the external site opens immediately.
   5. No email notification is sent because the visitor is anonymous.

B. Testing as an Identified Visitor (Developer Mode / No Google ID required):
   1. In the top-right header, click "Connect with Naveen".
   2. Click "Developer Test Sign-In (Simulate Google User)".
   3. Enter any test email (e.g. `lead.recruiter@google.com`) and click "Connect Test Account".
   4. The header pill instantly updates to "Connected as lead.recruiter...".
   5. Click on GitHub ("Explore my projects").
      - GitHub opens immediately without delay via `navigator.sendBeacon`.
      - Check your terminal: you will see:
        `[NOTIFIER DEV LOG] Subject: 🔔 Portfolio Activity — GitHub Click`
        `Body: A visitor interacted with your portfolio. Visitor: lead.recruiter@google.com...`
   6. Click GitHub again immediately:
      - Cooldown deduplication activates: `[COOLDOWN APPLIED] Suppressed duplicate notification`.
   7. Click LinkedIn ("Connect professionally"):
      - LinkedIn opens immediately.
      - A new notification is dispatched: `🔔 Portfolio Activity — LinkedIn Click`.
   8. Click Resume ("Download Resume"):
      - Resume opens.
      - Notification dispatched: `📄 Portfolio Activity — Resume Click`.

C. Testing the Private Admin Analytics Dashboard:
   1. Click "🔒 Admin Analytics" in the footer, or press `Ctrl + Shift + A`.
   2. Enter PIN: `9820`.
   3. Review live statistics:
      - Total Identified Visitors
      - GitHub, LinkedIn, Instagram, and Resume click counts
      - Recent Activity log showing visitor email, action, device, and timestamp.

D. Testing Privacy / "Delete My Activity":
   1. Click on the "Connected" pill in the header.
   2. Click "Delete My Activity" (or "Disconnect").
   3. Confirm the dialog: all visitor records and activity are wiped immediately from the database.
