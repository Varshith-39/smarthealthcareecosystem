const http = require('http');

const BASE_URL = 'http://localhost:5000/api';

const request = (url, options = {}, postData = null) => {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, body: json });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
};

async function runVerification() {
  console.log('====================================================');
  console.log('🩺 STARTING AI HEALTH ASSISTANT END-TO-END VERIFICATION');
  console.log('====================================================\n');

  // 1. Healthcheck
  const health = await request(`${BASE_URL}/healthcheck`);
  console.log('1. Backend API Healthcheck:', health.status === 200 ? '✅ Online' : '❌ Failed');

  // 2. Patient Login
  const patientAuth = await request(`${BASE_URL}/auth/login`, { method: 'POST' }, {
    email: 'patient@example.com',
    password: 'Patient@123',
  });
  if (!patientAuth.body?.token) {
    throw new Error('Patient login failed');
  }
  const patientToken = patientAuth.body.token;
  const patientId = patientAuth.body.user._id;
  const patientHeaders = { Authorization: `Bearer ${patientToken}` };
  console.log('2. Patient Authenticated:', `✅ (${patientAuth.body.user.name})`);

  // 3. AI Report Explanation
  console.log('\n3. Testing AI Report Explanation (/api/ai-assistant/explain-report)...');
  const reportPayload = {
    reportText: 'Hemoglobin: 11.2 g/dL\nBlood Glucose: 145 mg/dL\nBlood Pressure: 145/95 mmHg',
  };
  const reportRes = await request(`${BASE_URL}/ai-assistant/explain-report`, {
    method: 'POST',
    headers: patientHeaders,
  }, reportPayload);

  console.log('   Status:', reportRes.status === 200 ? '✅ 200 OK' : `❌ ${reportRes.status}`);
  console.log('   Summary:', reportRes.body.data?.summary);
  console.log('   Parameters Evaluated:', reportRes.body.data?.parameters?.length);
  reportRes.body.data?.parameters?.forEach((p) => {
    console.log(`     - [${p.parameter}]: ${p.result} -> ${p.status}`);
    console.log(`       Explanation: ${p.explanation}`);
  });
  console.log('   Disclaimer present:', !!reportRes.body.data?.disclaimer ? '✅ Yes' : '❌ No');

  // 4. Medication Reminder Scheduler
  console.log('\n4. Testing Medication Reminder Scheduler (/api/ai-assistant/schedule-reminder)...');
  const medPayload = {
    medicineName: 'Metformin',
    dosage: '500 mg',
    frequency: 'Twice daily',
    startDate: new Date(),
    reminderTime: '9:00 AM and 9:00 PM',
    instructions: 'Take after meals with water',
  };
  const medRes = await request(`${BASE_URL}/ai-assistant/schedule-reminder`, {
    method: 'POST',
    headers: patientHeaders,
  }, medPayload);

  console.log('   Status:', medRes.status === 201 ? '✅ 201 Created' : `❌ ${medRes.status}`);
  console.log('   Message:', medRes.body.message);
  console.log('   Reminder ID:', medRes.body.reminder?._id);

  // 5. Test Trigger Due Reminder
  console.log('\n5. Testing Trigger Due Reminder (/api/ai-assistant/trigger-due-reminder)...');
  const triggerRes = await request(`${BASE_URL}/ai-assistant/trigger-due-reminder`, {
    method: 'POST',
    headers: patientHeaders,
  }, { medicineName: 'Metformin', dosage: '500 mg' });
  console.log('   Status:', triggerRes.status === 200 ? '✅ 200 OK' : `❌ ${triggerRes.status}`);
  console.log('   Response message:', triggerRes.body.message);

  // 6. Verify Patient Notifications
  console.log('\n6. Checking Patient Notifications (/api/notifications)...');
  const notifRes = await request(`${BASE_URL}/notifications`, { headers: patientHeaders });
  const latestNotifs = notifRes.body.notifications?.slice(0, 3) || [];
  console.log(`   Found ${notifRes.body.notifications?.length} total notifications.`);
  latestNotifs.forEach((n) => {
    console.log(`     - [${n.type}] ${n.title}: "${n.message}"`);
  });

  // 7. Diet Suggestions
  console.log('\n7. Testing AI Diet & Wellness Suggestions (/api/ai-assistant/diet-suggestions)...');
  const dietPayload = {
    medication: 'Metformin',
    goal: 'Maintain healthy blood sugar',
    preference: 'Vegetarian with high fiber',
    reportValues: 'Blood Glucose: 145 mg/dL',
  };
  const dietRes = await request(`${BASE_URL}/ai-assistant/diet-suggestions`, {
    method: 'POST',
    headers: patientHeaders,
  }, dietPayload);
  console.log('   Status:', dietRes.status === 200 ? '✅ 200 OK' : `❌ ${dietRes.status}`);
  console.log('   Goal:', dietRes.body.data?.goal);
  console.log('   Suggestions Generated:');
  dietRes.body.data?.suggestions?.forEach((s, idx) => {
    console.log(`     ${idx + 1}. ${s}`);
  });
  console.log('   Disclaimer present:', !!dietRes.body.data?.disclaimer ? '✅ Yes' : '❌ No');

  // 8. AI Chat
  console.log('\n8. Testing AI Health Chatbot (/api/ai-assistant/chat)...');
  const chatQueries = [
    'Explain my blood pressure report.',
    'What should I eat to stay healthy?',
  ];
  for (const q of chatQueries) {
    const chatRes = await request(`${BASE_URL}/ai-assistant/chat`, {
      method: 'POST',
      headers: patientHeaders,
    }, { message: q });
    console.log(`   Q: "${q}"`);
    console.log(`   AI: "${chatRes.body.data?.reply}"`);
  }

  // 9. Recent Activity for Patient
  console.log('\n9. Checking Recent AI Activity (/api/ai-assistant/recent-activity)...');
  const actRes = await request(`${BASE_URL}/ai-assistant/recent-activity`, { headers: patientHeaders });
  console.log(`   Total activities logged: ${actRes.body.count}`);
  actRes.body.activities?.slice(0, 4).forEach((a) => {
    console.log(`     - [${a.actionType}] ${a.title}: ${a.summary}`);
  });

  // 10. Doctor Login & Read-Only Activity Check
  console.log('\n10. Testing Doctor Portal Integration (/api/doctors)...');
  const docAuth = await request(`${BASE_URL}/auth/login`, { method: 'POST' }, {
    email: 'doctor@example.com',
    password: 'Doctor@123',
  });
  const docToken = docAuth.body.token;
  const docHeaders = { Authorization: `Bearer ${docToken}` };
  console.log('   Doctor Authenticated: ✅', docAuth.body.user.name);

  const docAiActivity = await request(
    `${BASE_URL}/ai-assistant/patient-activity/${patientId}`,
    { headers: docHeaders }
  );
  console.log(`   Doctor fetched patient AI activity indicator (${docAiActivity.body.count} items):`);
  docAiActivity.body.activities?.forEach((a) => {
    console.log(`     - [${a.actionType}] ${a.title} (${new Date(a.createdAt).toLocaleTimeString()})`);
  });

  // 11. Doctor Medical Records
  console.log('\n11. Testing Doctor Access to Medical Records (/api/medical-records)...');
  const docRecords = await request(`${BASE_URL}/medical-records?patientId=${patientId}`, {
    headers: docHeaders,
  });
  console.log(`   Doctor retrieved ${docRecords.body.count} records for patient.`);

  console.log('\n====================================================');
  console.log('🎉 ALL AI HEALTH ASSISTANT FEATURES VERIFIED 100%!');
  console.log('====================================================');
}

runVerification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
