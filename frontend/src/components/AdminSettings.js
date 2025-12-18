import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { userAPI } from '../services/api';

function AdminSettings() {
  const { currentColors } = useTheme();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordVisibility, setPasswordVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const response = await userAPI.getProfile();
      const userData = response.user || response;
      setUser(userData);
      setEditFormData({
        name: userData.username || userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        bio: userData.bio || ''
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editFormData.name || !editFormData.email) {
      setUpdateMessage('❌ Name and email are required');
      setTimeout(() => setUpdateMessage(''), 3000);
      return;
    }

    if (editFormData.phone && editFormData.phone.length !== 10) {
      setUpdateMessage('❌ Phone number must be exactly 10 digits');
      setTimeout(() => setUpdateMessage(''), 3000);
      return;
    }

    setUpdateLoading(true);
    setUpdateMessage('');

    try {
      const updateData = {
        username: editFormData.name,
        phone: editFormData.phone,
        bio: editFormData.bio,
      };
      
      await userAPI.updateProfile(updateData);
      
      const refreshedUserResponse = await userAPI.getProfile();
      const refreshedUser = refreshedUserResponse.user || refreshedUserResponse;
      
      setUser({
        ...refreshedUser,
        name: refreshedUser.username || refreshedUser.name
      });

      // Update sessionStorage/localStorage
      const storedUser = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user'));
      const updatedUser = {
        ...storedUser,
        username: refreshedUser.username,
        name: refreshedUser.username,
        phone: refreshedUser.phone,
        bio: refreshedUser.bio
      };
      
      if (sessionStorage.getItem('user')) {
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      setUpdateMessage('✅ Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setUpdateMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setUpdateMessage('❌ Failed to update profile. Please try again.');
      setTimeout(() => setUpdateMessage(''), 3000);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordMessage('❌ All fields are required');
      setTimeout(() => setPasswordMessage(''), 3000);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage('❌ New passwords do not match');
      setTimeout(() => setPasswordMessage(''), 3000);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage('❌ New password must be at least 6 characters');
      setTimeout(() => setPasswordMessage(''), 3000);
      return;
    }

    setPasswordLoading(true);
    setPasswordMessage('');

    try {
      await userAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setPasswordMessage('✅ Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowChangePassword(false);
      setTimeout(() => setPasswordMessage(''), 3000);
    } catch (error) {
      console.error('Error changing password:', error);
      if (error.message && error.message.includes('Current password is incorrect')) {
        setPasswordMessage('❌ Current password is incorrect');
      } else {
        setPasswordMessage('❌ Failed to change password. Please try again.');
      }
      setTimeout(() => setPasswordMessage(''), 3000);
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={{ padding: '20px', color: currentColors.text }}>
        Loading settings...
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ color: currentColors.text, margin: 0 }}>Admin Settings</h2>
        <p style={{ color: currentColors.textSecondary, fontSize: '14px', marginTop: '5px' }}>
          Manage your admin account settings
        </p>
      </div>

      {/* Profile Information Card */}
      <div style={{
        backgroundColor: currentColors.surface,
        padding: '20px',
        borderRadius: '8px',
        border: `1px solid ${currentColors.border}`,
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: currentColors.text, margin: 0 }}>Profile Information</h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                padding: '8px 16px',
                backgroundColor: currentColors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ✏️ Edit Profile
            </button>
          )}
        </div>

        {!isEditing ? (
          <div style={{ display: 'grid', gap: '15px' }}>
            <div>
              <strong style={{ color: currentColors.text }}>Name:</strong>
              <p style={{ color: currentColors.textSecondary, margin: '5px 0 0 0' }}>
                {user.username || user.name || 'Not set'}
              </p>
            </div>
            <div>
              <strong style={{ color: currentColors.text }}>Email:</strong>
              <p style={{ color: currentColors.textSecondary, margin: '5px 0 0 0' }}>
                {user.email}
              </p>
            </div>
            <div>
              <strong style={{ color: currentColors.text }}>Phone:</strong>
              <p style={{ color: currentColors.textSecondary, margin: '5px 0 0 0' }}>
                {user.phone || 'Not set'}
              </p>
            </div>
            <div>
              <strong style={{ color: currentColors.text }}>Role:</strong>
              <p style={{ color: currentColors.textSecondary, margin: '5px 0 0 0' }}>
                <span style={{
                  backgroundColor: '#3742fa20',
                  color: '#3742fa',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  Administrator
                </span>
              </p>
            </div>
            <div>
              <strong style={{ color: currentColors.text }}>Bio:</strong>
              <p style={{ color: currentColors.textSecondary, margin: '5px 0 0 0', fontStyle: 'italic' }}>
                {user.bio || 'No bio added'}
              </p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            <div>
              <label style={{ color: currentColors.text, display: 'block', marginBottom: '5px' }}>
                Name:
              </label>
              <input
                type="text"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: `1px solid ${currentColors.border}`,
                  backgroundColor: currentColors.background,
                  color: currentColors.text,
                  fontSize: '14px'
                }}
              />
            </div>
            <div>
              <label style={{ color: currentColors.text, display: 'block', marginBottom: '5px' }}>
                Email: <span style={{ color: currentColors.textSecondary, fontSize: '12px' }}>(cannot be changed)</span>
              </label>
              <input
                type="email"
                value={editFormData.email}
                disabled
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: `1px solid ${currentColors.border}`,
                  backgroundColor: currentColors.border,
                  color: currentColors.textSecondary,
                  fontSize: '14px',
                  cursor: 'not-allowed'
                }}
              />
            </div>
            <div>
              <label style={{ color: currentColors.text, display: 'block', marginBottom: '5px' }}>
                Phone:
              </label>
              <input
                type="tel"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                placeholder="10-digit phone number"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: `1px solid ${currentColors.border}`,
                  backgroundColor: currentColors.background,
                  color: currentColors.text,
                  fontSize: '14px'
                }}
              />
            </div>
            <div>
              <label style={{ color: currentColors.text, display: 'block', marginBottom: '5px' }}>
                Bio:
              </label>
              <textarea
                value={editFormData.bio}
                onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: `1px solid ${currentColors.border}`,
                  backgroundColor: currentColors.background,
                  color: currentColors.text,
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            {updateMessage && (
              <div style={{
                padding: '10px',
                borderRadius: '6px',
                backgroundColor: updateMessage.includes('✅') ? '#2ed57320' : '#ff475720',
                color: updateMessage.includes('✅') ? '#2ed573' : '#ff4757',
                fontSize: '14px'
              }}>
                {updateMessage}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                onClick={handleUpdateProfile}
                disabled={updateLoading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: currentColors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: updateLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  opacity: updateLoading ? 0.6 : 1
                }}
              >
                {updateLoading ? 'Saving...' : '💾 Save Changes'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditFormData({
                    name: user.username || user.name || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    bio: user.bio || ''
                  });
                  setUpdateMessage('');
                }}
                disabled={updateLoading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: currentColors.border,
                  color: currentColors.text,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: updateLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Password & Security Card */}
      <div style={{
        backgroundColor: currentColors.surface,
        padding: '20px',
        borderRadius: '8px',
        border: `1px solid ${currentColors.border}`,
        marginBottom: '20px'
      }}>
        <h3 style={{ color: currentColors.text, marginBottom: '20px' }}>Password & Security</h3>
        
        {!showChangePassword ? (
          <button
            onClick={() => setShowChangePassword(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: currentColors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🔒 Change Password
          </button>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            <div>
              <label style={{ color: currentColors.text, display: 'block', marginBottom: '5px' }}>
                Current Password:
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={passwordVisibility.currentPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    paddingRight: '40px',
                    borderRadius: '6px',
                    border: `1px solid ${currentColors.border}`,
                    backgroundColor: currentColors.background,
                    color: currentColors.text,
                    fontSize: '14px'
                  }}
                />
                <button
                  onClick={() => setPasswordVisibility({ ...passwordVisibility, currentPassword: !passwordVisibility.currentPassword })}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '18px'
                  }}
                >
                  {passwordVisibility.currentPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div>
              <label style={{ color: currentColors.text, display: 'block', marginBottom: '5px' }}>
                New Password:
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={passwordVisibility.newPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    paddingRight: '40px',
                    borderRadius: '6px',
                    border: `1px solid ${currentColors.border}`,
                    backgroundColor: currentColors.background,
                    color: currentColors.text,
                    fontSize: '14px'
                  }}
                />
                <button
                  onClick={() => setPasswordVisibility({ ...passwordVisibility, newPassword: !passwordVisibility.newPassword })}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '18px'
                  }}
                >
                  {passwordVisibility.newPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div>
              <label style={{ color: currentColors.text, display: 'block', marginBottom: '5px' }}>
                Confirm New Password:
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={passwordVisibility.confirmPassword ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    paddingRight: '40px',
                    borderRadius: '6px',
                    border: `1px solid ${currentColors.border}`,
                    backgroundColor: currentColors.background,
                    color: currentColors.text,
                    fontSize: '14px'
                  }}
                />
                <button
                  onClick={() => setPasswordVisibility({ ...passwordVisibility, confirmPassword: !passwordVisibility.confirmPassword })}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '18px'
                  }}
                >
                  {passwordVisibility.confirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {passwordMessage && (
              <div style={{
                padding: '10px',
                borderRadius: '6px',
                backgroundColor: passwordMessage.includes('✅') ? '#2ed57320' : '#ff475720',
                color: passwordMessage.includes('✅') ? '#2ed573' : '#ff4757',
                fontSize: '14px'
              }}>
                {passwordMessage}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                onClick={handleChangePassword}
                disabled={passwordLoading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: currentColors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: passwordLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  opacity: passwordLoading ? 0.6 : 1
                }}
              >
                {passwordLoading ? 'Changing...' : '🔒 Change Password'}
              </button>
              <button
                onClick={() => {
                  setShowChangePassword(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setPasswordMessage('');
                }}
                disabled={passwordLoading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: currentColors.border,
                  color: currentColors.text,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: passwordLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Account Information */}
      <div style={{
        backgroundColor: currentColors.surface,
        padding: '20px',
        borderRadius: '8px',
        border: `1px solid ${currentColors.border}`
      }}>
        <h3 style={{ color: currentColors.text, marginBottom: '15px' }}>Account Information</h3>
        <div style={{ display: 'grid', gap: '10px', color: currentColors.textSecondary, fontSize: '14px' }}>
          <div>
            <strong style={{ color: currentColors.text }}>Account Created:</strong> {new Date(user.created_at).toLocaleDateString()}
          </div>
          <div>
            <strong style={{ color: currentColors.text }}>Account Status:</strong>{' '}
            <span style={{
              backgroundColor: '#2ed57320',
              color: '#2ed573',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '12px'
            }}>
              Active
            </span>
          </div>
          <div style={{ marginTop: '10px', padding: '15px', backgroundColor: currentColors.background, borderRadius: '6px' }}>
            <p style={{ margin: 0, color: currentColors.text, fontSize: '13px' }}>
              ℹ️ <strong>Note:</strong> Admin accounts cannot be deleted from the settings page. For account deletion, please contact another administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;
