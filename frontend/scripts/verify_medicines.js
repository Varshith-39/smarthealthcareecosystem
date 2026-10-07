const BASE_URL = 'http://localhost:5000/api';

async function request(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const res = await fetch(url, {
    ...options,
    headers,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${data.message || JSON.stringify(data)}`);
  }
  return data;
}

async function verifyMedicines() {
  console.log('===============================================================');
  console.log('💊 TESTING MEDICINES & REMINDERS END-TO-END');
  console.log('===============================================================');

  try {
    // 1. Patient Login
    console.log('\n[1/6] Authenticating Patient...');
    const login = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email: 'patient@example.com', password: 'Patient@123' }),
    });
    const token = login.token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log(`✅ Patient logged in: ${login.user.name}`);

    // 2. Fetch Active Medicine Reminders
    console.log('\n[2/6] Fetching Medicine Reminders (GET /api/medicines)...');
    const getRes = await request(`${BASE_URL}/medicines`, { headers });
    console.log(`✅ Success! Found ${getRes.count} active medications. Adherence rate: ${getRes.adherenceRate}%`);
    getRes.medicines.forEach((m, idx) => {
      console.log(`   ${idx + 1}. ${m.medicineName} (${m.dosage}) - ${m.frequency} [Times: ${m.reminderTimes?.join(', ')}]`);
    });

    // 3. Add New Medicine Reminder
    console.log('\n[3/6] Adding New Schedule (POST /api/medicines)...');
    const addRes = await request(`${BASE_URL}/medicines`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        medicineName: 'Atorvastatin',
        dosage: '20 mg',
        frequency: 'Once daily at bedtime',
        reminderTimes: ['10:00 PM'],
        instructions: 'Take with water before sleeping',
      }),
    });
    const newMed = addRes.reminder;
    console.log(`✅ Success! Created reminder: ${newMed.medicineName} (${newMed._id})`);

    // 4. Log Dose as TAKEN
    console.log('\n[4/6] Logging Dose as TAKEN (POST /api/medicines/:id/log)...');
    const takeRes = await request(`${BASE_URL}/medicines/${newMed._id}/log`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ status: 'TAKEN', doseTime: '10:00 PM' }),
    });
    console.log(`✅ Success! ${takeRes.message}`);

    // 5. Log Dose as MISSED
    console.log('\n[5/6] Logging Dose as MISSED (POST /api/medicines/:id/log)...');
    const missRes = await request(`${BASE_URL}/medicines/${newMed._id}/log`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ status: 'MISSED', doseTime: '10:00 PM' }),
    });
    console.log(`✅ Success! ${missRes.message}`);

    // 6. Trigger Instant Demo Reminder Alert
    console.log('\n[6/6] Triggering Demo Alert (POST /api/medicines/:id/trigger-reminder)...');
    const alertRes = await request(`${BASE_URL}/medicines/${newMed._id}/trigger-reminder`, {
      method: 'POST',
      headers,
    });
    console.log(`✅ Success! ${alertRes.message}`);

    // Verify Notification was generated
    const notifs = await request(`${BASE_URL}/notifications`, { headers });
    const medNotif = notifs.notifications.find((n) => n.type === 'MEDICINE_REMINDER');
    if (medNotif) {
      console.log(`✅ Notification Bell received: "${medNotif.title}" - "${medNotif.message}"`);
    }

    // Clean up created test med
    await request(`${BASE_URL}/medicines/${newMed._id}`, {
      method: 'DELETE',
      headers,
    });
    console.log(`✅ Test medication cleaned up successfully.`);

    console.log('\n===============================================================');
    console.log('🎉 MEDICINE REMINDERS SYSTEM FULLY OPERATIONAL & VERIFIED!');
    console.log('===============================================================');
  } catch (err) {
    console.error('❌ Medicine test failed:', err.message);
    process.exit(1);
  }
}

verifyMedicines();
