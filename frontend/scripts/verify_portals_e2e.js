const BASE_URL = 'http://localhost:5000/api';

async function request(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const res = await fetch(url, { ...options, headers });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${data.message || JSON.stringify(data)}`);
  }
  return data;
}

async function verifyPortals() {
  console.log('===============================================================');
  console.log('🏥 TESTING PATIENT & DOCTOR PORTALS FULL END-TO-END');
  console.log('===============================================================');

  try {
    // ==========================================
    // 1. PATIENT PORTAL CHECKS
    // ==========================================
    console.log('\n--- 1. PATIENT PORTAL VERIFICATION ---');
    console.log('[Patient] Logging in with patient@example.com / Patient@123...');
    const patientLogin = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email: 'patient@example.com', password: 'Patient@123' }),
    });
    console.log(`✅ Patient Login: Success! Name: ${patientLogin.user.name}, Role: ${patientLogin.user.role}`);
    const patientHeaders = { Authorization: `Bearer ${patientLogin.token}` };

    console.log('[Patient] Fetching Dashboard Vitals & Telemetry (/api/health)...');
    const health = await request(`${BASE_URL}/health?timeRange=7days`, { headers: patientHeaders });
    console.log(`✅ Vitals Retrieved: ${health.readings?.length || 0} telemetry readings. Latest HR: ${health.latestReading?.heartRate} BPM, BP: ${health.latestReading?.bloodPressure?.systolic}/${health.latestReading?.bloodPressure?.diastolic}`);

    console.log('[Patient] Fetching AI Health Risk Assessment (/api/health/risk-assessment)...');
    const risk = await request(`${BASE_URL}/health/risk-assessment`, { headers: patientHeaders });
    console.log(`✅ AI Risk Assessment: Level: ${risk.assessment?.level}, Score: ${risk.assessment?.score}/100, Primary Factor: ${risk.assessment?.reasons?.[0] || 'Nominal'}`);

    console.log('[Patient] Fetching Medicine Reminders (/api/medicines)...');
    const meds = await request(`${BASE_URL}/medicines`, { headers: patientHeaders });
    console.log(`✅ Medicine Reminders: ${meds.count} active medications. Adherence Rate: ${meds.adherenceRate}%`);
    meds.medicines.forEach((m) => console.log(`   - ${m.medicineName} (${m.dosage}) at [${m.reminderTimes?.join(', ')}]`));

    console.log('[Patient] Logging Medicine Dose as TAKEN (/api/medicines/:id/log)...');
    if (meds.medicines?.length > 0) {
      const logRes = await request(`${BASE_URL}/medicines/${meds.medicines[0]._id}/log`, {
        method: 'POST',
        headers: patientHeaders,
        body: JSON.stringify({ status: 'TAKEN', doseTime: '09:00 AM' }),
      });
      console.log(`✅ Dose Action: ${logRes.message}`);
    }

    console.log('[Patient] Fetching Medical Records & Digital Prescriptions (/api/medical-records & /api/prescriptions)...');
    const [records, presc] = await Promise.all([
      request(`${BASE_URL}/medical-records`, { headers: patientHeaders }),
      request(`${BASE_URL}/prescriptions`, { headers: patientHeaders }),
    ]);
    console.log(`✅ Digital Health Records: ${records.count} medical files, ${presc.count} doctor prescriptions.`);

    console.log('[Patient] Fetching Scheduled Appointments (/api/appointments)...');
    const appts = await request(`${BASE_URL}/appointments`, { headers: patientHeaders });
    console.log(`✅ Appointments: ${appts.count} appointments scheduled.`);

    console.log('[Patient] Fetching Notification Bell Feed (/api/notifications)...');
    const patientNotifs = await request(`${BASE_URL}/notifications`, { headers: patientHeaders });
    console.log(`✅ Notification Bell: ${patientNotifs.count} total, ${patientNotifs.unreadCount} unread.`);

    // ==========================================
    // 2. DOCTOR PORTAL CHECKS
    // ==========================================
    console.log('\n--- 2. DOCTOR PORTAL VERIFICATION ---');
    console.log('[Doctor] Logging in with doctor@example.com / Doctor@123...');
    const doctorLogin = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email: 'doctor@example.com', password: 'Doctor@123' }),
    });
    console.log(`✅ Doctor Login: Success! Name: ${doctorLogin.user.name}, Role: ${doctorLogin.user.role}`);
    const doctorHeaders = { Authorization: `Bearer ${doctorLogin.token}` };

    console.log('[Doctor] Fetching Doctor Clinical Statistics (/api/doctors/stats)...');
    const docStats = await request(`${BASE_URL}/doctors/stats`, { headers: doctorHeaders });
    console.log(`✅ Doctor Clinical Stats:`);
    console.log(`   - Total Assigned Patients: ${docStats.stats?.totalPatients}`);
    console.log(`   - Pending Appointments: ${docStats.stats?.pendingAppointments}`);
    console.log(`   - High/Critical Risk Patients Monitored: ${docStats.stats?.highRiskPatients}`);

    console.log('[Doctor] Fetching Patient Directory & Clinical Dossiers (/api/patients)...');
    const patients = await request(`${BASE_URL}/patients`, { headers: doctorHeaders });
    console.log(`✅ Patient Dossiers: Found ${patients.count} patients.`);
    patients.patients?.slice(0, 3).forEach((p) => {
      console.log(`   - Patient: ${p.user?.name} | Blood Group: ${p.bloodGroup} | Risk: ${p.latestReading?.riskLevel || 'LOW'}`);
    });

    console.log('[Doctor] Fetching Doctor Consultation Schedule (/api/appointments)...');
    const docAppts = await request(`${BASE_URL}/appointments`, { headers: doctorHeaders });
    console.log(`✅ Doctor Schedule: ${docAppts.count} consultations found.`);

    console.log('[Doctor] Fetching Emergency Command Center Alerts (/api/emergency)...');
    const docEmerg = await request(`${BASE_URL}/emergency`, { headers: doctorHeaders });
    console.log(`✅ Emergency Center: ${docEmerg.count} emergency events on log.`);

    console.log('[Doctor] Fetching Doctor Notifications (/api/notifications)...');
    const docNotifs = await request(`${BASE_URL}/notifications`, { headers: doctorHeaders });
    console.log(`✅ Doctor Notifications: ${docNotifs.count} total, ${docNotifs.unreadCount} unread.`);

    console.log('\n===============================================================');
    console.log('🎉 BOTH PATIENT AND DOCTOR PORTALS ARE 100% OPERATIONAL & VERIFIED!');
    console.log('===============================================================');
  } catch (err) {
    console.error('❌ Portal verification failed:', err.message);
    process.exit(1);
  }
}

verifyPortals();
