const db = require('../config/database');

// Get all reported items (lost/found)
exports.getAllReportedItems = async (req, res) => {
  try {
    const { 
      report_type, 
      status, // Removed default value - let admin see all statuses
      category,
      search, 
      limit = 50, 
      offset = 0 
    } = req.query;

    let query = `
      SELECT r.*, u.username, u.phone as user_phone, u.profile_image as user_profile_image
      FROM reported_items r
      LEFT JOIN users u ON r.reporter_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    // Only filter by status if explicitly provided (not empty string)
    if (status && status.trim() !== '') {
      query += ` AND r.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (report_type) {
      query += ` AND r.report_type = $${paramIndex}`;
      params.push(report_type);
      paramIndex++;
    }

    if (category) {
      query += ` AND r.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (search) {
      query += ` AND (r.title ILIKE $${paramIndex} OR r.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY r.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json({ reportedItems: result.rows });
  } catch (error) {
    console.error('Get all reported items error:', error);
    res.status(500).json({ error: 'Failed to get reported items' });
  }
};

// Get reported item by ID
exports.getReportedItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT r.*, u.username, u.email as reporter_email, u.phone as reporter_phone, u.profile_image as user_profile_image
       FROM reported_items r
       LEFT JOIN users u ON r.reporter_id = u.id
       WHERE r.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reported item not found' });
    }

    res.json({ reportedItem: result.rows[0] });
  } catch (error) {
    console.error('Get reported item by ID error:', error);
    res.status(500).json({ error: 'Failed to get reported item' });
  }
};

// Create new reported item
exports.createReportedItem = async (req, res) => {
  try {
    const reporterId = req.user.id;
    const { 
      report_type, // 'lost' or 'found'
      title, 
      description, 
      category,
      location, 
      date_lost_found,
      image_urls 
    } = req.body;

    console.log('Creating reported item with data:', { report_type, title, category, location });

    // Additional validation to ensure required fields are present
    if (!location || location.trim() === '') {
      return res.status(400).json({ error: 'Location is required' });
    }
    
    if (!report_type || !['lost', 'found'].includes(report_type)) {
      return res.status(400).json({ error: 'Valid report type (lost or found) is required' });
    }

    const result = await db.query(
      `INSERT INTO reported_items (reporter_id, report_type, title, description, category, location, date_lost_found, image_urls, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [reporterId, report_type, title, description, category, location, date_lost_found, image_urls || [], 'active']
    );

    console.log('Created item:', result.rows[0]);

    res.status(201).json({
      message: 'Reported item created successfully',
      reportedItem: result.rows[0]
    });
  } catch (error) {
    console.error('Create reported item error:', error);
    res.status(500).json({ error: 'Failed to create reported item' });
  }
};

// Get user's reported items
exports.getUserReportedItems = async (req, res) => {
  try {
    const reporterId = req.user.id;
    const { report_type, status, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT * FROM reported_items 
      WHERE reporter_id = $1
    `;
    const params = [reporterId];
    let paramIndex = 2;

    if (report_type) {
      query += ` AND report_type = $${paramIndex}`;
      params.push(report_type);
      paramIndex++;
    }

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json({ reportedItems: result.rows });
  } catch (error) {
    console.error('Get user reported items error:', error);
    res.status(500).json({ error: 'Failed to get user reported items' });
  }
};

// Update reported item
exports.updateReportedItem = async (req, res) => {
  try {
    const { id } = req.params;
    const reporterId = req.user.id;
    const { title, description, category, location, date_lost_found, image_urls, status } = req.body;

    // Check if item exists and belongs to user
    const checkResult = await db.query(
      'SELECT * FROM reported_items WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Reported item not found' });
    }

    if (req.user.role !== 'admin' && checkResult.rows[0].reporter_id !== reporterId) {
      return res.status(403).json({ error: 'Not authorized to update this item' });
    }

    // Prevent editing resolved or closed items
    if (checkResult.rows[0].status === 'resolved' || checkResult.rows[0].status === 'closed') {
      return res.status(400).json({ error: 'Cannot edit resolved or closed items' });
    }

    const result = await db.query(
      `UPDATE reported_items 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           category = COALESCE($3, category),
           location = COALESCE($4, location),
           date_lost_found = COALESCE($5, date_lost_found),
           image_urls = COALESCE($6, image_urls),
           status = COALESCE($7, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [title, description, category, location, date_lost_found, image_urls, status, id]
    );

    res.json({
      message: 'Reported item updated successfully',
      reportedItem: result.rows[0]
    });
  } catch (error) {
    console.error('Update reported item error:', error);
    res.status(500).json({ error: 'Failed to update reported item' });
  }
};

// Update reported item status
exports.updateReportedItemStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Check if item exists
    const checkResult = await db.query(
      'SELECT * FROM reported_items WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Reported item not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && checkResult.rows[0].reporter_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this item' });
    }

    const result = await db.query(
      `UPDATE reported_items 
       SET status = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    res.json({
      message: 'Reported item status updated successfully',
      reportedItem: result.rows[0]
    });
  } catch (error) {
    console.error('Update reported item status error:', error);
    res.status(500).json({ error: 'Failed to update reported item status' });
  }
};

// Delete reported item
exports.deleteReportedItem = async (req, res) => {
  try {
    const { id } = req.params;
    const reporterId = req.user.id;

    // Check if item exists and belongs to user
    const checkResult = await db.query(
      'SELECT * FROM reported_items WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Reported item not found' });
    }

    if (req.user.role !== 'admin' && checkResult.rows[0].reporter_id !== reporterId) {
      return res.status(403).json({ error: 'Not authorized to delete this item' });
    }

    // Prevent deleting resolved or closed items
    if (checkResult.rows[0].status === 'resolved' || checkResult.rows[0].status === 'closed') {
      return res.status(400).json({ error: 'Cannot delete resolved or closed items' });
    }

    await db.query('DELETE FROM reported_items WHERE id = $1', [id]);

    res.json({ message: 'Reported item deleted successfully' });
  } catch (error) {
    console.error('Delete reported item error:', error);
    res.status(500).json({ error: 'Failed to delete reported item' });
  }
};
