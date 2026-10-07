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

async function runTest() {
  console.log('=====================================================');
  console.log('🧪 TESTING NOTIFICATION SYSTEM EXACT WORKFLOW');
  console.log('=====================================================');

  try {
    // 1. Patient Login
    console.log('\n[1/7] PATIENT: Logging in...');
    const patientLoginRes = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'patient@example.com',
        password: 'Patient@123',
      }),
    });
    const patientToken = patientLoginRes.token;
    const patientUser = patientLoginRes.user;
    console.log(`✅ Patient logged in: ${patientUser.name} (${patientUser._id})`);

    const patientHeaders = { Authorization: `Bearer ${patientToken}` };

    // Find Doctor
    const doctorsRes = await request(`${BASE_URL}/doctors`);
    const doctor = doctorsRes.doctors[0];
    const doctorUserId = doctor.user._id;
    console.log(`   Selected Doctor: ${doctor.user.name} (${doctorUserId})`);

    // 2. Patient: Book Appointment
    console.log('\n[2/7] PATIENT: Booking appointment with doctor...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    const appointmentDate = tomorrow.toISOString().split('T')[0];

    const bookRes = await request(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: patientHeaders,
      body: JSON.stringify({
        doctorId: doctorUserId,
        date: appointmentDate,
        time: '02:30 PM',
        reason: 'Severe Chest Discomfort & Telemetry Verification',
        notes: 'Requested urgent review for erratic heart rate spikes.',
      }),
    });
    const appointment = bookRes.appointment;
    console.log(`✅ Appointment booked successfully! ID: ${appointment._id}`);

    // 3. DOCTOR: Login
    console.log('\n[3/7] DOCTOR: Logging in...');
    const doctorLoginRes = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'doctor@example.com',
        password: 'Doctor@123',
      }),
    });
    const doctorToken = doctorLoginRes.token;
    const doctorUser = doctorLoginRes.user;
    console.log(`✅ Doctor logged in: ${doctorUser.name} (${doctorUser._id})`);

    const doctorHeaders = { Authorization: `Bearer ${doctorToken}` };

    // 4. DOCTOR: Check received notification
    console.log('\n[4/7] DOCTOR: Fetching notifications...');
    const docNotifsRes = await request(`${BASE_URL}/notifications`, { headers: doctorHeaders });
    const doctorNotifs = docNotifsRes.notifications;
    const apptRequestNotif = doctorNotifs.find(
      (n) => n.type === 'APPOINTMENT_REQUEST' && n.metadata?.appointmentId === appointment._id
    );

    if (!apptRequestNotif) {
      throw new Error('Doctor did not receive APPOINTMENT_REQUEST notification');
    }
    console.log(`✅ Doctor received notification:`);
    console.log(`   Title: "${apptRequestNotif.title}"`);
    console.log(`   Message: "${apptRequestNotif.message}"`);

    // Doctor Accepts Appointment
    console.log('   DOCTOR: Accepting appointment...');
    const acceptRes = await request(`${BASE_URL}/appointments/${appointment._id}/status`, {
      method: 'PUT',
      headers: doctorHeaders,
      body: JSON.stringify({
        status: 'CONFIRMED',
        doctorNotes: 'Confirmed. Telemetry data will be analyzed prior to session.',
      }),
    });
    console.log(`✅ Doctor confirmed appointment status: ${acceptRes.appointment.status}`);

    // 5. PATIENT: Receive appointment confirmation
    console.log('\n[5/7] PATIENT: Checking notifications for confirmation...');
    const patientNotifsRes = await request(`${BASE_URL}/notifications`, { headers: patientHeaders });
    const patientNotifs = patientNotifsRes.notifications;
    const confirmationNotif = patientNotifs.find(
      (n) => n.type === 'APPOINTMENT_CONFIRMED' && n.metadata?.appointmentId === appointment._id
    );

    if (!confirmationNotif) {
      throw new Error('Patient did not receive APPOINTMENT_CONFIRMED notification');
    }
    console.log(`✅ Patient received confirmation:`);
    console.log(`   Title: "${confirmationNotif.title}"`);
    console.log(`   Message: "${confirmationNotif.message}"`);

    // 6. PATIENT: Generate abnormal health reading
    console.log('\n[6/7] PATIENT: Generating abnormal health telemetry reading...');
    const abnormalRes = await request(`${BASE_URL}/health/simulate-iot`, {
      method: 'POST',
      headers: patientHeaders,
      body: JSON.stringify({ abnormal: true }),
    });
    const reading = abnormalRes.reading;
    const aiAnalysis = abnormalRes.aiAnalysis;
    console.log(`✅ Telemetry reading created!`);
    console.log(`   Vitals: HR: ${reading.heartRate} BPM | BP: ${reading.bloodPressure.systolic}/${reading.bloodPressure.diastolic} | SpO2: ${reading.spo2}%`);
    console.log(`   AI Risk Assessment: Level: ${aiAnalysis.level} | Score: ${aiAnalysis.score}/100 | Abnormal: ${aiAnalysis.isAbnormal}`);

    // 7. Verification of Bidirectional Warning Notifications
    console.log('\n[7/7] VERIFYING BIDIRECTIONAL ALERTS...');
    
    // Check Patient Warning
    const updatedPatientNotifs = await request(`${BASE_URL}/notifications`, { headers: patientHeaders });
    const patientWarning = updatedPatientNotifs.notifications.find(
      (n) => n.type === 'ABNORMAL_HEALTH_READING' && n.metadata?.readingId === reading._id
    );
    if (!patientWarning) {
      throw new Error('Patient did not receive ABNORMAL_HEALTH_READING notification');
    }
    console.log(`✅ PATIENT received warning:`);
    console.log(`   Title: "${patientWarning.title}"`);
    console.log(`   Message: "${patientWarning.message}"`);

    // Check Doctor Alert
    const updatedDocNotifs = await request(`${BASE_URL}/notifications`, { headers: doctorHeaders });
    const docTelemetryAlert = updatedDocNotifs.notifications.find(
      (n) => (n.type === 'HIGH_RISK_AI_PREDICTION' || n.type === 'ABNORMAL_HEALTH_READING') && n.metadata?.readingId === reading._id
    );
    if (!docTelemetryAlert) {
      throw new Error('Doctor did not receive HIGH_RISK_AI_PREDICTION telemetry notification');
    }
    console.log(`✅ DOCTOR received abnormal-health telemetry notification:`);
    console.log(`   Title: "${docTelemetryAlert.title}"`);
    console.log(`   Message: "${docTelemetryAlert.message}"`);

    // Test API: Mark single notification as read
    console.log('\nTesting Notification API endpoints:');
    const markRes = await request(`${BASE_URL}/notifications/${patientWarning._id}/read`, {
      method: 'PUT',
      headers: patientHeaders,
    });
    console.log(`✅ PUT /api/notifications/:id/read -> isRead: ${markRes.notification.isRead}`);

    // Test API: Mark all notifications as read
    const markAllRes = await request(`${BASE_URL}/notifications/read-all`, {
      method: 'PUT',
      headers: patientHeaders,
    });
    console.log(`✅ PUT /api/notifications/read-all -> ${markAllRes.message}`);

    const verifyAllRead = await request(`${BASE_URL}/notifications`, { headers: patientHeaders });
    console.log(`✅ Unread count after mark-all-read: ${verifyAllRead.unreadCount}`);

    console.log('\n=====================================================');
    console.log('🎉 ALL NOTIFICATION WORKFLOW CHECKS PASSED 100%');
    console.log('=====================================================');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTest();
