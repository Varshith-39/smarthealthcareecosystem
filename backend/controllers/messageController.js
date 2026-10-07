const Message = require('../models/Message');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const { recipientId, messageText } = req.body;
    const senderId = req.user._id;

    if (!recipientId || !messageText) {
      return res.status(400).json({ success: false, message: 'Please provide recipient and message text' });
    }

    const message = await Message.create({
      senderId,
      recipientId,
      messageText,
    });

    const populated = await Message.findById(message._id)
      .populate('senderId', 'name email role avatar')
      .populate('recipientId', 'name email role avatar');

    // Send notification to recipient
    await createNotification({
      recipientId,
      senderId,
      type: 'MESSAGE_RECEIVED',
      title: `Message from ${req.user.name}`,
      message: messageText.length > 60 ? `${messageText.substring(0, 60)}...` : messageText,
      link: req.user.role === 'DOCTOR' ? '/patient/messages' : '/doctor/messages',
      metadata: { messageId: message._id },
    });

    res.status(201).json({
      success: true,
      message: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages between current user and other user
// @route   GET /api/messages/:userId
// @access  Private
const getConversation = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, recipientId: otherUserId },
        { senderId: otherUserId, recipientId: currentUserId },
      ],
    })
      .populate('senderId', 'name email role avatar')
      .populate('recipientId', 'name email role avatar')
      .sort({ createdAt: 1 });

    // Mark unread messages sent to current user as read
    await Message.updateMany(
      { senderId: otherUserId, recipientId: currentUserId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ success: true, count: messages.length, messages });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent chat contacts
// @route   GET /api/messages/contacts/list
// @access  Private
const getContacts = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;

    // Distinct users from sent or received messages
    const sent = await Message.find({ senderId: currentUserId }).distinct('recipientId');
    const received = await Message.find({ recipientId: currentUserId }).distinct('senderId');

    let contactIds = [...new Set([...sent.map(String), ...received.map(String)])];

    // If no contacts yet, fetch doctors for patient or patients for doctor
    if (contactIds.length === 0) {
      if (req.user.role === 'PATIENT') {
        const doctors = await User.find({ role: 'DOCTOR', isActive: true }).limit(5).distinct('_id');
        contactIds = doctors.map(String);
      } else {
        const patients = await User.find({ role: 'PATIENT', isActive: true }).limit(5).distinct('_id');
        contactIds = patients.map(String);
      }
    }

    const contacts = await User.find({ _id: { $in: contactIds } }).select('name email role phone avatar');

    res.status(200).json({ success: true, contacts });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getContacts,
};
