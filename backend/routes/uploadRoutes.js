const express = require('express');
const router = express.Router();
const { cloudinary } = require('../config/cloudinary');
const { authenticateToken } = require('../middleware/auth');

// Generate signed upload URL for client-side upload
router.post('/signature', authenticateToken, (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = 'recyconnect';

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        folder: folder,
      },
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder
    });
  } catch (error) {
    console.error('Signature generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate upload signature',
      details: error.message 
    });
  }
});

// Legacy single image upload (kept for backward compatibility, but not recommended for Vercel)
router.post('/image', authenticateToken, (req, res) => {
  rLegacy multiple images upload (kept for backward compatibility, but not recommended for Vercel)
router.post('/images', authenticateToken, (req, res) => {
  res.status(501).json({ 
    error: 'Direct server upload not supported on serverless deployment',
    message: 'Please use client-side upload with /upload/signature endpoint' catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ 
        error: 'Failed to upload images',
        details: error.message 
      });
    }
  });
});

module.exports = router;
