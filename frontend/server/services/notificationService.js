const Notification = require('../models/Notification');

let ioInstance = null;

/**
 * Configure the active Socket.IO server instance
 */
const setSocketIO = (io) => {
  ioInstance = io;
};

/**
 * Universal Notification Dispatcher
 * Saves notification to MongoDB and emits real-time WebSocket event
 */
const createNotification = async ({
  recipientId,
  senderId = null,
  type = 'SYSTEM_INFO',
  title,
  message,
  link = '',
  metadata = {},
}) => {
  try {
    if (!recipientId || !title || !message) {
      console.warn('⚠️ Missing required fields for createNotification', { recipientId, title, message });
      return null;
    }

    const notification = await Notification.create({
      recipientId,
      senderId,
      type,
      title,
      message,
      link,
      metadata,
    });

    const populated = await Notification.findById(notification._id)
      .populate('senderId', 'name email role avatar')
      .lean();

    // Emit real-time notification to user's private socket room
    if (ioInstance) {
      ioInstance.to(`user_${recipientId}`).emit('new_notification', populated);
    }

    return populated;
  } catch (error) {
    console.error('❌ Error creating notification:', error.message);
    return null;
  }
};

module.exports = {
  setSocketIO,
  createNotification,
};
