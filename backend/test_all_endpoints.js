// backend/test_all_endpoints.js
const assert = require('assert');

const BASE_URL = 'http://127.0.0.1:5000';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

async function runNodeTests() {
  console.log('='.repeat(60));
  console.log('RUNNING END-TO-END NODE.JS BACKEND TESTS');
  console.log('='.repeat(60));

  // 1. Healthcheck
  console.log('\n[TEST 1] Server Healthcheck:');
  const healthRes = await request('/api/healthcheck');
  console.log('  Status:', healthRes.status, healthRes.data);
  assert.strictEqual(healthRes.status, 200);
  assert.strictEqual(healthRes.data?.status, 'online');

  // 2. Patient Auth Login
  console.log('\n[TEST 2] Patient Login (patient@example.com):');
  const patientLogin = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'patient@example.com', password: 'Patient@123' }),
  });
  console.log('  Status:', patientLogin.status);
  assert.strictEqual(patientLogin.status, 200);
  assert.ok(patientLogin.data?.token, 'Token should be returned');
  const patientToken = patientLogin.data.token;
  console.log('  Patient Name:', patientLogin.data.user?.name);
  console.log('  Patient Role:', patientLogin.data.user?.role);

  // 3. Doctor Auth Login
  console.log('\n[TEST 3] Doctor Login (doctor@example.com):');
  const doctorLogin = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'doctor@example.com', password: 'Doctor@123' }),
  });
  console.log('  Status:', doctorLogin.status);
  assert.strictEqual(doctorLogin.status, 200);
  assert.ok(doctorLogin.data?.token, 'Token should be returned');
  const doctorToken = doctorLogin.data.token;
  console.log('  Doctor Name:', doctorLogin.data.user?.name);
  console.log('  Doctor Role:', doctorLogin.data.user?.role);

  // 4. Authenticated /api/auth/me
  console.log('\n[TEST 4] Authenticated Profile (/api/auth/me):');
  const meRes = await request('/api/auth/me', {
    headers: { Authorization: `Bearer ${patientToken}` },
  });
  console.log('  Status:', meRes.status);
  assert.strictEqual(meRes.status, 200);
  assert.strictEqual(meRes.data?.user?.email, 'patient@example.com');

  // 5. Doctors Directory
  console.log('\n[TEST 5] Doctor Directory Listing (/api/doctors):');
  const doctorsRes = await request('/api/doctors', {
    headers: { Authorization: `Bearer ${patientToken}` },
  });
  console.log('  Status:', doctorsRes.status);
  assert.strictEqual(doctorsRes.status, 200);
  const doctorsList = doctorsRes.data?.doctors || doctorsRes.data || [];
  console.log('  Found Doctors Count:', doctorsList.length);
  assert.ok(doctorsList.length > 0, 'Should find at least 1 doctor');

  // 6. AI Microservice Proxy Health (/api/ai/health)
  console.log('\n[TEST 6] AI Microservice Proxy Health (/api/ai/health):');
  const aiHealthRes = await request('/api/ai/health', {
    headers: { Authorization: `Bearer ${patientToken}` },
  });
  console.log('  Status:', aiHealthRes.status, aiHealthRes.data);
  assert.strictEqual(aiHealthRes.status, 200);
  assert.ok(aiHealthRes.data?.ai_microservice, 'AI microservice health should be present');

  // 7. AI Health Guidance Endpoint (/api/ai/health-guidance)
  console.log('\n[TEST 7] AI Health Guidance (/api/ai/health-guidance):');
  const guidanceRes = await request('/api/ai/health-guidance', {
    method: 'POST',
    headers: { Authorization: `Bearer ${patientToken}` },
    body: JSON.stringify({ condition: 'DIABETES' }),
  });
  console.log('  Status:', guidanceRes.status);
  assert.strictEqual(guidanceRes.status, 200);
  const guidanceData = guidanceRes.data?.data;
  const dietObj = guidanceData?.diet;
  const exerciseObj = guidanceData?.exercise || guidanceData?.exercises;
  assert.ok(dietObj, 'Diet guidance should be returned');
  assert.ok(exerciseObj, 'Exercise guidance should be returned');
  console.log('  Diet Recommended Count:', dietObj.recommendedFoods?.length);
  console.log('  Exercise Table Count:', exerciseObj.exercisesTable?.length);

  // 8. AI Chat Endpoint (/api/ai/chat)
  console.log('\n[TEST 8] AI Chat (/api/ai/chat):');
  const chatRes = await request('/api/ai/chat', {
    method: 'POST',
    headers: { Authorization: `Bearer ${patientToken}` },
    body: JSON.stringify({
      message: 'What foods help lower blood sugar?',
      language: 'English',
      simpleLanguage: true,
    }),
  });
  console.log('  Status:', chatRes.status);
  assert.strictEqual(chatRes.status, 200);
  const aiData = chatRes.data?.data || chatRes.data;
  assert.ok(aiData?.reply, 'AI should respond with a reply');
  console.log('  Model Used:', aiData.model_used || aiData.modelUsed);
  console.log('  AI Reply Snippet:', aiData.reply.slice(0, 150).replace(/\n/g, ' '), '...');

  console.log('\n' + '='.repeat(60));
  console.log('ALL NODE.JS BACKEND ENDPOINTS PASSED SUCCESSFULLY!');
  console.log('='.repeat(60));
}

runNodeTests().catch((err) => {
  console.error('\n❌ Test failed with error:', err);
  process.exit(1);
});
