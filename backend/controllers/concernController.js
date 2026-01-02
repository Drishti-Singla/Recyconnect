const db = require('../config/database');
const { sendFeedbackEmail, sendConcernEmail } = require('../utils/emailService');

// Create new concern
exports.createConcern = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      title, 
      description, 
      concernType, 
      relatedId, 
      priority,
      image_urls
    } = req.body;

    const result = await db.query(
      `INSERT INTO user_concerns (user_id, title, description, concern_type, related_id, priority, image_urls, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [userId, title, description, concernType, relatedId || null, priority || 'medium', image_urls || [], 'pending']
    );

    // Get user info for email notification
    const userResult = await db.query(
      'SELECT username, email FROM users WHERE id = $1',
      [userId]
    );
    const user = userResult.rows[0];

    // Send email notification to admin
    const emailData = {
      title,
      description,
      concernType,
      priority: priority || 'medium',
      username: user.username,
      email: user.email,
      imageUrls: image_urls || []
    };

    // Send email based on type (feedback vs concern)
    if (concernType === 'general' && title === 'User Feedback') {
      await sendFeedbackEmail(emailData);
    } else {
      await sendConcernEmail(emailData);
    }

    res.status(201).json({
      message: 'Concern submitted successfully',
      concern: result.rows[0]
    });
  } catch (error) {
    console.error('Create concern error:', error);
    res.status(500).json({ error: 'Failed to create concern' });
  }
};

// Get user's own concerns
exports.getUserConcerns = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT * FROM user_concerns 
      WHERE user_id = $1
    `;
    const params = [userId];
    let paramIndex = 2;

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json({ concerns: result.rows });
  } catch (error) {
    console.error('Get user concerns error:', error);
    res.status(500).json({ error: 'Failed to get user concerns' });
  }
};

// Get all concerns (Admin only)
exports.getAllConcerns = async (req, res) => {
  try {
    const { 
      status, 
      concernType, 
      priority,
      search, 
      limit = 50, 
      offset = 0 
    } = req.query;

    let query = `
      SELECT c.*, u.username, u.email as user_email
      FROM user_concerns c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND c.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (concernType) {
      query += ` AND c.concern_type = $${paramIndex}`;
      params.push(concernType);
      paramIndex++;
    }

    if (priority) {
      query += ` AND c.priority = $${paramIndex}`;
      params.push(priority);
      paramIndex++;
    }

    if (search) {
      query += ` AND (c.title ILIKE $${paramIndex} OR c.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY 
      CASE c.priority 
        WHEN 'high' THEN 1 
        WHEN 'medium' THEN 2 
        WHEN 'low' THEN 3 
      END,
      c.created_at DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json({ concerns: result.rows });
  } catch (error) {
    console.error('Get all concerns error:', error);
    res.status(500).json({ error: 'Failed to get concerns' });
  }
};

// Get concern by ID
exports.getConcernById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await db.query(
      `SELECT c.*, u.username, u.email as user_email
       FROM user_concerns c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Concern not found' });
    }

    // Only allow user to see their own concerns, or admin to see all
    if (req.user.role !== 'admin' && result.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to view this concern' });
    }

    res.json({ concern: result.rows[0] });
  } catch (error) {
    console.error('Get concern by ID error:', error);
    res.status(500).json({ error: 'Failed to get concern' });
  }
};

// Update concern status (Admin or owner can update)
exports.updateConcernStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    // Check if concern exists
    const checkResult = await db.query(
      'SELECT * FROM user_concerns WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Concern not found' });
    }

    // Only admin or concern owner can update
    if (req.user.role !== 'admin' && checkResult.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this concern' });
    }

    const result = await db.query(
      `UPDATE user_concerns 
       SET status = COALESCE($1, status),
           admin_notes = COALESCE($2, admin_notes),
           resolved_at = CASE WHEN $1 = 'resolved' THEN CURRENT_TIMESTAMP ELSE resolved_at END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [status, adminNotes, id]
    );

    res.json({
      message: 'Concern updated successfully',
      concern: result.rows[0]
    });
  } catch (error) {
    console.error('Update concern status error:', error);
    res.status(500).json({ error: 'Failed to update concern' });
  }
};

// Delete concern
exports.deleteConcern = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if concern exists
    const checkResult = await db.query(
      'SELECT * FROM user_concerns WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Concern not found' });
    }

    // Only admin or concern owner can delete
    if (req.user.role !== 'admin' && checkResult.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this concern' });
    }

    await db.query('DELETE FROM user_concerns WHERE id = $1', [id]);

    res.json({ message: 'Concern deleted successfully' });
  } catch (error) {
    console.error('Delete concern error:', error);
    res.status(500).json({ error: 'Failed to delete concern' });
  }
};
