// Socket.io handler for real-time chat functionality
const jwt = require('jsonwebtoken');

// Store online users
const onlineUsers = new Map(); // userId -> socketId

module.exports = (io) => {
  // Middleware to authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userEmail = decoded.email;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`✅ User connected: ${userId} (Socket: ${socket.id})`);

    // Add user to online users
    onlineUsers.set(userId, socket.id);
    socket.join(`user_${userId}`);

    // Broadcast online status
    io.emit('user_online', { userId, online: true });

    // Handle typing indicator
    socket.on('typing', ({ recipientId, isTyping }) => {
      io.to(`user_${recipientId}`).emit('user_typing', {
        userId,
        isTyping
      });
    });

    // Handle chat message
    socket.on('chat_message', async (data) => {
      const { receiver_id, message, item_id } = data;
      const recipientId = receiver_id;
      const content = message;
      const itemId = item_id;
      
      console.log(`💬 Chat message from ${userId} to ${recipientId}: ${content}`);

      try {
        // Save message to database
        const db = require('../config/database');
        const result = await db.query(
          `INSERT INTO chat_messages (sender_id, recipient_id, content, item_id)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [userId, recipientId, content, itemId || null]
        );

        const message = result.rows[0];

        // Send to recipient
        io.to(`user_${recipientId}`).emit('new_chat_message', {
          ...message,
          sender_id: userId
        });

        // Send acknowledgment to sender
        socket.emit('message_sent', {
          ...message,
          status: 'delivered'
        });

      } catch (error) {
        console.error('Error saving chat message:', error);
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });

    // Handle message read receipt
    socket.on('message_read', async ({ messageId, senderId }) => {
      try {
        const db = require('../config/database');
        await db.query(
          `UPDATE chat_messages SET is_read = true, read_at = CURRENT_TIMESTAMP WHERE id = $1`,
          [messageId]
        );

        // Notify sender that message was read
        io.to(`user_${senderId}`).emit('message_read_receipt', {
          messageId,
          readBy: userId,
          readAt: new Date()
        });

      } catch (error) {
        console.error('Error updating message read status:', error);
      }
    });

    // Handle private room joining (for one-on-one chats)
    socket.on('join_chat', ({ otherUserId }) => {
      const roomId = [userId, otherUserId].sort().join('_');
      socket.join(roomId);
      console.log(`User ${userId} joined chat room: ${roomId}`);
    });

    // Handle leaving a chat room
    socket.on('leave_chat', ({ otherUserId }) => {
      const roomId = [userId, otherUserId].sort().join('_');
      socket.leave(roomId);
      console.log(`User ${userId} left chat room: ${roomId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${userId} (Socket: ${socket.id})`);
      onlineUsers.delete(userId);
      
      // Broadcast offline status
      io.emit('user_online', { userId, online: false });
    });

    // Get online users
    socket.on('get_online_users', () => {
      const onlineUserIds = Array.from(onlineUsers.keys());
      socket.emit('online_users', onlineUserIds);
    });

    // Handle call initiation (for future video/voice call feature)
    socket.on('call_user', ({ recipientId, offer }) => {
      io.to(`user_${recipientId}`).emit('incoming_call', {
        callerId: userId,
        offer
      });
    });

    socket.on('answer_call', ({ callerId, answer }) => {
      io.to(`user_${callerId}`).emit('call_answered', {
        answer
      });
    });

    socket.on('ice_candidate', ({ recipientId, candidate }) => {
      io.to(`user_${recipientId}`).emit('ice_candidate', {
        candidate,
        senderId: userId
      });
    });

    socket.on('end_call', ({ recipientId }) => {
      io.to(`user_${recipientId}`).emit('call_ended', {
        userId
      });
    });
  });

  // Return online users map for external use
  return {
    getOnlineUsers: () => Array.from(onlineUsers.keys()),
    isUserOnline: (userId) => onlineUsers.has(userId),
    getUserSocketId: (userId) => onlineUsers.get(userId)
  };
};
