# Smart Healthcare Ecosystem

A modern, responsive full-stack web application designed for a final-year B.Tech major project. The **Smart Healthcare Ecosystem** connects patients and healthcare providers through real-time physiological monitoring, appointment management, explainable AI health risk prediction, and simulated IoT wearable telemetry.

---

## 🌟 Technology Stack

- **Frontend:** React.js, Vite, Tailwind CSS, React Router v6, Axios, Recharts, Lucide React icons
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens), bcryptjs password hashing
- **Environment:** Node.js v18+ (tested on Node v24)
- **Local Database:** MongoDB Community Server (default: `mongodb://127.0.0.1:27017/smart_healthcare`)

---

## 📁 Project Structure

```
smart-healthcare/
├── package.json              # Root orchestration (concurrently runner)
├── .env.example              # Environment configuration template
├── README.md                 # Documentation & evaluation instructions
│
├── client/                   # Frontend React + Vite Application
│   ├── package.json
│   ├── vite.config.js        # Port 5173 with proxy to backend
│   ├── tailwind.config.js
│   ├── index.html
│   └── src/
│       ├── App.jsx           # Role-based protected routes
│       ├── main.jsx
│       ├── index.css         # Healthcare UI design tokens & gradients
│       ├── context/          # AuthContext, SocketContext, NotificationContext
│       ├── components/
│       │   ├── common/       # Navbar, Sidebar, StatCard, RiskBadge, Modal, DemoSwitcher
│       │   ├── health/       # HealthMetricCard, VitalsChart, IoTDataSimulator, AIRiskWidget
│       │   └── emergency/    # EmergencyModal
│       ├── layouts/          # MainLayout (Sidebar + Top Navbar)
│       ├── pages/
│       │   ├── LandingPage.jsx
│       │   ├── LoginPage.jsx # 1-Click demo logins for evaluator
│       │   ├── RegisterPage.jsx
│       │   ├── patient/      # PatientDashboard, MyHealthPage, DoctorsListPage, AppointmentsPage
│       │   ├── doctor/       # DoctorDashboard, MyPatientsPage, DoctorAppointmentsPage, DoctorHealthMonitoring
│       │   └── admin/        # AdminDashboard
│       └── services/api.js   # Axios instance with JWT interceptor
│
└── server/                   # Backend Express + Node API Server
    ├── package.json
    ├── server.js             # Express server on port 5000
    ├── .env                  # PORT, MONGO_URI, JWT_SECRET, CLIENT_URL
    ├── config/db.js          # MongoDB connection handler
    ├── models/
    │   ├── User.js           # Roles: PATIENT, DOCTOR, ADMIN
    │   ├── PatientProfile.js # Blood group, conditions, emergency contact
    │   ├── DoctorProfile.js  # Specialization, license, hospital, fee
    │   ├── Appointment.js    # Date, time, status, notes
    │   ├── HealthReading.js  # HR, BP, SpO2, temp, glucose, risk score
    │   ├── Notification.js
    │   └── EmergencyAlert.js
    ├── controllers/          # auth, patient, doctor, appointment, health, admin
    ├── routes/               # Modular REST endpoints
    ├── services/
    │   ├── aiRiskService.js  # Explainable clinical risk scoring (0-100)
    │   └── notificationService.js
    ├── middleware/           # JWT verification & role authorization guards
    └── seed/seedData.js      # Comprehensive demo data seeder
```

---

## ⚡ Quick Start (Run Locally)

### 1. Prerequisites
- **Node.js** installed (`node -v` >= 18.0.0)
- **MongoDB** running locally on `mongodb://127.0.0.1:27017`

### 2. Install Dependencies
Run from the root directory:
```bash
npm run install:all
```
*(Or install manually: `npm install`, then `cd server && npm install`, then `cd ../client && npm install`)*

### 3. Seed Demo Data
Populate realistic demo patients, doctors, appointments, and vitals readings:
```bash
npm run seed
```

### 4. Start the Application
Run both backend and frontend concurrently with a single command:
```bash
npm run dev
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000/api/healthcheck](http://localhost:5000/api/healthcheck)

---

## 🔑 Demo Credentials

The login page includes **1-Click Quick Fill buttons** for effortless evaluation:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Patient** | `patient@example.com` | `Patient@123` | Rahul Verma (Hypertension, 34 yrs) |
| **Doctor** | `doctor@example.com` | `Doctor@123` | Dr. Aarav Sharma (Cardiologist) |
| **Admin** | `admin@example.com` | `Admin@123` | System Administrator |

---

## 🩺 Healthcare Core Features Implemented

### 1. Role-Based Portals
- **Patient Portal:** Vitals dashboard, IoT simulator, trend charts, AI risk calculation, doctor search, appointment booking & cancellation.
- **Doctor Portal:** Monitored patient directory, scheduled consultations, accept/reject/reschedule visits, authorized patient telemetry trends.
- **Admin Portal:** User account access management (activate/deactivate), system activity overview, platform statistics.

### 2. Doctor Search & Specialization Filter
- Search doctors by name or hospital.
- Filter by medical specialization: *Cardiologist, Endocrinologist, Pulmonologist, General Physician*.
- View doctor credentials, hospital, consultation fee, and available hours.

### 3. End-to-End Appointment Lifecycle
- **Patient:** Select doctor, pick date and time slot, submit request, track status (*Pending, Confirmed, Completed, Cancelled*).
- **Doctor:** Review incoming requests, click **Accept** (*Confirmed*), **Reject** (*Cancelled*), **Reschedule** (select new date/time slot), or **Mark Completed** with consultation notes.

### 4. Health Telemetry & Recharts Graphs
- Capture physiological metrics: Heart Rate (BPM), Blood Pressure (Systolic/Diastolic), SpO2 (%), Temperature (°C), Glucose (mg/dL), Weight (kg), and Steps.
- Interactive Recharts visualization with time filtering (**Today**, **Last 7 Days**, **Last 30 Days**).
- Manual health reading entry form.

### 5. Simulated IoT Wearable Stream (Hardware-Free)
- **Simulate Wearable Data:** Generates realistic biometric readings with natural variances and persists them directly into MongoDB.
- **Trigger Abnormal Reading:** Generates acute abnormal readings to test AI risk detection and notification engines in front of evaluators.
- **Start Live Monitoring:** Periodically streams simulated wearable telemetry every 8 seconds.
- Clearly tagged with **`Demo / Simulated IoT Data`**.

### 6. Explainable AI Health Risk Prediction Engine
- Computes composite risk score (**0–100**) based on physiological thresholds and known clinical conditions.
- Categorizes risk into: **LOW**, **MEDIUM**, **HIGH**, **CRITICAL**.
- Produces explicit clinical explanation bullet points (e.g., *Mild Hypoxia: SpO2 reading is low at 91%*, *Stage 2 Hypertension: BP elevated at 161/102 mmHg*).
- Transparent educational disclaimer included. Ready for PyTorch/TensorFlow ONNX models.

### 7. Medicines & Adherence Reminders
- **Patient Schedule:** Daily medication tracking across Morning, Afternoon, Evening, and Night intervals.
- **Adherence Logging:** One-click "Took Dose" or "Missed" recording with adherence percentage metric calculation.
- **Alert Testing:** Direct "Test Alert" trigger sending reminder notifications to the notification bell.

### 8. Digital Prescriptions & E-Prescribing
- **Doctor Rx Generator:** Licensed physicians issue prescriptions with dynamic medicine rows, dosages, frequencies, and duration.
- **Auto-Schedule Sync:** Checkbox to automatically create medicine reminders in the patient's portal upon prescription creation.
- **Patient E-Prescription Viewer:** Certified digital Rx view with print / PDF simulation.

### 9. Electronic Medical Records (EMR)
- **Lab & Diagnostic Files:** Patients and doctors can log diagnostic summaries, CBC reports, scan notes, and clinical files.
- **Audit Trails:** Tracks date of test, recording physician, vitals at capture, and laboratory observations.

### 10. Doctor-Patient Direct Messaging
- **Real-Time Messenger:** Direct encrypted communication channel between patients and attending specialists.
- **Dual Delivery:** Real-time WebSockets with a 5-second polling fallback ensuring instant message delivery in any network configuration.

### 11. Interactive Telemedicine Consultation Room
- **High-Fidelity Video Suite:** `/consultation/:roomId` provides interactive camera, microphone, screen sharing simulation, in-call chat, and live patient telemetry HUD.

### 12. Clinical Analytics & Practice Outcomes
- **Visual Recharts Dashboards:** Doctor analytics displaying patient AI health risk tier distribution (donut chart), consultation volume trends (bar chart), and cohort adherence tracking (area chart).

### 13. Emergency SOS Dispatch & Trauma Response
- **One-Click SOS Broadcast:** Patient distress signal broadcasting live GPS coordinates, vital telemetry, and primary emergency contacts.
- **Doctor Dispatch Command Center:** Attending physicians receive critical alerts, acknowledge paramedic dispatch, and record clinical resolution notes.

### 14. Admin Governance & Compliance
- **Account Management:** User table with role filtering and one-click active/suspended status toggling.
- **Institutional Audit Trail:** Comprehensive emergency dispatch logs and consultation audit trails.

---

## 🧪 Verification & Demonstration Workflow

1. Open [http://localhost:5173](http://localhost:5173) in your browser.
2. Click **Sign In** → click the **Patient** quick-login button (`patient@example.com` / `Patient@123`).
3. On the **Patient Dashboard**:
   - Inspect health cards (Heart Rate, Blood Pressure, SpO2, Temperature, Risk Score).
   - Click **Simulate Wearable Data** in the IoT section and observe telemetry updates.
   - Click **Trigger Abnormal Reading** to see the AI Risk widget transition to **CRITICAL** (100/100) with clinical rationales.
4. Navigate to **Find Doctors** (`/patient/doctors`) → filter by *Cardiologist* → click **Book Visit** → select a slot and submit.
5. In the top navbar, use the **Demo Switcher** to switch to **Doctor** (`doctor@example.com` / `Doctor@123`).
6. On the **Doctor Dashboard**:
   - Review the **Patient Monitoring Table** with risk badges.
   - Navigate to **Appointments** (`/doctor/appointments`) → click **Accept Appointment** or **Reschedule**.
   - Navigate to **Health Monitoring** (`/doctor/monitoring`) → select *Rahul Verma* and view his telemetry trends and AI risk index.
7. Switch to **Admin** (`admin@example.com` / `Admin@123`) to view system-wide stats and toggle user account statuses.

---

## 📜 License
Developed as a B.Tech Computer Science & Engineering Final-Year Major Project. Free to use and modify for academic and educational demonstrations.
