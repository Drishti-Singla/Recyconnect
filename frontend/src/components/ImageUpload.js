import React, { useState, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

function ImageUpload({ 
  onImageSelect, 
  existingImage = null, 
  onImageRemove,
  label = "Upload Image",
  required = false 
}) {
  const { currentColors } = useTheme();
  const [preview, setPreview] = useState(existingImage);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setError('');
    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary via backend
      const formData = new FormData();
      formData.append('image', file);

      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8080/api/upload/image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      onImageSelect(data.imageUrl); // Pass the Cloudinary URL to parent
      
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload image. Please try again.');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onImageRemove) {
      onImageRemove();
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ 
        display: 'block', 
        marginBottom: '8px', 
        color: currentColors.text,
        fontWeight: '500'
      }}>
        {label} {required && <span style={{ color: '#ff4757' }}>*</span>}
      </label>
      
      {!preview ? (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            id="image-upload-input"
          />
          <label
            htmlFor="image-upload-input"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 20px',
              border: `2px dashed ${currentColors.border}`,
              borderRadius: '10px',
              cursor: 'pointer',
              backgroundColor: currentColors.surface,
              transition: 'all 0.3s ease',
              ':hover': {
                borderColor: '#007bff',
                backgroundColor: currentColors.hover
              }
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#007bff';
              e.currentTarget.style.backgroundColor = currentColors.hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = currentColors.border;
              e.currentTarget.style.backgroundColor = currentColors.surface;
            }}
          >
            <span style={{ fontSize: '48px', marginBottom: '10px' }}>📷</span>
            <span style={{ color: currentColors.text, fontWeight: '500', marginBottom: '5px' }}>
              Click to upload image
            </span>
            <span style={{ color: currentColors.textSecondary, fontSize: '13px' }}>
              PNG, JPG, GIF up to 5MB
            </span>
          </label>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          <img
            src={preview}
            alt="Preview"
            style={{
              width: '100%',
              maxHeight: '300px',
              objectFit: 'cover',
              borderRadius: '10px',
              border: `1px solid ${currentColors.border}`
            }}
          />
          <button
            type="button"
            onClick={handleRemove}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              backgroundColor: '#ff4757',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {uploading && (
        <div style={{ 
          marginTop: '10px', 
          color: '#007bff',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ 
            display: 'inline-block',
            width: '16px',
            height: '16px',
            border: '2px solid #007bff',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          Uploading...
        </div>
      )}

      {error && (
        <div style={{ 
          marginTop: '10px', 
          color: '#ff4757',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default ImageUpload;
