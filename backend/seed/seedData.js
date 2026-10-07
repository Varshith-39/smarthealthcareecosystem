require('dotenv').config();
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (_) {}
const mongoose = require('mongoose');
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const DoctorProfile = require('../models/DoctorProfile');
const HealthReading = require('../models/HealthReading');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const Prescription = require('../models/Prescription');
const MedicineReminder = require('../models/MedicineReminder');
const EmergencyAlert = require('../models/EmergencyAlert');
const MedicalRecord = require('../models/MedicalRecord');
const Message = require('../models/Message');
const AIAssistanceActivity = require('../models/AIAssistanceActivity');
const { calculateRisk } = require('../services/aiRiskService');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_healthcare';
    console.log(`Connecting to MongoDB: ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('Connected! Purging previous data...');

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      PatientProfile.deleteMany({}),
      DoctorProfile.deleteMany({}),
      HealthReading.deleteMany({}),
      Appointment.deleteMany({}),
      Notification.deleteMany({}),
      Prescription.deleteMany({}),
      MedicineReminder.deleteMany({}),
      EmergencyAlert.deleteMany({}),
      MedicalRecord.deleteMany({}),
      Message.deleteMany({}),
      AIAssistanceActivity.deleteMany({}),
    ]);

    console.log('Previous data cleared. Seeding Users...');

    // 1. Create Admin
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@example.com',
      password: 'Admin@123',
      role: 'ADMIN',
      phone: '+91 9811002233',
    });

    // 2. Create 3 Doctors
    const doctorAarav = await User.create({
      name: 'Dr. Aarav Sharma',
      email: 'doctor@example.com',
      password: 'Doctor@123',
      role: 'DOCTOR',
      phone: '+91 9822334455',
    });

    const doctorPriya = await User.create({
      name: 'Dr. Priya Patel',
      email: 'doctor.priya@example.com',
      password: 'Doctor@123',
      role: 'DOCTOR',
      phone: '+91 9833445566',
    });

    const doctorVikram = await User.create({
      name: 'Dr. Vikram Malhotra',
      email: 'doctor.vikram@example.com',
      password: 'Doctor@123',
      role: 'DOCTOR',
      phone: '+91 9844556677',
    });

    // Doctor Profiles
    await DoctorProfile.create([
      {
        user: doctorAarav._id,
        specialization: 'Cardiologist',
        licenseNumber: 'MCI-CARDIO-8821',
        hospital: 'Metro Heart Institute & Research Centre',
        experienceYears: 12,
        consultationFee: 800,
        about: 'Senior Consultant Interventional Cardiologist specializing in preventive cardiology, hypertension, and wearable telemetry monitoring.',
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        availableHours: { start: '09:00 AM', end: '04:00 PM' },
        rating: 4.9,
      },
      {
        user: doctorPriya._id,
        specialization: 'Endocrinologist & Diabetologist',
        licenseNumber: 'MCI-ENDO-4912',
        hospital: 'City Care Multispecialty Hospital',
        experienceYears: 9,
        consultationFee: 650,
        about: 'Specialist in metabolic wellness, Type 1 and Type 2 diabetes management, and digital continuous glucose telemetry.',
        availableDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
        availableHours: { start: '10:00 AM', end: '05:00 PM' },
        rating: 4.8,
      },
      {
        user: doctorVikram._id,
        specialization: 'Pulmonologist & Critical Care',
        licenseNumber: 'MCI-PULMO-3310',
        hospital: 'Apex Super Specialty Medical Center',
        experienceYears: 15,
        consultationFee: 900,
        about: 'Chief of Pulmonary Medicine, focusing on COPD, asthma, sleep apnea, and remote SpO2 oxygenation surveillance.',
        availableDays: ['Tuesday', 'Thursday', 'Saturday'],
        availableHours: { start: '09:30 AM', end: '03:30 PM' },
        rating: 4.9,
      },
    ]);

    // 3. Create 5 Patients
    const patientRahul = await User.create({
      name: 'Rahul Verma',
      email: 'patient@example.com',
      password: 'Patient@123',
      role: 'PATIENT',
      phone: '+91 9876543210',
    });

    const patientAnanya = await User.create({
      name: 'Ananya Iyer',
      email: 'patient.ananya@example.com',
      password: 'Patient@123',
      role: 'PATIENT',
      phone: '+91 9876543211',
    });

    const patientRajesh = await User.create({
      name: 'Rajesh Kumar',
      email: 'patient.rajesh@example.com',
      password: 'Patient@123',
      role: 'PATIENT',
      phone: '+91 9876543212',
    });

    const patientSneha = await User.create({
      name: 'Sneha Reddy',
      email: 'patient.sneha@example.com',
      password: 'Patient@123',
      role: 'PATIENT',
      phone: '+91 9876543213',
    });

    const patientAmit = await User.create({
      name: 'Amit Joshi',
      email: 'patient.amit@example.com',
      password: 'Patient@123',
      role: 'PATIENT',
      phone: '+91 9876543214',
    });

    // Patient Profiles
    await PatientProfile.create([
      {
        user: patientRahul._id,
        dateOfBirth: new Date('1991-05-14'),
        gender: 'Male',
        bloodGroup: 'B+',
        address: 'Flat 402, Green Glen Heights, Sector 62, Noida, UP',
        emergencyContact: { name: 'Pooja Verma', phone: '+91 9876500001', relationship: 'Spouse' },
        medicalConditions: ['Hypertension', 'Occasional Tachycardia'],
        allergies: ['Penicillin', 'Sulfa drugs'],
        currentMedications: ['Amlodipine 5mg', 'Telmisartan 40mg'],
        previousDiagnoses: ['Stage 1 Essential Hypertension (2022)'],
        assignedDoctor: doctorAarav._id,
      },
      {
        user: patientAnanya._id,
        dateOfBirth: new Date('1996-09-22'),
        gender: 'Female',
        bloodGroup: 'O+',
        address: 'Villa 12, Palm Meadows, Whitefield, Bengaluru, KA',
        emergencyContact: { name: 'Karthik Iyer', phone: '+91 9876500002', relationship: 'Brother' },
        medicalConditions: ['Mild Bronchial Asthma'],
        allergies: ['Dust mites', 'Pollen'],
        currentMedications: ['Salbutamol Inhaler as needed'],
        previousDiagnoses: ['Allergic Asthma (2020)'],
        assignedDoctor: doctorVikram._id,
      },
      {
        user: patientRajesh._id,
        dateOfBirth: new Date('1966-11-04'),
        gender: 'Male',
        bloodGroup: 'A+',
        address: 'B-104, Surya Towers, Andheri West, Mumbai, MH',
        emergencyContact: { name: 'Sunita Kumar', phone: '+91 9876500003', relationship: 'Wife' },
        medicalConditions: ['Type 2 Diabetes', 'Hypertension'],
        allergies: ['None known'],
        currentMedications: ['Metformin 500mg', 'Glimepiride 1mg'],
        previousDiagnoses: ['Type 2 Diabetes Mellitus (2018)'],
        assignedDoctor: doctorPriya._id,
      },
      {
        user: patientSneha._id,
        dateOfBirth: new Date('1984-03-19'),
        gender: 'Female',
        bloodGroup: 'AB+',
        address: 'Plot 45, Jubilee Hills, Hyderabad, TS',
        emergencyContact: { name: 'Vikrant Reddy', phone: '+91 9876500004', relationship: 'Husband' },
        medicalConditions: ['Hypothyroidism'],
        allergies: ['Peanuts'],
        currentMedications: ['Levothyroxine 50mcg'],
        previousDiagnoses: ['Subclinical Hypothyroidism (2021)'],
        assignedDoctor: doctorPriya._id,
      },
      {
        user: patientAmit._id,
        dateOfBirth: new Date('1958-08-11'),
        gender: 'Male',
        bloodGroup: 'O-',
        address: 'C-72, Park Street, Kolkata, WB',
        emergencyContact: { name: 'Deepak Joshi', phone: '+91 9876500005', relationship: 'Son' },
        medicalConditions: ['Coronary Artery Disease', 'Hypertension', 'Dyslipidemia'],
        allergies: ['Aspirin'],
        currentMedications: ['Atorvastatin 20mg', 'Metoprolol 25mg'],
        previousDiagnoses: ['Mild Angina (2021)', 'Post-PTCA Follow-up'],
        assignedDoctor: doctorAarav._id,
      },
    ]);

    console.log('Seeding Health Telemetry Readings across dates...');

    // 4. Seed Health Readings with realistic variations and AI risk scoring
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    const sampleReadings = [
      // Rahul readings (recent days)
      { patientId: patientRahul._id, hr: 74, sys: 122, dia: 82, spo2: 98, temp: 36.7, gluc: 94, steps: 6200, daysAgo: 6 },
      { patientId: patientRahul._id, hr: 78, sys: 126, dia: 84, spo2: 97, temp: 36.8, gluc: 98, steps: 5400, daysAgo: 5 },
      { patientId: patientRahul._id, hr: 72, sys: 120, dia: 80, spo2: 99, temp: 36.6, gluc: 92, steps: 7100, daysAgo: 4 },
      { patientId: patientRahul._id, hr: 85, sys: 135, dia: 88, spo2: 96, temp: 36.9, gluc: 104, steps: 4800, daysAgo: 3 },
      { patientId: patientRahul._id, hr: 80, sys: 128, dia: 84, spo2: 98, temp: 36.7, gluc: 96, steps: 6500, daysAgo: 2 },
      { patientId: patientRahul._id, hr: 92, sys: 138, dia: 89, spo2: 97, temp: 37.1, gluc: 110, steps: 4100, daysAgo: 1 },
      // Latest reading for Rahul - slightly elevated
      { patientId: patientRahul._id, hr: 88, sys: 132, dia: 86, spo2: 98, temp: 36.8, gluc: 98, steps: 5300, daysAgo: 0 },

      // Rajesh readings - higher risk diabetic profile
      { patientId: patientRajesh._id, hr: 84, sys: 142, dia: 92, spo2: 95, temp: 37.0, gluc: 175, steps: 3200, daysAgo: 3 },
      { patientId: patientRajesh._id, hr: 89, sys: 148, dia: 94, spo2: 94, temp: 37.2, gluc: 190, steps: 2800, daysAgo: 1 },
      { patientId: patientRajesh._id, hr: 94, sys: 152, dia: 96, spo2: 93, temp: 37.3, gluc: 205, steps: 2100, daysAgo: 0 },

      // Amit readings - high risk cardiac patient
      { patientId: patientAmit._id, hr: 108, sys: 165, dia: 102, spo2: 90, temp: 37.8, gluc: 145, steps: 1200, daysAgo: 0 },

      // Sneha & Ananya healthy normal readings
      { patientId: patientSneha._id, hr: 68, sys: 116, dia: 76, spo2: 99, temp: 36.6, gluc: 88, steps: 8400, daysAgo: 1 },
      { patientId: patientAnanya._id, hr: 72, sys: 118, dia: 78, spo2: 98, temp: 36.7, gluc: 90, steps: 6900, daysAgo: 1 },
    ];

    for (const r of sampleReadings) {
      const risk = calculateRisk({
        heartRate: r.hr,
        systolic: r.sys,
        diastolic: r.dia,
        spo2: r.spo2,
        temperature: r.temp,
        glucose: r.gluc,
        age: 35,
        conditions: [],
      });

      await HealthReading.create({
        patientId: r.patientId,
        heartRate: r.hr,
        bloodPressure: { systolic: r.sys, diastolic: r.dia },
        spo2: r.spo2,
        temperature: r.temp,
        glucose: r.gluc,
        weight: 70,
        steps: r.steps,
        source: r.daysAgo === 0 ? 'SIMULATED_IOT' : 'MANUAL',
        riskLevel: risk.level,
        riskScore: risk.score,
        riskFactors: risk.reasons,
        timestamp: new Date(now - r.daysAgo * dayMs),
      });
    }

    console.log('Seeding Appointments...');

    // 5. Seed Appointments
    const tomorrow = new Date(now + 1 * dayMs);
    const inTwoDays = new Date(now + 2 * dayMs);
    const yesterday = new Date(now - 1 * dayMs);

    await Appointment.create([
      {
        patientId: patientRahul._id,
        doctorId: doctorAarav._id,
        date: tomorrow,
        time: '10:30 AM',
        status: 'CONFIRMED',
        reason: 'Follow-up for Blood Pressure evaluation and wearable monitoring review',
        notes: 'Patient reports occasional headache and fluctuating readings.',
        doctorNotes: 'Will review 7-day wearable telemetry and adjust Amlodipine if needed.',
      },
      {
        patientId: patientRajesh._id,
        doctorId: doctorPriya._id,
        date: inTwoDays,
        time: '11:00 AM',
        status: 'PENDING',
        reason: 'Elevated Fasting Glucose and HbA1c review consultation',
        notes: 'Fasting glucose was above 180 mg/dL this morning.',
      },
      {
        patientId: patientAnanya._id,
        doctorId: doctorVikram._id,
        date: tomorrow,
        time: '02:00 PM',
        status: 'CONFIRMED',
        reason: 'Seasonal asthma exacerbation checkup and inhaler review',
        notes: 'Mild wheezing observed during morning weather changes.',
      },
      {
        patientId: patientSneha._id,
        doctorId: doctorPriya._id,
        date: yesterday,
        time: '03:30 PM',
        status: 'COMPLETED',
        reason: 'Routine thyroid panel follow-up',
        doctorNotes: 'TSH is within optimal range. Continue current dosage of Levothyroxine.',
      },
      {
        patientId: patientAmit._id,
        doctorId: doctorAarav._id,
        date: new Date(now + 3 * dayMs),
        time: '09:30 AM',
        status: 'PENDING',
        reason: 'Post-discharge cardiac telemetry review',
        notes: 'Elevated resting pulse and tightness reported.',
      },
    ]);

    console.log('Seeding Prescriptions...');

    // 6. Seed Prescriptions
    await Prescription.create([
      {
        patientId: patientRahul._id,
        doctorId: doctorAarav._id,
        medicines: [
          { name: 'Amlodipine Besylate', dosage: '5 mg', frequency: 'Once daily (Morning)', duration: '30 days', instructions: 'Take with water after breakfast' },
          { name: 'Telmisartan', dosage: '40 mg', frequency: 'Once daily (Evening)', duration: '30 days', instructions: 'Take after dinner' },
        ],
        diagnosis: 'Stage 1 Essential Hypertension with moderate stress factor',
        generalAdvice: 'Limit dietary sodium to <2g/day. Perform 30 minutes of aerobic walking daily. Maintain IoT wearable log.',
        followUpDate: tomorrow,
      },
      {
        patientId: patientRajesh._id,
        doctorId: doctorPriya._id,
        medicines: [
          { name: 'Metformin Hydrochloride', dosage: '500 mg', frequency: 'Twice daily after meals', duration: '60 days', instructions: 'Take immediately with meals' },
          { name: 'Glimepiride', dosage: '1 mg', frequency: 'Once daily before breakfast', duration: '30 days', instructions: 'Take 15 mins before breakfast' },
        ],
        diagnosis: 'Type 2 Diabetes Mellitus with postprandial glycemic surge',
        generalAdvice: 'Follow strict low-glycemic diabetic meal plan. Monitor fasting and 2-hr postprandial glucose thrice weekly.',
        followUpDate: inTwoDays,
      },
      {
        patientId: patientAnanya._id,
        doctorId: doctorVikram._id,
        medicines: [
          { name: 'Salbutamol / Levosalbutamol Inhaler', dosage: '100 mcg', frequency: '2 puffs as needed', duration: '30 days', instructions: 'Rinse mouth after inhalation' },
          { name: 'Montelukast Sodium', dosage: '10 mg', frequency: 'Once daily at bedtime', duration: '14 days', instructions: 'Take at night' },
        ],
        diagnosis: 'Mild Bronchial Asthma with allergen sensitivity',
        generalAdvice: 'Avoid exposure to morning cold drafts and heavy dust. Monitor peak expiratory flow rate.',
      },
    ]);

    console.log('Seeding Medicine Reminders...');

    // 7. Seed Medicine Reminders
    await MedicineReminder.create([
      {
        patientId: patientRahul._id,
        medicineName: 'Amlodipine',
        dosage: '5 mg',
        frequency: 'Once daily',
        reminderTimes: ['09:00 AM'],
        instructions: 'Take after breakfast with a full glass of water',
        adherenceLog: [
          { date: new Date(now - 2 * dayMs), doseTime: '09:00 AM', status: 'TAKEN' },
          { date: new Date(now - 1 * dayMs), doseTime: '09:00 AM', status: 'TAKEN' },
          { date: new Date(now), doseTime: '09:00 AM', status: 'TAKEN' },
        ],
      },
      {
        patientId: patientRahul._id,
        medicineName: 'Telmisartan',
        dosage: '40 mg',
        frequency: 'Once daily',
        reminderTimes: ['09:00 PM'],
        instructions: 'Take after dinner',
        adherenceLog: [
          { date: new Date(now - 2 * dayMs), doseTime: '09:00 PM', status: 'TAKEN' },
          { date: new Date(now - 1 * dayMs), doseTime: '09:00 PM', status: 'TAKEN' },
        ],
      },
      {
        patientId: patientRahul._id,
        medicineName: 'Multivitamin Complex',
        dosage: '1 Capsule',
        frequency: 'Once daily',
        reminderTimes: ['02:00 PM'],
        instructions: 'Take after lunch',
        adherenceLog: [
          { date: new Date(now - 1 * dayMs), doseTime: '02:00 PM', status: 'TAKEN' },
          { date: new Date(now), doseTime: '02:00 PM', status: 'SKIPPED' },
        ],
      },
    ]);

    console.log('Seeding Emergency Alerts...');

    // 8. Seed Emergency Alerts
    await EmergencyAlert.create([
      {
        patientId: patientAmit._id,
        doctorId: doctorAarav._id,
        healthData: {
          heartRate: 118,
          bloodPressure: { systolic: 168, diastolic: 104 },
          spo2: 90,
          temperature: 37.8,
          glucose: 145,
        },
        location: {
          address: 'C-72, Park Street, Metro Area 4, Kolkata',
          lat: 22.55,
          lng: 88.35,
        },
        message: 'CRITICAL EMERGENCY: Patient triggered emergency SOS button. Acute chest tightness & oxygen desaturation.',
        emergencyContact: {
          name: 'Deepak Joshi',
          phone: '+91 9876500005',
          relationship: 'Son',
        },
        status: 'TRIGGERED',
        createdAt: new Date(now - 15 * 60 * 1000), // 15 mins ago
      },
      {
        patientId: patientRahul._id,
        doctorId: doctorAarav._id,
        healthData: {
          heartRate: 104,
          bloodPressure: { systolic: 148, diastolic: 96 },
          spo2: 94,
          temperature: 37.2,
          glucose: 110,
        },
        location: {
          address: 'Flat 402, Green Glen Heights, Sector 62, Noida',
          lat: 28.628,
          lng: 77.375,
        },
        message: 'Dizziness and rapid palpitations during simulated stress test.',
        emergencyContact: {
          name: 'Pooja Verma',
          phone: '+91 9876500001',
          relationship: 'Spouse',
        },
        status: 'RESOLVED',
        doctorNotes: 'Telephonic consultation conducted. Vitals normalized after resting. Patient advised to rest.',
        createdAt: new Date(now - 2 * dayMs),
        acknowledgedAt: new Date(now - 2 * dayMs + 5 * 60 * 1000),
        resolvedAt: new Date(now - 2 * dayMs + 45 * 60 * 1000),
      },
    ]);

    console.log('Seeding Notifications for both Patients and Doctors...');

    // 9. Seed Notifications (Crucial Requirement: both doctors & patients)
    await Notification.create([
      // Doctor Aarav Notifications
      {
        recipientId: doctorAarav._id,
        senderId: patientAmit._id,
        type: 'EMERGENCY_ALERT',
        title: '🚨 CRITICAL: Emergency Alert from Amit Joshi',
        message: 'Patient Amit Joshi activated SOS! SpO2 90%, HR 118 BPM, BP 168/104 mmHg. Immediate review needed.',
        link: '/doctor/emergency',
        isRead: false,
        createdAt: new Date(now - 15 * 60 * 1000),
      },
      {
        recipientId: doctorAarav._id,
        senderId: patientRahul._id,
        type: 'APPOINTMENT_REQUEST',
        title: 'New Appointment Request',
        message: `New consultation request from Rahul Verma for ${tomorrow.toLocaleDateString()} at 10:30 AM.`,
        link: '/doctor/appointments',
        isRead: false,
        createdAt: new Date(now - 2 * 60 * 60 * 1000),
      },
      {
        recipientId: doctorAarav._id,
        senderId: patientRahul._id,
        type: 'HIGH_RISK_AI_PREDICTION',
        title: 'Telemetry Alert: Rahul Verma is MEDIUM Risk',
        message: 'Patient Rahul Verma logged elevated BP (138/89 mmHg) via wearable stream. Risk Score: 38/100.',
        link: '/doctor/monitoring',
        isRead: true,
        createdAt: new Date(now - 24 * 60 * 60 * 1000),
      },

      // Patient Rahul Notifications
      {
        recipientId: patientRahul._id,
        senderId: doctorAarav._id,
        type: 'APPOINTMENT_CONFIRMED',
        title: 'Appointment Confirmed',
        message: `Dr. Aarav Sharma has confirmed your consultation for ${tomorrow.toLocaleDateString()} at 10:30 AM.`,
        link: '/patient/appointments',
        isRead: false,
        createdAt: new Date(now - 1 * 60 * 60 * 1000),
      },
      {
        recipientId: patientRahul._id,
        senderId: doctorAarav._id,
        type: 'PRESCRIPTION_ADDED',
        title: 'New Digital Prescription Issued',
        message: 'Dr. Aarav Sharma added a prescription: Amlodipine Besylate 5mg, Telmisartan 40mg.',
        link: '/patient/records',
        isRead: false,
        createdAt: new Date(now - 3 * 60 * 60 * 1000),
      },
      {
        recipientId: patientRahul._id,
        type: 'MEDICINE_REMINDER',
        title: 'Medicine Reminder: Amlodipine',
        message: 'Time for morning dosage: Amlodipine 5mg. Take after breakfast.',
        link: '/patient/medicines',
        isRead: true,
        createdAt: new Date(now - 4 * 60 * 60 * 1000),
      },
      {
        recipientId: patientRahul._id,
        type: 'ABNORMAL_HEALTH_READING',
        title: 'Health Warning: SpO2 Alert',
        message: 'Wearable stream logged SpO2 at 94%. Maintain deep breathing and check sitting posture.',
        link: '/patient/health',
        isRead: true,
        createdAt: new Date(now - 12 * 60 * 60 * 1000),
      },

      // Doctor Priya Notification
      {
        recipientId: doctorPriya._id,
        senderId: patientRajesh._id,
        type: 'APPOINTMENT_REQUEST',
        title: 'New Consultation Request from Rajesh Kumar',
        message: 'Patient requested appointment for Diabetes & Glycemic Surge evaluation.',
        link: '/doctor/appointments',
        isRead: false,
        createdAt: new Date(now - 5 * 60 * 60 * 1000),
      },
    ]);

    console.log('Seeding Digital Medical Records...');

    // 10. Medical Records
    await MedicalRecord.create([
      {
        patientId: patientRahul._id,
        doctorId: doctorAarav._id,
        title: 'Initial Cardiovascular & Telemetry Baseline',
        recordType: 'CONSULTATION_NOTE',
        diagnosis: 'Mild Labile Hypertension (Stress related)',
        notes: 'Resting ECG was within normal sinus limits. Advised continuous wearable telemetry tracking.',
        vitalsSummary: 'HR 74 BPM, BP 122/82 mmHg, SpO2 98%',
        followUpDate: tomorrow,
      },
      {
        patientId: patientRahul._id,
        doctorId: doctorAarav._id,
        title: 'Lipid Profile & Serum Electrolytes',
        recordType: 'LAB_REPORT',
        diagnosis: 'Total Cholesterol: 192 mg/dL, HDL: 48 mg/dL, LDL: 118 mg/dL. Normal renal function.',
        notes: 'Electrolytes normal. Serum creatinine 0.9 mg/dL. No organ dysfunction detected.',
      },
    ]);

    console.log('Seeding Messages...');

    // 11. Chat Messages
    await Message.create([
      {
        senderId: patientRahul._id,
        recipientId: doctorAarav._id,
        messageText: 'Good morning Dr. Sharma, I have uploaded my latest 7-day wearable readings.',
        isRead: true,
        createdAt: new Date(now - 5 * 60 * 60 * 1000),
      },
      {
        senderId: doctorAarav._id,
        recipientId: patientRahul._id,
        messageText: 'Hello Rahul, I reviewed your telemetry chart. The morning spikes are well controlled with the 5mg dose.',
        isRead: true,
        createdAt: new Date(now - 4 * 60 * 60 * 1000),
      },
      {
        senderId: patientRahul._id,
        recipientId: doctorAarav._id,
        messageText: 'Thank you doctor! Looking forward to our consultation tomorrow at 10:30 AM.',
        isRead: false,
        createdAt: new Date(now - 2 * 60 * 60 * 1000),
      },
    ]);

    console.log('====================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('Demo Accounts Ready:');
    console.log('  👨‍🦰 PATIENT: patient@example.com      | Password: Patient@123');
    console.log('  👨‍⚕️ DOCTOR:  doctor@example.com       | Password: Doctor@123');
    console.log('  🛡️ ADMIN:   admin@example.com        | Password: Admin@123');
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
