/**
 * Explainable Clinical AI Health Risk Prediction Engine
 * Calculates a composite risk score (0-100), clinical risk tier (LOW, MEDIUM, HIGH, CRITICAL),
 * and transparent explainability factors for healthcare decision support.
 */

const calculateRisk = ({
  heartRate = 72,
  systolic = 120,
  diastolic = 80,
  spo2 = 98,
  temperature = 36.8,
  glucose = 95,
  age = 35,
  conditions = [],
}) => {
  let score = 10; // Baseline healthy score
  const reasons = [];

  // 1. Oxygen Saturation (SpO2) evaluation
  if (spo2 < 90) {
    score += 35;
    reasons.push(`Critical Hypoxemia: SpO2 is severely depressed at ${spo2}% (<90%)`);
  } else if (spo2 < 94) {
    score += 20;
    reasons.push(`Mild Hypoxia: SpO2 reading is low at ${spo2}% (normal: 95-100%)`);
  }

  // 2. Blood Pressure evaluation
  if (systolic >= 180 || diastolic >= 120) {
    score += 35;
    reasons.push(`Hypertensive Crisis: BP recorded at ${systolic}/${diastolic} mmHg`);
  } else if (systolic >= 140 || diastolic >= 90) {
    score += 22;
    reasons.push(`Stage 2 Hypertension: BP elevated at ${systolic}/${diastolic} mmHg`);
  } else if (systolic >= 130 || diastolic >= 85) {
    score += 12;
    reasons.push(`Pre-hypertension: Slightly elevated BP at ${systolic}/${diastolic} mmHg`);
  } else if (systolic < 90 || diastolic < 60) {
    score += 20;
    reasons.push(`Hypotension: Low Blood Pressure recorded at ${systolic}/${diastolic} mmHg`);
  }

  // 3. Heart Rate evaluation
  if (heartRate > 120) {
    score += 25;
    reasons.push(`Severe Tachycardia: Heart rate elevated at ${heartRate} BPM (>120 BPM)`);
  } else if (heartRate > 100) {
    score += 15;
    reasons.push(`Resting Tachycardia: Heart rate above normal at ${heartRate} BPM`);
  } else if (heartRate < 50) {
    score += 20;
    reasons.push(`Bradycardia: Low resting heart rate at ${heartRate} BPM (<50 BPM)`);
  }

  // 4. Body Temperature evaluation
  if (temperature >= 39.0) {
    score += 25;
    reasons.push(`High Grade Pyrexia / Severe Fever: Temperature at ${temperature.toFixed(1)}°C`);
  } else if (temperature >= 38.0) {
    score += 15;
    reasons.push(`Mild Pyrexia / Low Grade Fever: Temperature at ${temperature.toFixed(1)}°C`);
  } else if (temperature < 35.0) {
    score += 25;
    reasons.push(`Hypothermia Risk: Core temperature low at ${temperature.toFixed(1)}°C`);
  }

  // 5. Blood Glucose evaluation
  if (glucose >= 200) {
    score += 25;
    reasons.push(`Severe Hyperglycemia: Blood glucose critically high at ${glucose} mg/dL`);
  } else if (glucose >= 140) {
    score += 15;
    reasons.push(`Elevated Blood Glucose: Reading high at ${glucose} mg/dL (target: 70-120 mg/dL)`);
  } else if (glucose < 70) {
    score += 20;
    reasons.push(`Hypoglycemia Alert: Blood glucose dangerously low at ${glucose} mg/dL`);
  }

  // 6. Pre-existing Conditions Modifier
  const lowerConditions = conditions.map((c) => String(c).toLowerCase());
  if (lowerConditions.some((c) => c.includes('heart') || c.includes('cardio') || c.includes('coronary'))) {
    score += 10;
    reasons.push('Pre-existing Cardiovascular condition noted in medical history');
  }
  if (lowerConditions.some((c) => c.includes('diabet'))) {
    score += 8;
    reasons.push('Known Diabetic condition noted in clinical profile');
  }
  if (lowerConditions.some((c) => c.includes('hypertens') || c.includes('bp'))) {
    score += 6;
    reasons.push('Known Chronic Hypertension noted in clinical profile');
  }

  // 7. Age Modifier
  if (age >= 65) {
    score += 6;
    reasons.push('Geriatric demographic category factor (Age ≥ 65)');
  }

  // Clamp score to 5 - 100
  score = Math.min(100, Math.max(5, score));

  // Determine categorical Risk Tier
  let level = 'LOW';
  if (score >= 80) {
    level = 'CRITICAL';
  } else if (score >= 55) {
    level = 'HIGH';
  } else if (score >= 28) {
    level = 'MEDIUM';
  }

  if (reasons.length === 0) {
    reasons.push('All physiological vitals are within standard healthy clinical reference ranges');
  }

  return {
    score,
    level,
    reasons,
    isAbnormal: level !== 'LOW',
    disclaimer: 'This prediction is for demonstration and educational purposes only and is not a clinical medical diagnosis.',
  };
};

module.exports = {
  calculateRisk,
};
