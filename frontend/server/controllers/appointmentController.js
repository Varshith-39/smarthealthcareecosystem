const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');

const formatDocName = (name) => {
  if (!name) return 'Doctor';
  return name.trim().startsWith('Dr.') ? name.trim() : `Dr. ${name.trim()}`;
};

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Private (Patient)
const createAppointment = async (req, res, next) => {
  try {
    const { doctorId, date, time, reason, notes } = req.body;
    const patientId = req.user._id;

    if (!doctorId || !date || !time) {
      return res.status(400).json({ success: false, message: 'Please provide doctor, date, and time slot' });
    }

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'DOCTOR') {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      date,
      time,
      reason: reason || 'Consultation Request',
      notes: notes || '',
      status: 'PENDING',
    });

    const populated = await Appointment.findById(appointment._id)
      .populate('patientId', 'name email phone avatar')
      .populate('doctorId', 'name email phone avatar');

    // 1. Notify DOCTOR
    await createNotification({
      recipientId: doctorId,
      senderId: patientId,
      type: 'APPOINTMENT_REQUEST',
      title: 'New Appointment Request',
      message: `New consultation request from ${req.user.name} on ${new Date(date).toLocaleDateString()} at ${time}.`,
      link: '/doctor/appointments',
      metadata: { appointmentId: appointment._id },
    });

    // 2. Notify PATIENT
    await createNotification({
      recipientId: patientId,
      senderId: doctorId,
      type: 'APPOINTMENT_REQUEST',
      title: 'Appointment Request Submitted',
      message: `Your appointment request has been sent to ${formatDocName(doctor.name)} for ${new Date(date).toLocaleDateString()} at ${time}.`,
      link: '/patient/appointments',
      metadata: { appointmentId: appointment._id },
    });

    res.status(201).json({
      success: true,
      message: 'Appointment requested successfully',
      appointment: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's appointments (role-aware)
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'PATIENT') {
      query.patientId = req.user._id;
    } else if (req.user.role === 'DOCTOR') {
      query.doctorId = req.user._id;
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email phone avatar')
      .populate('doctorId', 'name email phone avatar')
      .sort({ date: 1, time: 1 });

    res.status(200).json({ success: true, count: appointments.length, appointments });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status (Accept, Reject, Reschedule, Complete)
// @route   PUT /api/appointments/:id/status
// @access  Private (Doctor / Patient / Admin)
const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, doctorNotes, newDate, newTime } = req.body;
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email phone');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const previousStatus = appointment.status;
    if (status) appointment.status = status;
    if (doctorNotes) appointment.doctorNotes = doctorNotes;
    if (newDate) appointment.date = newDate;
    if (newTime) appointment.time = newTime;

    await appointment.save();

    // Trigger bidirectional notifications
    if (status === 'CONFIRMED') {
      await createNotification({
        recipientId: appointment.patientId._id,
        senderId: req.user._id,
        type: 'APPOINTMENT_CONFIRMED',
        title: 'Appointment Confirmed',
        message: `${formatDocName(appointment.doctorId.name)} has confirmed your appointment for ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time}.`,
        link: '/patient/appointments',
        metadata: { appointmentId: appointment._id },
      });
    } else if (status === 'CANCELLED' || status === 'REJECTED') {
      const isDoctorAction = req.user.role === 'DOCTOR';
      const isReject = status === 'REJECTED' || (isDoctorAction && previousStatus === 'PENDING');
      const recipient = isDoctorAction ? appointment.patientId._id : appointment.doctorId._id;

      await createNotification({
        recipientId: recipient,
        senderId: req.user._id,
        type: isReject ? 'APPOINTMENT_REJECTED' : 'APPOINTMENT_CANCELLED',
        title: isReject ? 'Appointment Request Declined' : 'Appointment Cancelled',
        message: isDoctorAction
          ? `${formatDocName(appointment.doctorId.name)} was unable to accept your consultation scheduled for ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time}.`
          : `The appointment scheduled for ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time} was cancelled by ${req.user.name}.`,
        link: isDoctorAction ? '/patient/appointments' : '/doctor/appointments',
        metadata: { appointmentId: appointment._id },
      });
    } else if (status === 'RESCHEDULED') {
      await createNotification({
        recipientId: appointment.patientId._id,
        senderId: req.user._id,
        type: 'APPOINTMENT_RESCHEDULED',
        title: 'Appointment Rescheduled',
        message: `Your appointment with ${formatDocName(appointment.doctorId.name)} has been rescheduled to ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time}.`,
        link: '/patient/appointments',
        metadata: { appointmentId: appointment._id },
      });
    } else if (status === 'COMPLETED') {
      await createNotification({
        recipientId: appointment.patientId._id,
        senderId: req.user._id,
        type: 'APPOINTMENT_COMPLETED',
        title: 'Consultation Completed',
        message: `Your consultation with ${formatDocName(appointment.doctorId.name)} is marked as completed. You can view your medical notes and prescriptions.`,
        link: '/patient/records',
        metadata: { appointmentId: appointment._id },
      });
    }

    res.status(200).json({
      success: true,
      message: `Appointment status updated from ${previousStatus} to ${status}`,
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  updateAppointmentStatus,
};
