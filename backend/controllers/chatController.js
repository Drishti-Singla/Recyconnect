const db = require('../config/database');

// Get user's chat conversations
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `SELECT DISTINCT ON (other_user_id)
         other_user_id,
         u.username,
         u.profile_image,
         m.content as last_message,
         m.created_at as last_message_time,
         m.is_read,
         (SELECT COUNT(*) FROM chat_messages 
          WHERE recipient_id = $1 
          AND sender_id = other_user_id 
          AND is_read = false) as unread_count
       FROM (
         SELECT 
           CASE 
             WHEN sender_id = $1 THEN recipient_id 
             ELSE sender_id 
           END as other_user_id,
           id, content, is_read, created_at
         FROM chat_messages
         WHERE sender_id = $1 OR recipient_id = $1
       ) m
       JOIN users u ON u.id = m.other_user_id
       ORDER BY other_user_id, m.created_at DESC`,
      [userId]
    );

    res.json({ conversations: result.rows });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
};

// Get chat messages between two users
exports.getChatMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { userId: otherUserId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const result = await db.query(
      `SELECT cm.*, 
              sender.username as sender_username,
              sender.profile_image as sender_profile_image,
              recipient.username as recipient_username,
              recipient.profile_image as recipient_profile_image
       FROM chat_messages cm
       JOIN users sender ON cm.sender_id = sender.id
       JOIN users recipient ON cm.recipient_id = recipient.id
       WHERE (cm.sender_id = $1 AND cm.recipient_id = $2)
          OR (cm.sender_id = $2 AND cm.recipient_id = $1)
       ORDER BY cm.created_at ASC
       LIMIT $3 OFFSET $4`,
      [userId, otherUserId, limit, offset]
    );

    // Mark messages as read
    await db.query(
      `UPDATE chat_messages 
       SET is_read = true, read_at = CURRENT_TIMESTAMP
       WHERE recipient_id = $1 AND sender_id = $2 AND is_read = false`,
      [userId, otherUserId]
    );

    res.json({ messages: result.rows });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ error: 'Failed to get chat messages' });
  }
};

// Send chat message (REST endpoint - also handled by Socket.io)
exports.sendChatMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { recipientId, content, itemId } = req.body;

    // Check if recipient exists
    const recipientCheck = await db.query(
      'SELECT id FROM users WHERE id = $1',
      [recipientId]
    );

    if (recipientCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    const result = await db.query(
      `INSERT INTO chat_messages (sender_id, recipient_id, content, item_id, is_read)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [senderId, recipientId, content, itemId || null, false]
    );

    // Emit socket event for real-time delivery
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${recipientId}`).emit('new_chat_message', result.rows[0]);
    }

    res.status(201).json({
      message: 'Message sent successfully',
      chatMessage: result.rows[0]
    });
  } catch (error) {
    console.error('Send chat message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Mark message as read
exports.markMessageAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await db.query(
      `UPDATE chat_messages 
       SET is_read = true, read_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND recipient_id = $2
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found or not authorized' });
    }

    // Emit socket event for read receipt
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${result.rows[0].sender_id}`).emit('message_read_receipt', {
        messageId: id,
        readBy: userId,
        readAt: result.rows[0].read_at
      });
    }

    res.json({ 
      message: 'Message marked as read', 
      chatMessage: result.rows[0] 
    });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
};

// Delete chat message
exports.deleteChatMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Only allow sender to delete their own messages
    const result = await db.query(
      'DELETE FROM chat_messages WHERE id = $1 AND sender_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found or not authorized' });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete chat message error:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
};

// Get unread messages count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      'SELECT COUNT(*) as count FROM chat_messages WHERE recipient_id = $1 AND is_read = false',
      [userId]
    );

    res.json({ unreadCount: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
};
