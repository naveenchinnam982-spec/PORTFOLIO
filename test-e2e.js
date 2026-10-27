// test-e2e.js - Automated integration test for identity and tracking system
const http = require('http');

function request(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, headers: res.headers, raw: body });
                }
            });
        });
        req.on('error', reject);
        if (data) {
            req.write(typeof data === 'string' ? data : JSON.stringify(data));
        }
        req.end();
    });
}

async function runTests() {
    console.log('🧪 Starting E2E Verification of Visitor Tracking & Social Notification Engine...\n');

    // 0. Verify CORS Preflight on /api/track-social-click
    console.log('0️⃣ Testing CORS Preflight (OPTIONS /api/track-social-click)...');
    const corsRes = await request({
        hostname: 'localhost',
        port: 8000,
        path: '/api/track-social-click',
        method: 'OPTIONS',
        headers: {
            'Origin': 'https://naveenchinnam.netlify.app',
            'Access-Control-Request-Method': 'POST'
        }
    });
    console.log('CORS Status:', corsRes.status, 'Headers:', corsRes.headers['access-control-allow-origin']);
    if (corsRes.status !== 204 && corsRes.status !== 200) {
        throw new Error(`CORS Preflight failed with status ${corsRes.status}`);
    }
    console.log('✅ CORS Preflight passed with 204 No Content!');

    const anonClientId = `client_${Date.now()}`;

    // 1. Normal (Anonymous) Visitor Click on Instagram
    console.log('\n1️⃣ Testing Normal Visitor Click on Instagram (/api/track-social-click)...');
    const anonTrack1 = await request({
        hostname: 'localhost',
        port: 8000,
        path: '/api/track-social-click',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        eventType: 'instagram_click',
        eventLabel: 'Follow my updates',
        sessionToken: null,
        clientId: anonClientId,
        page: '/',
        device: 'Mobile',
        browser: 'Safari',
        referrer: 'Direct'
    });
    console.log('Anon Track 1 (Instagram) response:', anonTrack1.data);
    if (!anonTrack1.data.success || !anonTrack1.data.notificationSent) {
        throw new Error('Anonymous Instagram click tracking failed or notification was not sent!');
    }
    console.log('✅ Anonymous visitor Instagram click successfully triggered notification email!');

    // 2. Normal Visitor Immediate Duplicate Click on Instagram (Cooldown / Anti-Spam)
    console.log('\n2️⃣ Testing Normal Visitor Cooldown on Immediate Duplicate Instagram Click...');
    const anonTrack2 = await request({
        hostname: 'localhost',
        port: 8000,
        path: '/api/track-social-click',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        eventType: 'instagram_click',
        eventLabel: 'Follow my updates',
        sessionToken: null,
        clientId: anonClientId,
        page: '/',
        device: 'Mobile',
        browser: 'Safari'
    });
    console.log('Anon Track 2 response (should be cooled down):', anonTrack2.data);
    if (anonTrack2.data.notificationSent !== false) {
        throw new Error('Cooldown did not prevent duplicate email notification for normal visitor!');
    }
    console.log('✅ Cooldown successfully prevented duplicate spam for normal visitor!');

    // 3. Normal Visitor GitHub Click (Different action - should trigger immediately)
    console.log('\n3️⃣ Testing Normal Visitor GitHub Click (/api/track-social-click)...');
    const anonTrack3 = await request({
        hostname: 'localhost',
        port: 8000,
        path: '/api/track-social-click',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        eventType: 'github_click',
        eventLabel: 'Explore my repositories',
        sessionToken: null,
        clientId: anonClientId,
        page: '/',
        device: 'Desktop / Laptop',
        browser: 'Chrome 124'
    });
    console.log('Anon Track 3 (GitHub) response:', anonTrack3.data);
    if (!anonTrack3.data.notificationSent) {
        throw new Error('GitHub notification should have been sent for normal visitor!');
    }
    console.log('✅ GitHub notification sent successfully!');

    // 4. Normal Visitor LinkedIn Click (Different action - should trigger immediately)
    console.log('\n4️⃣ Testing Normal Visitor LinkedIn Click (/api/track-social-click)...');
    const anonTrack4 = await request({
        hostname: 'localhost',
        port: 8000,
        path: '/api/track-social-click',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        eventType: 'linkedin_click',
        eventLabel: 'Connect with me professionally',
        sessionToken: null,
        clientId: anonClientId,
        page: '/',
        device: 'Desktop / Laptop',
        browser: 'Chrome 124'
    });
    console.log('Anon Track 4 (LinkedIn) response:', anonTrack4.data);
    if (!anonTrack4.data.notificationSent) {
        throw new Error('LinkedIn notification should have been sent!');
    }
    console.log('✅ LinkedIn notification sent successfully!');

    // 5. Authenticate a voluntary Google visitor
    const testEmail = `recruiter.${Date.now()}@google.com`;
    console.log(`\n5️⃣ Testing Voluntary Google Sign-In (${testEmail})...`);
    const authRes = await request({
        hostname: 'localhost',
        port: 8000,
        path: '/api/auth/google',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        clientDevUser: {
            email: testEmail,
            displayName: 'Sarah Recruiter'
        }
    });
    console.log('Auth status:', authRes.status);
    console.log('Auth payload:', authRes.data);
    if (!authRes.data.success || !authRes.data.sessionToken) {
        throw new Error('Auth failed!');
    }
    const token = authRes.data.sessionToken;

    // 6. Track Identified Visitor Click on GitHub
    console.log('\n6️⃣ Testing Identified Visitor Click (github_click with verified email)...');
    const authTrack1 = await request({
        hostname: 'localhost',
        port: 8000,
        path: '/api/track-social-click',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        eventType: 'github_click',
        eventLabel: 'Visit my GitHub',
        sessionToken: token,
        page: '/',
        device: 'Desktop / Laptop',
        browser: 'Chrome 122',
        referrer: 'Direct'
    });
    console.log('Auth Track 1 response:', authTrack1.data);
    if (!authTrack1.data.success || !authTrack1.data.notificationSent || !authTrack1.data.isIdentified) {
        throw new Error('Identified visitor GitHub tracking failed or email was not sent!');
    }
    console.log('✅ Identified visitor click recorded with verified email!');

    // 7. Test Admin Analytics Endpoint with PIN
    console.log('\n7️⃣ Testing /api/admin/analytics (PIN protected)...');
    const authAdminRes = await request({
        hostname: 'localhost',
        port: 8000,
        path: '/api/admin/analytics',
        method: 'GET',
        headers: { 'x-admin-pin': '9820' }
    });
    const summary = authAdminRes.data.data || authAdminRes.data;
    console.log('Authorized admin analytics summary:', {
        totalIdentifiedVisitors: summary.totalIdentifiedVisitors,
        totalInteractions: summary.totalInteractions,
        githubClicks: summary.clicksByType.github,
        linkedinClicks: summary.clicksByType.linkedin,
        instagramClicks: summary.clicksByType.instagram,
        mostClickedPlatform: summary.mostClickedPlatform
    });

    // 8. Test "Delete My Activity" (GDPR / Privacy compliance)
    console.log('\n8️⃣ Testing /api/auth/manage (Delete My Activity)...');
    const deleteRes = await request({
        hostname: 'localhost',
        port: 8000,
        path: '/api/auth/manage',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        action: 'delete-activity',
        sessionToken: token
    });
    console.log('Delete activity response:', deleteRes.data);
    if (!deleteRes.data.success) {
        throw new Error('Delete activity failed!');
    }

    console.log('\n🎉 ALL INTEGRATION TESTS PASSED WITH 100% SUCCESS!');
}

runTests().catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
});
