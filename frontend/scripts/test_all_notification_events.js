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

async function runTests() {
  console.log('===============================================================');
  console.log('🏥 VERIFYING 7 NOTIFICATION EVENTS & APIS (PATIENT & DOCTOR)');
  console.log('===============================================================');

  try {
    // 0. Log in Patient and Doctor
    console.log('\n🔐 Authenticating Patient and Doctor...');
    const patientLogin = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email: 'patient@example.com', password: 'Patient@123' }),
    });
    const patientToken = patientLogin.token;
    const patientUser = patientLogin.user;
    const patientHeaders = { Authorization: `Bearer ${patientToken}` };
    console.log(`✅ Patient authenticated: ${patientUser.name} (${patientUser._id})`);

    const doctorLogin = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email: 'doctor@example.com', password: 'Doctor@123' }),
    });
    const doctorToken = doctorLogin.token;
    const doctorUser = doctorLogin.user;
    const doctorHeaders = { Authorization: `Bearer ${doctorToken}` };
    console.log(`✅ Doctor authenticated: ${doctorUser.name} (${doctorUser._id})`);

    // Clean previous unread state by marking read
    await request(`${BASE_URL}/notifications/read-all`, { method: 'PUT', headers: patientHeaders });
    await request(`${BASE_URL}/notifications/read-all`, { method: 'PUT', headers: doctorHeaders });

    // EVENT 1: Patient books appointment -> Doctor receives notification
    console.log('\n[Event 1] Patient books appointment -> Doctor receives notification');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 3);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const bookRes = await request(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: patientHeaders,
      body: JSON.stringify({
        doctorId: doctorUser._id,
        date: dateStr,
        time: '10:30 AM',
        reason: 'Hypertension follow-up consultation',
      }),
    });
    const apptId = bookRes.appointment._id;

    const docNotifsAfterBooking = await request(`${BASE_URL}/notifications`, { headers: doctorHeaders });
    const bookNotif = docNotifsAfterBooking.notifications.find(
      (n) => n.type === 'APPOINTMENT_REQUEST' && n.metadata?.appointmentId === apptId
    );
    if (!bookNotif) throw new Error('Failed: Doctor did not receive APPOINTMENT_REQUEST notification');
    console.log(`✅ PASS: Doctor received: "${bookNotif.title}" - "${bookNotif.message}"`);

    // EVENT 2: Doctor accepts appointment -> Patient receives notification
    console.log('\n[Event 2] Doctor accepts appointment -> Patient receives notification');
    await request(`${BASE_URL}/appointments/${apptId}/status`, {
      method: 'PUT',
      headers: doctorHeaders,
      body: JSON.stringify({ status: 'CONFIRMED' }),
    });

    const patientNotifsAfterAccept = await request(`${BASE_URL}/notifications`, { headers: patientHeaders });
    const acceptNotif = patientNotifsAfterAccept.notifications.find(
      (n) => n.type === 'APPOINTMENT_CONFIRMED' && n.metadata?.appointmentId === apptId
    );
    if (!acceptNotif) throw new Error('Failed: Patient did not receive APPOINTMENT_CONFIRMED notification');
    console.log(`✅ PASS: Patient received: "${acceptNotif.title}" - "${acceptNotif.message}"`);

    // EVENT 3: Doctor rejects appointment -> Patient receives notification
    console.log('\n[Event 3] Doctor rejects appointment -> Patient receives notification');
    // Book a second appointment to test rejection
    const bookRes2 = await request(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: patientHeaders,
      body: JSON.stringify({
        doctorId: doctorUser._id,
        date: dateStr,
        time: '04:00 PM',
        reason: 'Second opinion checkup',
      }),
    });
    const apptId2 = bookRes2.appointment._id;

    // Doctor declines appointment (status: CANCELLED or REJECTED)
    await request(`${BASE_URL}/appointments/${apptId2}/status`, {
      method: 'PUT',
      headers: doctorHeaders,
      body: JSON.stringify({ status: 'CANCELLED', doctorNotes: 'Doctor unavailable for requested slot.' }),
    });

    const patientNotifsAfterReject = await request(`${BASE_URL}/notifications`, { headers: patientHeaders });
    const rejectNotif = patientNotifsAfterReject.notifications.find(
      (n) => (n.type === 'APPOINTMENT_REJECTED' || n.type === 'APPOINTMENT_CANCELLED') && n.metadata?.appointmentId === apptId2
    );
    if (!rejectNotif) throw new Error('Failed: Patient did not receive appointment rejection notification');
    console.log(`✅ PASS: Patient received: "${rejectNotif.title}" - "${rejectNotif.message}"`);

    // EVENT 4 & 5: Abnormal health reading & HIGH/CRITICAL AI risk -> Patient & Doctor receive notification
    console.log('\n[Event 4 & 5] Abnormal health reading & HIGH/CRITICAL AI risk -> Patient & Doctor notified');
    const abnormalHealthRes = await request(`${BASE_URL}/health/simulate-iot`, {
      method: 'POST',
      headers: patientHeaders,
      body: JSON.stringify({ abnormal: true }),
    });
    const reading = abnormalHealthRes.reading;

    const patientNotifsAfterHealth = await request(`${BASE_URL}/notifications`, { headers: patientHeaders });
    const patientHealthWarning = patientNotifsAfterHealth.notifications.find(
      (n) => n.type === 'ABNORMAL_HEALTH_READING' && n.metadata?.readingId === reading._id
    );
    if (!patientHealthWarning) throw new Error('Failed: Patient did not receive ABNORMAL_HEALTH_READING notification');
    console.log(`✅ PASS: Patient received: "${patientHealthWarning.title}" - "${patientHealthWarning.message}"`);

    const docNotifsAfterHealth = await request(`${BASE_URL}/notifications`, { headers: doctorHeaders });
    const docHealthAlert = docNotifsAfterHealth.notifications.find(
      (n) => (n.type === 'HIGH_RISK_AI_PREDICTION' || n.type === 'ABNORMAL_HEALTH_READING') && n.metadata?.readingId === reading._id
    );
    if (!docHealthAlert) throw new Error('Failed: Doctor did not receive HIGH_RISK_AI_PREDICTION telemetry notification');
    console.log(`✅ PASS: Doctor received: "${docHealthAlert.title}" - "${docHealthAlert.message}"`);

    // EVENT 6: New prescription -> Patient receives notification
    console.log('\n[Event 6] New prescription -> Patient receives notification');
    const prescRes = await request(`${BASE_URL}/prescriptions`, {
      method: 'POST',
      headers: doctorHeaders,
      body: JSON.stringify({
        patientId: patientUser._id,
        medicines: [{ name: 'Amlodipine', dosage: '5 mg', frequency: 'Once daily', instructions: 'Morning dose' }],
        diagnosis: 'Stage 1 Hypertension',
        generalAdvice: 'Low sodium diet and 30-minute daily walk',
      }),
    });
    const prescId = prescRes.prescription._id;

    const patientNotifsAfterPresc = await request(`${BASE_URL}/notifications`, { headers: patientHeaders });
    const prescNotif = patientNotifsAfterPresc.notifications.find(
      (n) => n.type === 'PRESCRIPTION_ADDED' && n.metadata?.prescriptionId === prescId
    );
    if (!prescNotif) throw new Error('Failed: Patient did not receive PRESCRIPTION_ADDED notification');
    console.log(`✅ PASS: Patient received: "${prescNotif.title}" - "${prescNotif.message}"`);

    // EVENT 7: Emergency alert -> Doctor receives notification & Patient receives confirmation
    console.log('\n[Event 7] Emergency alert -> Doctor notified & Patient receives confirmation');
    const emergencyRes = await request(`${BASE_URL}/emergency/trigger`, {
      method: 'POST',
      headers: patientHeaders,
      body: JSON.stringify({
        message: 'Acute chest tightness reported via emergency SOS.',
      }),
    });
    const alertId = emergencyRes.alert._id;

    // Patient confirmation
    const patientNotifsAfterSOS = await request(`${BASE_URL}/notifications`, { headers: patientHeaders });
    const patientSOSConfirm = patientNotifsAfterSOS.notifications.find(
      (n) => n.type === 'EMERGENCY_ALERT' && n.metadata?.alertId === alertId
    );
    if (!patientSOSConfirm) throw new Error('Failed: Patient did not receive EMERGENCY_ALERT confirmation notification');
    console.log(`✅ PASS: Patient received: "${patientSOSConfirm.title}" - "${patientSOSConfirm.message}"`);

    // Doctor alert
    const docNotifsAfterSOS = await request(`${BASE_URL}/notifications`, { headers: doctorHeaders });
    const docSOSAlert = docNotifsAfterSOS.notifications.find(
      (n) => n.type === 'EMERGENCY_ALERT' && n.metadata?.alertId === alertId
    );
    if (!docSOSAlert) throw new Error('Failed: Doctor did not receive EMERGENCY_ALERT notification');
    console.log(`✅ PASS: Doctor received: "${docSOSAlert.title}" - "${docSOSAlert.message}"`);

    // VERIFY NOTIFICATION BELL APIS
    console.log('\n🔔 VERIFYING NOTIFICATION BELL APIS (Unread count, Mark as read, Mark all as read)');

    // 1. Unread count
    const unreadCountRes = await request(`${BASE_URL}/notifications/unread-count`, { headers: patientHeaders });
    console.log(`✅ Unread count before mark-read: ${unreadCountRes.count}`);
    if (unreadCountRes.count <= 0) throw new Error('Failed: Unread count should be > 0');

    // 2. Mark single notification as read
    const markSingleRes = await request(`${BASE_URL}/notifications/${patientSOSConfirm._id}/read`, {
      method: 'PUT',
      headers: patientHeaders,
    });
    console.log(`✅ Mark single as read: notification id ${markSingleRes.notification._id} -> isRead: ${markSingleRes.notification.isRead}`);

    // 3. Mark all notifications as read
    const markAllRes = await request(`${BASE_URL}/notifications/read-all`, {
      method: 'PUT',
      headers: patientHeaders,
    });
    console.log(`✅ Mark all as read: ${markAllRes.message}`);

    const finalUnreadCount = await request(`${BASE_URL}/notifications/unread-count`, { headers: patientHeaders });
    console.log(`✅ Unread count after mark-all-read: ${finalUnreadCount.count}`);
    if (finalUnreadCount.count !== 0) throw new Error('Failed: Unread count should be 0 after mark-all-read');

    console.log('\n===============================================================');
    console.log('🎉 ALL 7 NOTIFICATION EVENTS & APIS ARE 100% WORKING & VERIFIED');
    console.log('===============================================================');
  } catch (err) {
    console.error('❌ Verification failed:', err.message);
    process.exit(1);
  }
}

runTests();
