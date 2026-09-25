const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get or create conversation between 2 users
// @route   POST /api/messages/conversations
// @access  Private
const getOrCreateConversation = async (req, res, next) => {
  try {
    const { recipientId, projectId } = req.body;

    if (!recipientId) {
      return res.status(400).json({ success: false, message: 'Recipient ID is required' });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, recipientId] },
      ...(projectId && { project: projectId }),
    }).populate('participants', 'name email avatar role');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user.id, recipientId],
        project: projectId || null,
      });
      conversation = await conversation.populate('participants', 'name email avatar role');
    }

    return res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's conversations list
// @route   GET /api/messages/conversations
// @access  Private
const getMyConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id,
    })
      .populate('participants', 'name email avatar role')
      .populate('project', 'title status')
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: conversations.length,
      conversations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages in conversation
// @route   GET /api/messages/conversations/:conversationId
// @access  Private
const getMessages = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    if (!conversation.participants.some((p) => p.toString() === req.user.id) && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized to view these messages' });
    }

    const messages = await Message.find({ conversation: req.params.conversationId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: req.params.conversationId,
        recipient: req.user.id,
        isRead: false,
      },
      { isRead: true, readAt: new Date() }
    );

    return res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send message (REST endpoint fallback/complement to Socket)
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, recipientId, text, attachments } = req.body;

    if (!conversationId || !recipientId || !text) {
      return res.status(400).json({
        success: false,
        message: 'Please provide conversationId, recipientId and text',
      });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user.id,
      recipient: recipientId,
      text,
      attachments: attachments || [],
    });

    // Update conversation last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: {
        text,
        sender: req.user.id,
        createdAt: new Date(),
      },
    });

    const populated = await Message.findById(message._id).populate('sender', 'name avatar');

    return res.status(201).json({
      success: true,
      message: populated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrCreateConversation,
  getMyConversations,
  getMessages,
  sendMessage,
};
