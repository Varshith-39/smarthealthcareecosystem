const HealthReading = require('../models/HealthReading');
const PatientProfile = require('../models/PatientProfile');
const User = require('../models/User');
const { calculateRisk } = require('../services/aiRiskService');
const { createNotification } = require('../services/notificationService');

// @desc    Add a health reading (manual or simulated)
// @route   POST /api/health
// @access  Private (Patient or System)
const addHealthReading = async (req, res, next) => {
  try {
    const {
      patientId = req.user._id,
      heartRate,
      bloodPressure,
      spo2,
      temperature,
      glucose,
      weight,
      steps,
      source = 'MANUAL',
      notes = '',
    } = req.body;

    const profile = await PatientProfile.findOne({ user: patientId });

    // Calculate age
    let age = 30;
    if (profile?.dateOfBirth) {
      const diff = Date.now() - new Date(profile.dateOfBirth).getTime();
      age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    }

    // Execute AI Risk Prediction Engine
    const riskResult = calculateRisk({
      heartRate: Number(heartRate),
      systolic: Number(bloodPressure?.systolic || 120),
      diastolic: Number(bloodPressure?.diastolic || 80),
      spo2: Number(spo2),
      temperature: Number(temperature),
      glucose: Number(glucose || 95),
      age,
      conditions: profile?.medicalConditions || [],
    });

    const reading = await HealthReading.create({
      patientId,
      heartRate: Number(heartRate),
      bloodPressure: {
        systolic: Number(bloodPressure?.systolic || 120),
        diastolic: Number(bloodPressure?.diastolic || 80),
      },
      spo2: Number(spo2),
      temperature: Number(temperature),
      glucose: Number(glucose || 95),
      weight: Number(weight || 68),
      steps: Number(steps || 4500),
      source,
      notes,
      riskLevel: riskResult.level,
      riskScore: riskResult.score,
      riskFactors: riskResult.reasons,
    });

    const patientUser = await User.findById(patientId);

    // If abnormal reading detected, trigger bidirectional notifications!
    if (riskResult.isAbnormal) {
      // 1. Notify Patient
      await createNotification({
        recipientId: patientId,
        type: 'ABNORMAL_HEALTH_READING',
        title: `Health Warning: ${riskResult.level} Risk Detected`,
        message: `Your latest vital signs indicated elevated risk (${riskResult.score}/100). Primary factor: ${riskResult.reasons[0] || 'Vitals variance'}.`,
        link: '/patient/health',
        metadata: { readingId: reading._id, riskLevel: riskResult.level },
      });

      // 2. Notify Doctor (assigned doctor or active doctor)
      let targetDoctorId = profile?.assignedDoctor;
      if (!targetDoctorId) {
        const anyDoctor = await User.findOne({ role: 'DOCTOR', isActive: true });
        if (anyDoctor) targetDoctorId = anyDoctor._id;
      }

      if (targetDoctorId) {
        await createNotification({
          recipientId: targetDoctorId,
          senderId: patientId,
          type: 'HIGH_RISK_AI_PREDICTION',
          title: `Telemetry Alert: ${patientUser?.name || 'Patient'} is ${riskResult.level}`,
          message: `Patient ${patientUser?.name} logged an abnormal reading: HR ${heartRate} BPM, BP ${bloodPressure?.systolic}/${bloodPressure?.diastolic}, SpO2 ${spo2}%. Risk Score: ${riskResult.score}/100.`,
          link: `/doctor/monitoring`,
          metadata: { patientId, readingId: reading._id, riskLevel: riskResult.level },
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Health reading recorded successfully',
      reading,
      aiAnalysis: riskResult,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Simulate IoT Wearable telemetry reading (Normal or Abnormal)
// @route   POST /api/health/simulate-iot
// @access  Private
const simulateIoTReading = async (req, res, next) => {
  try {
    const { abnormal = false, patientId = req.user._id } = req.body;

    let heartRate, systolic, diastolic, spo2, temperature, glucose, steps;

    if (abnormal) {
      // Generate abnormal readings to showcase AI detection
      heartRate = Math.floor(105 + Math.random() * 25); // 105 - 130 bpm (tachycardia)
      systolic = Math.floor(145 + Math.random() * 25); // 145 - 170 mmHg
      diastolic = Math.floor(92 + Math.random() * 15); // 92 - 107 mmHg
      spo2 = Math.floor(88 + Math.random() * 4); // 88 - 92% (hypoxia)
      temperature = Number((38.4 + Math.random() * 0.9).toFixed(1)); // 38.4 - 39.3 C
      glucose = Math.floor(160 + Math.random() * 60);
      steps = Math.floor(1200 + Math.random() * 500);
    } else {
      // Normal physiological parameters with slight natural variance
      heartRate = Math.floor(68 + Math.random() * 14); // 68 - 82 bpm
      systolic = Math.floor(115 + Math.random() * 10); // 115 - 125 mmHg
      diastolic = Math.floor(75 + Math.random() * 8); // 75 - 83 mmHg
      spo2 = Math.floor(97 + Math.random() * 3); // 97 - 99%
      temperature = Number((36.5 + Math.random() * 0.5).toFixed(1)); // 36.5 - 37.0 C
      glucose = Math.floor(85 + Math.random() * 25);
      steps = Math.floor(4500 + Math.random() * 3000);
    }

    const profile = await PatientProfile.findOne({ user: patientId });
    let age = 30;
    if (profile?.dateOfBirth) {
      const diff = Date.now() - new Date(profile.dateOfBirth).getTime();
      age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    }

    const riskResult = calculateRisk({
      heartRate,
      systolic,
      diastolic,
      spo2,
      temperature,
      glucose,
      age,
      conditions: profile?.medicalConditions || [],
    });

    const reading = await HealthReading.create({
      patientId,
      heartRate,
      bloodPressure: { systolic, diastolic },
      spo2,
      temperature,
      glucose,
      weight: 70,
      steps,
      source: 'SIMULATED_IOT',
      notes: abnormal ? 'Abnormal reading generated via simulated wearable stream' : 'Routine IoT wearable stream sample',
      riskLevel: riskResult.level,
      riskScore: riskResult.score,
      riskFactors: riskResult.reasons,
    });

    const patientUser = await User.findById(patientId);

    if (riskResult.isAbnormal) {
      await createNotification({
        recipientId: patientId,
        type: 'ABNORMAL_HEALTH_READING',
        title: `IoT Alert: Abnormal Vitals Detected (${riskResult.level})`,
        message: `Wearable stream logged abnormal metrics (SpO2: ${spo2}%, BP: ${systolic}/${diastolic}, HR: ${heartRate} BPM).`,
        link: '/patient/health',
        metadata: { readingId: reading._id, riskLevel: riskResult.level },
      });

      let targetDoctorId = profile?.assignedDoctor;
      if (!targetDoctorId) {
        const anyDoctor = await User.findOne({ role: 'DOCTOR', isActive: true });
        if (anyDoctor) targetDoctorId = anyDoctor._id;
      }

      if (targetDoctorId) {
        await createNotification({
          recipientId: targetDoctorId,
          senderId: patientId,
          type: 'HIGH_RISK_AI_PREDICTION',
          title: `IoT Telemetry Warning: ${patientUser?.name || 'Patient'}`,
          message: `Simulated Wearable detected abnormal metrics for ${patientUser?.name}: SpO2 ${spo2}%, HR ${heartRate} BPM, BP ${systolic}/${diastolic}. Risk: ${riskResult.level} (${riskResult.score}/100).`,
          link: `/doctor/monitoring`,
          metadata: { patientId, readingId: reading._id, riskLevel: riskResult.level },
        });
      }
    }

    res.status(201).json({
      success: true,
      message: abnormal ? 'Abnormal simulated IoT reading generated' : 'Simulated wearable data generated',
      reading,
      aiAnalysis: riskResult,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get health reading history with date filter (Today, 7 days, 30 days, all)
// @route   GET /api/health
// @access  Private
const getHealthReadings = async (req, res, next) => {
  try {
    const { timeRange = '7days', patientId = req.user._id } = req.query;

    let filter = { patientId };
    const now = new Date();

    if (timeRange === 'today') {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      filter.timestamp = { $gte: startOfDay };
    } else if (timeRange === '7days') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      filter.timestamp = { $gte: sevenDaysAgo };
    } else if (timeRange === '30days') {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      filter.timestamp = { $gte: thirtyDaysAgo };
    }

    const readings = await HealthReading.find(filter).sort({ timestamp: 1 });
    const latestReading = await HealthReading.findOne({ patientId }).sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      count: readings.length,
      readings,
      latestReading,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI Health Risk Assessment for current or target patient
// @route   GET /api/health/risk-assessment/:patientId?
// @access  Private
const getRiskAssessment = async (req, res, next) => {
  try {
    const targetPatientId = req.params.patientId || req.user._id;

    const latest = await HealthReading.findOne({ patientId: targetPatientId }).sort({ timestamp: -1 });
    const profile = await PatientProfile.findOne({ user: targetPatientId });

    let age = 32;
    if (profile?.dateOfBirth) {
      const diff = Date.now() - new Date(profile.dateOfBirth).getTime();
      age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    }

    const assessment = calculateRisk({
      heartRate: latest?.heartRate || 72,
      systolic: latest?.bloodPressure?.systolic || 120,
      diastolic: latest?.bloodPressure?.diastolic || 80,
      spo2: latest?.spo2 || 98,
      temperature: latest?.temperature || 36.7,
      glucose: latest?.glucose || 95,
      age,
      conditions: profile?.medicalConditions || [],
    });

    res.status(200).json({
      success: true,
      assessment,
      latestReading: latest,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addHealthReading,
  simulateIoTReading,
  getHealthReadings,
  getRiskAssessment,
};
