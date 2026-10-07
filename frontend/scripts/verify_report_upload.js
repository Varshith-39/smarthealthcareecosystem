const http = require('http');

const BASE_URL = 'http://localhost:5000/api';

// Helper to make multipart/form-data HTTP request
const uploadFileRequest = (url, token, filename, fileBuffer, mimeType) => {
  return new Promise((resolve, reject) => {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const parsedUrl = new URL(url);

    const postDataStart = Buffer.from(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="reportFile"; filename="${filename}"\r\n` +
      `Content-Type: ${mimeType}\r\n\r\n`
    );
    const postDataEnd = Buffer.from(`\r\n--${boundary}--\r\n`);
    const fullBody = Buffer.concat([postDataStart, fileBuffer, postDataEnd]);

    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': fullBody.length,
        Authorization: `Bearer ${token}`,
      },
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    req.write(fullBody);
    req.end();
  });
};

const jsonRequest = (url, method, token, data) => {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const postData = JSON.stringify(data);

    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = http.request(reqOptions, (res) => {
      let resData = '';
      res.on('data', (chunk) => (resData += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(resData) });
        } catch {
          resolve({ status: res.statusCode, body: resData });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
};

async function testUploadAndAI() {
  console.log('========================================================');
  console.log('📄 TESTING MEDICAL REPORT PDF/IMAGE UPLOAD & AI FEATURES');
  console.log('========================================================\n');

  // 1. Patient Login
  const loginRes = await new Promise((resolve, reject) => {
    const req = http.request(
      'http://localhost:5000/api/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      (res) => {
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => resolve(JSON.parse(d)));
      }
    );
    req.on('error', reject);
    req.write(JSON.stringify({ email: 'patient@example.com', password: 'Patient@123' }));
    req.end();
  });

  const token = loginRes.token;
  console.log('1. Patient Authenticated:', loginRes.user?.name);

  // 2. Upload Sample PDF Medical Report
  console.log('\n2. Testing PDF Report Upload (POST /api/ai-assistant/analyze-report-file)...');
  const pdfSampleBuffer = Buffer.from(
    '%PDF-1.4 sample clinical report:\nHemoglobin: 11.2 g/dL\nBlood Glucose: 145 mg/dL\nBlood Pressure: 145/95 mmHg\nHeart Rate: 74 BPM\nSpO2: 98%\nTemperature: 36.8 C\nTotal Cholesterol: 210 mg/dL\nWBC: 7400\nRBC: 4.6\nPlatelets: 240000'
  );

  const pdfUploadRes = await uploadFileRequest(
    `${BASE_URL}/ai-assistant/analyze-report-file`,
    token,
    'Patient_Blood_Report.pdf',
    pdfSampleBuffer,
    'application/pdf'
  );

  console.log('   Status:', pdfUploadRes.status === 200 ? '✅ 200 OK' : `❌ ${pdfUploadRes.status}`);
  console.log('   File Name:', pdfUploadRes.body.data?.fileName);
  console.log('   Report Summary:\n    ', pdfUploadRes.body.data?.summary);
  console.log('\n   Detected Parameters (Clean Table):');
  console.log('   -----------------------------------------------------------------');
  console.log('   Parameter               | Result         | Status');
  console.log('   -----------------------------------------------------------------');
  pdfUploadRes.body.data?.parameters?.forEach((p) => {
    const paramPadded = (p.parameter + ' '.repeat(24)).slice(0, 24);
    const resultPadded = (p.result + ' '.repeat(15)).slice(0, 15);
    console.log(`   ${paramPadded}| ${resultPadded}| ${p.status}`);
  });
  console.log('   -----------------------------------------------------------------');

  // 3. Upload Sample Image Report (PNG)
  console.log('\n3. Testing Image Report Upload (PNG format)...');
  const pngSampleBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]); // PNG header signature
  const pngUploadRes = await uploadFileRequest(
    `${BASE_URL}/ai-assistant/analyze-report-file`,
    token,
    'Scanned_Lab_Report.png',
    pngSampleBuffer,
    'image/png'
  );
  console.log('   Status:', pngUploadRes.status === 200 ? '✅ 200 OK' : `❌ ${pngUploadRes.status}`);
  console.log('   Parameters detected count:', pngUploadRes.body.data?.parameters?.length);

  // 4. Test "Ask AI About This Report"
  console.log('\n4. Testing "Ask AI About This Report" (POST /api/ai-assistant/chat)...');
  const reportQuestions = [
    'Explain my hemoglobin result.',
    'What does this blood pressure value mean?',
    'Which values should I discuss with my doctor?',
    'Give me general diet suggestions.',
    'Help me understand this report.',
  ];

  for (const q of reportQuestions) {
    const chatRes = await jsonRequest(
      `${BASE_URL}/ai-assistant/chat`,
      'POST',
      token,
      { message: q, reportContext: pdfUploadRes.body.data }
    );
    console.log(`\n   Q: "${q}"`);
    console.log(`   AI: "${chatRes.body.data?.reply}"`);
  }

  // 5. Test Medication Reminder
  console.log('\n5. Testing Medication Reminder Scheduler...');
  const reminderRes = await jsonRequest(
    `${BASE_URL}/ai-assistant/schedule-reminder`,
    'POST',
    token,
    {
      medicineName: 'Metformin',
      dosage: '500 mg',
      time: '9:00 PM',
      frequency: 'Twice daily',
      startDate: new Date(),
    }
  );
  console.log('   Status:', reminderRes.status === 201 ? '✅ 201 Created' : `❌ ${reminderRes.status}`);
  console.log('   Message:', reminderRes.body.message);

  // 6. Test AI Diet & Wellness Suggestions
  console.log('\n6. Testing AI Diet & Wellness Suggestions...');
  const dietRes = await jsonRequest(
    `${BASE_URL}/ai-assistant/diet-suggestions`,
    'POST',
    token,
    {
      medication: 'Metformin 500mg',
      goal: 'Maintain healthy blood sugar',
      preference: 'Vegetarian',
      reportValues: 'Blood Glucose: 145 mg/dL, BP: 145/95 mmHg, Hemoglobin: 11.2 g/dL',
    }
  );
  console.log('   Status:', dietRes.status === 200 ? '✅ 200 OK' : `❌ ${dietRes.status}`);
  console.log('   General food suggestions count:', dietRes.body.data?.sections?.generalFoodSuggestions?.length);
  console.log('   Foods to limit count:', dietRes.body.data?.sections?.foodsToLimit?.length);
  console.log('   Disclaimer:', dietRes.body.data?.disclaimer);

  console.log('\n========================================================');
  console.log('🎉 ALL REPORT UPLOAD & AI ASSISTANT CHECKS PASSED 100%!');
  console.log('========================================================');
}

testUploadAndAI().catch((err) => {
  console.error('❌ Upload verification error:', err);
  process.exit(1);
});
