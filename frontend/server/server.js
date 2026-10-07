require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { setSocketIO } = require('./services/notificationService');

// Route imports
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const healthRoutes = require('./routes/healthRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const recordRoutes = require('./routes/recordRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const messageRoutes = require('./routes/messageRoutes');
const adminRoutes = require('./routes/adminRoutes');
const aiAssistantRoutes = require('./routes/aiAssistantRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// CORS configuration
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: [clientUrl, 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: [clientUrl, 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Configure notification service with Socket.IO instance
setSocketIO(io);

// Socket.IO Room Management & Events
io.on('connection', (socket) => {
  console.log(`⚡ Client connected via WebSocket: ${socket.id}`);

  // User joins their private notification & message room
  socket.on('join_user_room', (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`Socket ${socket.id} joined private room: user_${userId}`);
    }
  });

  // Real-time chat message relay
  socket.on('chat_message', (data) => {
    if (data?.recipientId) {
      io.to(`user_${data.recipientId}`).emit('chat_message_received', data);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Health check endpoint
app.get('/api/healthcheck', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'Smart Healthcare Ecosystem API',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/medical-records', recordRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai-assistant', aiAssistantRoutes);
app.use('/api/ai', aiRoutes);

// Central error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 Smart Healthcare Server running on port ${PORT}`);
  console.log(`🏥 Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 WebSocket server initialized`);
  console.log(`=================================================`);
});
