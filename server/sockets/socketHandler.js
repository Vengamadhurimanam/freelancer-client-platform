const { verifyAccessToken } = require('../config/jwt');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

const socketHandler = (io) => {
  // Middleware: authenticate socket connection
  io.use((socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie;
      let token = socket.handshake.auth?.token;

      if (!token && cookieHeader) {
        const cookies = Object.fromEntries(
          cookieHeader.split('; ').map((c) => c.split('='))
        );
        token = cookies.accessToken;
      }

      if (token) {
        try {
          const decoded = verifyAccessToken(token);
          socket.user = decoded;
        } catch {
          // Token expired or invalid, continue as unauthenticated or allow fallback
        }
      }
      next();
    } catch {
      next();
    }
  });

  const onlineUsers = new Map(); // userId -> socketId

  io.on('connection', (socket) => {
    const userId = socket.handshake.query?.userId || socket.user?.id;

    if (userId) {
      onlineUsers.set(userId.toString(), socket.id);
      io.emit('user_status_changed', {
        userId: userId.toString(),
        isOnline: true,
      });
    }

    // Join conversation room
    socket.on('join_conversation', ({ conversationId }) => {
      if (conversationId) {
        socket.join(`conv_${conversationId}`);
      }
    });

    // Leave conversation room
    socket.on('leave_conversation', ({ conversationId }) => {
      if (conversationId) {
        socket.leave(`conv_${conversationId}`);
      }
    });

    // Send chat message
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, senderId, recipientId, text, attachments } = data;

        if (!conversationId || !senderId || !recipientId || !text) {
          return;
        }

        const message = await Message.create({
          conversation: conversationId,
          sender: senderId,
          recipient: recipientId,
          text,
          attachments: attachments || [],
        });

        // Update conversation's last message
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: {
            text,
            sender: senderId,
            createdAt: new Date(),
          },
        });

        const populatedMsg = await Message.findById(message._id).populate('sender', 'name avatar');

        // Broadcast to conversation room
        io.to(`conv_${conversationId}`).emit('new_message', populatedMsg);

        // Also notify recipient directly if online
        const recipientSocketId = onlineUsers.get(recipientId.toString());
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('message_notification', {
            conversationId,
            message: populatedMsg,
          });
        }
      } catch (err) {
        console.error('[Socket Send Message Error]:', err.message);
      }
    });

    // Typing indicators
    socket.on('typing_start', ({ conversationId, userId, userName }) => {
      socket.to(`conv_${conversationId}`).emit('user_typing', {
        conversationId,
        userId,
        userName,
        isTyping: true,
      });
    });

    socket.on('typing_stop', ({ conversationId, userId }) => {
      socket.to(`conv_${conversationId}`).emit('user_typing', {
        conversationId,
        userId,
        isTyping: false,
      });
    });

    // Check user online status
    socket.on('check_online', ({ userId }, callback) => {
      const isOnline = onlineUsers.has(userId.toString());
      if (typeof callback === 'function') {
        callback({ isOnline });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      if (userId) {
        onlineUsers.delete(userId.toString());
        io.emit('user_status_changed', {
          userId: userId.toString(),
          isOnline: false,
        });
      }
    });
  });
};

module.exports = socketHandler;
