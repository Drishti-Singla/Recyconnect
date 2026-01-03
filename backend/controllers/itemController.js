const db = require('../config/database');

// Get all items
exports.getAllItems = async (req, res) => {
  try {
    const { 
      category, 
      status, 
      search, 
      limit = 50, 
      offset = 0,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    let query = `
      SELECT i.*, u.username, u.profile_image as user_profile_image,
             EXISTS(SELECT 1 FROM flags WHERE target_type = 'item' AND target_id = i.id AND status IN ('pending', 'reviewed')) as is_flagged,
             EXISTS(SELECT 1 FROM flags WHERE target_type = 'user' AND target_id = i.user_id AND status IN ('pending', 'reviewed')) as user_reported
      FROM items i
      LEFT JOIN users u ON i.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND i.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (category) {
      query += ` AND i.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (search) {
      query += ` AND (i.title ILIKE $${paramIndex} OR i.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Validate sortBy to prevent SQL injection
    const allowedSortFields = ['created_at', 'title', 'category'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const validSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    query += ` ORDER BY i.${validSortBy} ${validSortOrder} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json({ items: result.rows });
  } catch (error) {
    console.error('Get all items error:', error);
    res.status(500).json({ error: 'Failed to get items' });
  }
};

// Get item by ID
exports.getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT i.*, u.username, u.email as user_email, u.phone as user_phone, u.profile_image as user_profile_image
       FROM items i
       LEFT JOIN users u ON i.user_id = u.id
       WHERE i.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ item: result.rows[0] });
  } catch (error) {
    console.error('Get item by ID error:', error);
    res.status(500).json({ error: 'Failed to get item' });
  }
};

// Create new item
exports.createItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      title, 
      description, 
      category, 
      location, 
      image_urls,
      asking_price,
      askingPrice,
      condition
    } = req.body;

    // Support both snake_case and camelCase
    const price = asking_price || askingPrice || null;

    const result = await db.query(
      `INSERT INTO items (user_id, title, description, category, location, image_urls, asking_price, condition, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [userId, title, description, category, location || null, image_urls || [], price, condition || null, 'active']
    );

    res.status(201).json({
      message: 'Item created successfully',
      item: result.rows[0]
    });
  } catch (error) {
    console.error('Create item error:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({ 
      error: 'Failed to create item',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get user's items
exports.getUserItems = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT * FROM items 
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

    res.json({ items: result.rows });
  } catch (error) {
    console.error('Get user items error:', error);
    res.status(500).json({ error: 'Failed to get user items' });
  }
};

// Update item
exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, category, location, image_urls, status, asking_price, askingPrice, condition } = req.body;

    console.log('Update item request:', { id, title, description, category, location, status });

    // Support both snake_case and camelCase for asking_price
    const price = asking_price || askingPrice;

    // Check if item exists and belongs to user
    const checkResult = await db.query(
      'SELECT * FROM items WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Allow admins to update any item, otherwise check ownership
    if (req.user.role !== 'admin' && checkResult.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this item' });
    }

    // Prevent any updates to sold items - sold status is permanent
    if (checkResult.rows[0].status === 'sold') {
      return res.status(400).json({ error: 'Cannot edit sold items. Sold status is permanent.' });
    }

    const result = await db.query(
      `UPDATE items 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           category = COALESCE($3, category),
           location = COALESCE($4, location),
           image_urls = COALESCE($5, image_urls),
           status = COALESCE($6, status),
           asking_price = COALESCE($7, asking_price),
           condition = COALESCE($8, condition),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [title, description, category, location, image_urls, status, price, condition, id]
    );

    console.log('Item updated successfully:', result.rows[0]);

    res.json({
      message: 'Item updated successfully',
      item: result.rows[0]
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
};

// Delete item
exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if item exists and belongs to user
    const checkResult = await db.query(
      'SELECT * FROM items WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Allow admins to delete any item, otherwise check ownership
    if (req.user.role !== 'admin' && checkResult.rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this item' });
    }

    // Prevent deleting sold items
    if (checkResult.rows[0].status === 'sold') {
      return res.status(400).json({ error: 'Cannot delete sold items. Sold items are kept for history.' });
    }

    await db.query('DELETE FROM items WHERE id = $1', [id]);

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
};
