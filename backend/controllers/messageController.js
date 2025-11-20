const db = require('../config/database');

// Send a message
exports.sendMessage = async (req, res) => {
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
      `INSERT INTO messages (sender_id, recipient_id, content, item_id, is_read)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [senderId, recipientId, content, itemId || null, false]
    );

    // Emit socket event for real-time message
    const io = req.app.get('io');
    io.to(`user_${recipientId}`).emit('new_message', result.rows[0]);

    res.status(201).json({
      message: 'Message sent successfully',
      messageData: result.rows[0]
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Get user's conversations (list of users they've chatted with)
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
         (SELECT COUNT(*) FROM messages 
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
         FROM messages
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

// Get conversation with specific user
exports.getConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { userId: otherUserId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const result = await db.query(
      `SELECT m.*, 
              sender.username as sender_username,
              sender.profile_image as sender_profile_image,
              recipient.username as recipient_username,
              recipient.profile_image as recipient_profile_image
       FROM messages m
       JOIN users sender ON m.sender_id = sender.id
       JOIN users recipient ON m.recipient_id = recipient.id
       WHERE (m.sender_id = $1 AND m.recipient_id = $2)
          OR (m.sender_id = $2 AND m.recipient_id = $1)
       ORDER BY m.created_at DESC
       LIMIT $3 OFFSET $4`,
      [userId, otherUserId, limit, offset]
    );

    // Mark messages as read
    await db.query(
      `UPDATE messages 
       SET is_read = true 
       WHERE recipient_id = $1 AND sender_id = $2 AND is_read = false`,
      [userId, otherUserId]
    );

    res.json({ messages: result.rows });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
};

// Get messages for a specific item
exports.getItemMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const result = await db.query(
      `SELECT m.*, 
              sender.username as sender_username,
              sender.profile_image as sender_profile_image,
              recipient.username as recipient_username,
              recipient.profile_image as recipient_profile_image
       FROM messages m
       JOIN users sender ON m.sender_id = sender.id
       JOIN users recipient ON m.recipient_id = recipient.id
       WHERE m.item_id = $1 
         AND (m.sender_id = $2 OR m.recipient_id = $2)
       ORDER BY m.created_at DESC
       LIMIT $3 OFFSET $4`,
      [itemId, userId, limit, offset]
    );

    res.json({ messages: result.rows });
  } catch (error) {
    console.error('Get item messages error:', error);
    res.status(500).json({ error: 'Failed to get item messages' });
  }
};

// Mark message as read
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await db.query(
      `UPDATE messages 
       SET is_read = true 
       WHERE id = $1 AND recipient_id = $2
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found or not authorized' });
    }

    res.json({ message: 'Message marked as read', messageData: result.rows[0] });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
};

// Delete message
exports.deleteMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Only allow sender to delete their own messages
    const result = await db.query(
      'DELETE FROM messages WHERE id = $1 AND sender_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found or not authorized' });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
};

// Get unread messages count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      'SELECT COUNT(*) as count FROM messages WHERE recipient_id = $1 AND is_read = false',
      [userId]
    );

    res.json({ unreadCount: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
};
