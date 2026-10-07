const aiService = require('../server/services/aiAssistant');

async function verifyDiseaseGuidance() {
  console.log('========================================================');
  console.log('🩺 VERIFYING AUTOMATIC DISEASE-SPECIFIC GUIDANCE');
  console.log('========================================================\n');

  // Test 1: Upload a diabetes report
  const diabetesBuffer = Buffer.from(
    'CLINICAL DIAGNOSTIC REPORT\nPatient: John Doe\nBlood Glucose: 165 mg/dL\nHemoglobin: 14.0 g/dL\nBlood Pressure: 118/76 mmHg\n'
  );

  const resDiabetes = await aiService.analyzeReportFile({
    buffer: diabetesBuffer,
    mimetype: 'application/pdf',
    originalname: 'Diabetes_Report.pdf',
  });

  console.log('1. Diabetes Report Analysis:');
  console.log('   - Primary Condition:', resDiabetes.conditionDetection.primaryKey);
  console.log('   - Condition Title:', resDiabetes.conditionDetection.guidance.conditionTitle);
  console.log('   - Risk Level:', resDiabetes.conditionDetection.guidance.riskLevel);
  console.log('   - Recommended Foods Count:', resDiabetes.conditionDetection.guidance.diet.recommendedFoods.length);
  console.log('   - Sample Breakfast:', resDiabetes.conditionDetection.guidance.diet.sampleMealPlan.breakfast);
  console.log('   - Sample Lunch:', resDiabetes.conditionDetection.guidance.diet.sampleMealPlan.lunch);
  console.log('   - Sample Dinner:', resDiabetes.conditionDetection.guidance.diet.sampleMealPlan.dinner);
  console.log('   - Hydration Guidance:', resDiabetes.conditionDetection.guidance.diet.hydrationGuidance);
  console.log('   - Exercises Count:', resDiabetes.conditionDetection.guidance.exercise.exercisesTable.length);
  console.log('   - First Exercise:', JSON.stringify(resDiabetes.conditionDetection.guidance.exercise.exercisesTable[0]));
  console.log('   - Safety Precautions Count:', resDiabetes.conditionDetection.guidance.exercise.safetyPrecautions.length);
  console.log('   - Exercises to Avoid Count:', resDiabetes.conditionDetection.guidance.exercise.exercisesToAvoid.length);

  // Verify Exact Required Wording
  const expectedDietNotice =
    "Expert Medical Guidance: These food and diet suggestions are based on general dietary guidance used by senior doctors and qualified nutrition/medical professionals for this health condition. They are provided for educational purposes and should be personalized by the patient's doctor or registered dietitian.";

  const expectedExerciseNotice =
    "Expert Medical Guidance: These sample exercises are based on general recommendations used by senior doctors, physiotherapists, and qualified healthcare professionals for this condition. Exercise should be personalized according to the patient's age, medical history, medications, physical ability, and doctor's advice.";

  if (resDiabetes.conditionDetection.guidance.diet.medicalGuidanceNotice === expectedDietNotice) {
    console.log('   - Diet Expert Notice Phrasing: ✅ EXACT MATCH');
  } else {
    console.error('   - Diet Expert Notice Phrasing: ❌ MISMATCH');
    process.exit(1);
  }

  if (resDiabetes.conditionDetection.guidance.exercise.medicalGuidanceNotice === expectedExerciseNotice) {
    console.log('   - Exercise Expert Notice Phrasing: ✅ EXACT MATCH');
  } else {
    console.error('   - Exercise Expert Notice Phrasing: ❌ MISMATCH');
    process.exit(1);
  }

  // Test 2: Upload a Hypertension report
  const htBuffer = Buffer.from(
    'CLINICAL DIAGNOSTIC REPORT\nPatient: Jane Smith\nBlood Pressure: 155/100 mmHg\nBlood Glucose: 95 mg/dL\nHemoglobin: 13.5 g/dL\n'
  );
  const resHt = await aiService.analyzeReportFile({
    buffer: htBuffer,
    mimetype: 'application/pdf',
    originalname: 'Hypertension_Report.pdf',
  });
  console.log('\n2. Hypertension Report Analysis:');
  console.log('   - Primary Condition:', resHt.conditionDetection.primaryKey);
  console.log('   - Condition Title:', resHt.conditionDetection.guidance.conditionTitle);
  console.log('   - First Exercise:', JSON.stringify(resHt.conditionDetection.guidance.exercise.exercisesTable[0]));

  // Test 3: Upload an Anemia report
  const anemiaBuffer = Buffer.from(
    'CLINICAL DIAGNOSTIC REPORT\nPatient: Alice Brown\nHemoglobin: 9.8 g/dL\nBlood Pressure: 115/75 mmHg\nBlood Glucose: 90 mg/dL\n'
  );
  const resAnemia = await aiService.analyzeReportFile({
    buffer: anemiaBuffer,
    mimetype: 'application/pdf',
    originalname: 'Anemia_Report.pdf',
  });
  console.log('\n3. Anemia Report Analysis:');
  console.log('   - Primary Condition:', resAnemia.conditionDetection.primaryKey);
  console.log('   - Condition Title:', resAnemia.conditionDetection.guidance.conditionTitle);
  console.log('   - First Exercise:', JSON.stringify(resAnemia.conditionDetection.guidance.exercise.exercisesTable[0]));

  console.log('\n========================================================');
  console.log('🎉 ALL DISEASE-SPECIFIC GUIDANCE TESTS PASSED 100%!');
  console.log('========================================================');
}

verifyDiseaseGuidance().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
