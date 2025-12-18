import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { userAPI, messageAPI } from '../services/api';

function AdminUsers() {
  const { currentColors } = useTheme();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  // Sort state for user table - defaults to 'role' to show admins first
  const [sortBy, setSortBy] = useState('role');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageUser, setMessageUser] = useState(null);
  const [messageContent, setMessageContent] = useState('');
  const [messageType, setMessageType] = useState('contact'); // 'contact' or 'warning'

  // Show notification helper
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  useEffect(() => {
    console.log('🔄 AdminUsers component mounted, loading users...');
    loadUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, roleFilter, statusFilter, searchTerm, sortBy]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      console.log('👥 Loading users from database...');
      
      const usersData = await userAPI.getAll();
      console.log('👥 Raw users data from API:', usersData);
      
      const validUsers = usersData.filter(user => {
        const isValid = user && user.id && user.email && user.role !== 'DELETED';
        if (!isValid) {
          console.warn('⚠️ Filtering out invalid or deleted user:', user);
        }
        return isValid;
      });
      
      console.log(`👥 Filtered ${validUsers.length} valid users from ${usersData.length} total`);
      
      // Transform users with basic info
      // Removed roll_number field as it's no longer needed
      // Added createdAt for proper date-based sorting
      const transformedUsers = validUsers.map((user, index) => {
        console.log(`🔄 Transforming user ${index + 1}:`, user);
        console.log(`  - created_at: ${user.created_at}`);
        
        return {
          id: user.id,
          name: user.username || user.name || 'Unknown User',
          email: user.email,
          role: user.role || 'user',  // Default to 'user' role (lowercase to match DB)
          status: user.status || 'active',  // Default to 'active' status
          joinDate: user.created_at || '2024-01-01',
          lastActive: '2024-10-01',
          phone: user.phone || 'N/A',
          bio: user.bio || 'No bio available',
          createdAt: user.created_at || new Date().toISOString()  // For sorting purposes
        };
      });
      
      console.log('👥 Final transformed users:', transformedUsers);
      
      setUsers(transformedUsers);
      setFilteredUsers(transformedUsers);
    } catch (error) {
      console.error('❌ Error loading users:', error);
      alert('Failed to load users from database. Please check console for details.');
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting based on selected sort option
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'role':
          // Sort by role priority: admins first, then users
          // Handles both lowercase (db) and uppercase (legacy) role values
          const roleOrder = { 
            'admin': 1, 
            'ADMIN': 1, 
            'ADMINISTRATOR': 1, 
            'user': 2, 
            'USER': 2 
          };
          const aOrder = roleOrder[a.role] || 3;
          const bOrder = roleOrder[b.role] || 3;
          return aOrder - bOrder;
        case 'name':
          // Alphabetical sort by name
          return a.name.localeCompare(b.name);
        case 'newest':
          // Sort by creation date - newest first
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'oldest':
          // Sort by creation date - oldest first
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        default:
          return 0;
      }
    });

    setFilteredUsers(filtered);
  };

  const handleUserClick = async (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const updateUserStatus = async (userId, newStatus) => {
    try {
      // Update user status in backend
      await userAPI.updateUser(userId, { status: newStatus });
      
      // Reload users from server to ensure we have the latest data
      await loadUsers();
      setShowModal(false);
      showNotification(`User status updated to ${newStatus} successfully!`, 'success');
    } catch (error) {
      console.error('Error updating user status:', error);
      showNotification('Error updating user status. Please check your connection.', 'error');
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      // Update user role in backend
      await userAPI.updateUser(userId, { role: newRole });
      
      // Reload users from server to ensure we have the latest data
      await loadUsers();
      setShowModal(false);
      showNotification(`User role updated to ${newRole} successfully!`, 'success');
    } catch (error) {
      console.error('Error updating user role:', error);
      showNotification('Error updating user role. Please check your connection.', 'error');
    }
  };

  const deleteUser = async (userId, userName) => {
    try {
      await userAPI.deleteUser(userId);
      
      // Reload users from server to ensure we have the latest data
      await loadUsers();
      setShowModal(false);
      showNotification(`User ${userName} has been deleted successfully!`, 'success');
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification('Error deleting user. Please check your connection.', 'error');
    }
  };

  const handleContactUser = (user) => {
    setMessageUser(user);
    setMessageType('contact');
    setMessageContent('');
    setShowMessageModal(true);
    setShowModal(false);
  };

  const handleSendWarning = (user) => {
    setMessageUser(user);
    setMessageType('warning');
    setMessageContent('');
    setShowMessageModal(true);
    setShowModal(false);
  };

  const sendMessage = async () => {
    if (!messageContent.trim()) {
      alert('❌ Please enter a message');
      return;
    }

    try {
      const messagePrefix = messageType === 'warning' ? '⚠️ WARNING: ' : '💬 Admin Message: ';
      const fullMessage = messagePrefix + messageContent;
      
      console.log(`Sending ${messageType} to user ${messageUser.id}:`, fullMessage);
      
      // Send message through the messaging API (recipientId matches backend expectation)
      await messageAPI.sendMessage({
        recipientId: messageUser.id,
        content: fullMessage
      });
      
      setShowMessageModal(false);
      setMessageContent('');
      showNotification(`${messageType === 'warning' ? '⚠️ Warning' : '📧 Message'} sent to ${messageUser.name}`, 'success');
    } catch (error) {
      console.error('Error sending message:', error);
      showNotification('Failed to send message. Please try again.', 'error');
    }
  };

  // Helper function for CSV export
  const generateCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Join Date'];
    const csvData = [
      headers.join(','),
      ...users.map(user => [
        user.id,
        `"${user.name}"`,
        user.email,
        user.phone,
        user.role,
        user.status,
        user.joinDate
      ].join(','))
    ];
    return csvData.join('\n');
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#2ed573';
      case 'suspended': return '#ff4757';
      case 'pending': return '#ffa502';
      default: return currentColors.textSecondary;
    }
  };

  // Get color for role badge - uses toLowerCase to handle both DB and legacy formats
  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
      case 'administrator':
        return '#ffa502';  // Orange for admins
      case 'user':
        return '#2ed573';  // Green for users
      default:
        return currentColors.text;
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '20px', color: currentColors.text }}>
        Loading users...
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: currentColors.text, margin: 0 }}>
          User Management ({users.length} users)
        </h2>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '15px',
        marginBottom: '20px'
      }}>
        <div style={{
          backgroundColor: currentColors.surface,
          padding: '15px',
          borderRadius: '8px',
          border: `1px solid ${currentColors.border}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '5px' }}>👥</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3742fa', marginBottom: '5px' }}>
            {filteredUsers.length}
          </div>
          <div style={{ fontSize: '12px', color: currentColors.textSecondary }}>
            Total Users
          </div>
        </div>

        <div style={{
          backgroundColor: currentColors.surface,
          padding: '15px',
          borderRadius: '8px',
          border: `1px solid ${currentColors.border}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '5px' }}>✅</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2ed573', marginBottom: '5px' }}>
            {users.filter(u => u.status === 'active').length}
          </div>
          <div style={{ fontSize: '12px', color: currentColors.textSecondary }}>
            Active Users
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '15px',
        marginBottom: '20px',
        alignItems: 'center',
        padding: '15px',
        backgroundColor: currentColors.surface,
        borderRadius: '8px',
        border: `1px solid ${currentColors.border}`
      }}>
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            border: `1px solid ${currentColors.border}`,
            backgroundColor: currentColors.background,
            color: currentColors.text,
            minWidth: '200px'
          }}
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            border: `1px solid ${currentColors.border}`,
            backgroundColor: currentColors.background,
            color: currentColors.text
          }}
        >
          <option value="all">All Roles</option>
          <option value="user">Users</option>
          <option value="admin">Administrators</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            border: `1px solid ${currentColors.border}`,
            backgroundColor: currentColors.background,
            color: currentColors.text
          }}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="pending">Pending</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            border: `1px solid ${currentColors.border}`,
            backgroundColor: currentColors.background,
            color: currentColors.text
          }}
        >
          <option value="role">Sort by Role</option>
          <option value="name">Sort by Name</option>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>

        <div style={{ color: currentColors.textSecondary, fontSize: '14px' }}>
          {filteredUsers.length} users
        </div>
      </div>

      {/* Enhanced Users Table */}
      <div style={{
        backgroundColor: currentColors.surface,
        borderRadius: '8px',
        border: `1px solid ${currentColors.border}`,
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr 2fr 1.2fr 0.8fr 0.8fr 100px',
          gap: '12px',
          padding: '15px',
          backgroundColor: currentColors.background,
          borderBottom: `1px solid ${currentColors.border}`,
          fontWeight: 'bold',
          color: currentColors.text,
          alignItems: 'center'
        }}>
          <div>Name</div>
          <div>Email</div>
          <div>Phone</div>
          <div>Role</div>
          <div>Status</div>
          <div style={{ textAlign: 'center' }}>Actions</div>
        </div>

        {filteredUsers.map((user) => (
          <div
            key={user.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '1.5fr 2fr 1.2fr 0.8fr 0.8fr 100px',
              gap: '12px',
              padding: '15px',
              borderBottom: `1px solid ${currentColors.border}`,
              transition: 'background-color 0.2s',
              backgroundColor: 'transparent',
              color: currentColors.text,
              alignItems: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = currentColors.background;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div style={{ fontWeight: '500' }}>
              {user.name}
              <div style={{ fontSize: '12px', color: currentColors.textSecondary, marginTop: '2px' }}>
                ID: {user.id}
              </div>
            </div>
            
            <div style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              wordBreak: 'break-word'
            }}>
              {user.email}
            </div>
            
            <div style={{ fontSize: '14px' }}>
              {user.phone}
            </div>
            
            <div>
              <span style={{
                backgroundColor: getRoleColor(user.role) + '20',
                color: getRoleColor(user.role),
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {user.role}
              </span>
            </div>
            
            <div>
              <span style={{
                backgroundColor: getStatusColor(user.status) + '20',
                color: getStatusColor(user.status),
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {user.status}
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUserClick(user);
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: currentColors.primary,
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  color: 'white',
                  fontSize: '12px',
                  whiteSpace: 'nowrap'
                }}
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div style={{
          backgroundColor: currentColors.surface,
          padding: '40px',
          borderRadius: '8px',
          textAlign: 'center',
          color: currentColors.textSecondary,
          marginTop: '20px'
        }}>
          No users found matching the current filters.
        </div>
      )}

      {/* Enhanced User Detail Modal */}
      {showModal && selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '30px',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '700px',
            maxHeight: '85vh',
            overflow: 'auto',
            border: '2px solid #e0e0e0',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
            position: 'relative',
            color: '#333333'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: '#333333', margin: 0 }}>
                User Details: {selectedUser.name}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#333333'
                }}
              >
                ✕
              </button>
            </div>

            {/* User Information Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <strong style={{ color: '#333333' }}>Name:</strong>
                <p style={{ color: '#666666', margin: '5px 0' }}>
                  {selectedUser.name}
                </p>
              </div>
              <div>
                <strong style={{ color: '#333333' }}>Email:</strong>
                <p style={{ color: '#666666', margin: '5px 0' }}>
                  {selectedUser.email}
                </p>
              </div>
              <div>
                <strong style={{ color: '#333333' }}>Phone:</strong>
                <p style={{ color: '#666666', margin: '5px 0' }}>
                  {selectedUser.phone}
                </p>
              </div>
              <div>
                <strong style={{ color: '#333333' }}>Role:</strong>
                <p style={{ color: getRoleColor(selectedUser.role), margin: '5px 0', fontWeight: 'bold' }}>
                  {selectedUser.role}
                </p>
              </div>
              <div>
                <strong style={{ color: '#333333' }}>Status:</strong>
                <p style={{ color: getStatusColor(selectedUser.status), margin: '5px 0', fontWeight: 'bold' }}>
                  {selectedUser.status}
                </p>
              </div>
            </div>

            {/* Bio Section */}
            <div style={{ marginBottom: '30px' }}>
              <strong style={{ color: '#333333' }}>Bio:</strong>
              <p style={{ color: '#666666', margin: '5px 0', fontStyle: 'italic' }}>
                {selectedUser.bio}
              </p>
            </div>

            {/* Admin Actions */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  const currentUser = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user'));
                  if (currentUser && currentUser.id === selectedUser.id) {
                    alert('❌ You cannot change your own account status.\n\nFor security reasons, admin accounts must be managed by another administrator.');
                    return;
                  }
                  updateUserStatus(selectedUser.id, selectedUser.status === 'active' ? 'suspended' : 'active');
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: selectedUser.status === 'active' ? '#ff4757' : '#2ed573',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                {selectedUser.status === 'active' ? '🚫 Suspend User' : '✅ Activate User'}
              </button>
              
              <button
                onClick={() => {
                  const currentUser = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user'));
                  if (currentUser && currentUser.id === selectedUser.id) {
                    alert('❌ You cannot change your own role.\n\nFor security reasons, admin role changes must be performed by another administrator.');
                    return;
                  }
                  updateUserRole(selectedUser.id, selectedUser.role === 'user' || selectedUser.role === 'USER' ? 'admin' : 'user');
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ffa502',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                {(selectedUser.role === 'user' || selectedUser.role === 'USER') ? '🔧 Make Administrator' : '👤 Make User'}
              </button>

              <button
                onClick={() => handleContactUser(selectedUser)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#5f27cd',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                📧 Contact User
              </button>

              <button
                onClick={() => handleSendWarning(selectedUser)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ffa502',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                ⚠️ Send Warning
              </button>

              <button
                onClick={() => {
                  // Get current logged-in user ID
                  const currentUser = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user'));
                  
                  // Prevent admin from deleting their own account
                  if (currentUser && currentUser.id === selectedUser.id) {
                    alert('❌ You cannot delete your own admin account.\n\nFor security reasons, admin accounts must be managed by another administrator.');
                    return;
                  }

                  if (window.confirm(`Are you sure you want to delete user ${selectedUser.name}?\n\nThis action cannot be undone and will permanently remove:\n- User account and profile\n- All user data and history\n- Any associated content\n\nType "DELETE" to confirm this action.`)) {
                    const confirmText = window.prompt('Please type "DELETE" to confirm:');
                    if (confirmText === 'DELETE') {
                      deleteUser(selectedUser.id, selectedUser.name);
                    } else {
                      alert('Deletion cancelled - confirmation text did not match.');
                    }
                  }
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ff3838',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                🗑️ Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message/Warning Modal */}
      {showMessageModal && messageUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '30px',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px',
            border: '2px solid #e0e0e0',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ color: currentColors.text, margin: 0 }}>
                {messageType === 'warning' ? '⚠️ Send Warning to' : '📧 Contact'} {messageUser.name}
              </h3>
              <button
                onClick={() => {
                  setShowMessageModal(false);
                  setMessageContent('');
                }}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: currentColors.text
                }}
              >
                ✕
              </button>
            </div>

            {messageType === 'warning' && (
              <div style={{
                padding: '10px',
                backgroundColor: '#ffa50220',
                border: '1px solid #ffa502',
                borderRadius: '6px',
                marginBottom: '15px'
              }}>
                <p style={{ color: '#ffa502', margin: 0, fontSize: '14px' }}>
                  ⚠️ This will send a warning notification to the user. Use this for policy violations or inappropriate behavior.
                </p>
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: currentColors.text, display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Message:
              </label>
              <textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder={messageType === 'warning' ? 'Enter warning message...' : 'Enter your message...'}
                rows={5}
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

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowMessageModal(false);
                  setMessageContent('');
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: currentColors.border,
                  color: currentColors.text,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={sendMessage}
                style={{
                  padding: '10px 20px',
                  backgroundColor: messageType === 'warning' ? '#ffa502' : '#5f27cd',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                {messageType === 'warning' ? '⚠️ Send Warning' : '📧 Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification System */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '15px 20px',
          backgroundColor: notification.type === 'success' ? '#2ed573' : '#ff4757',
          color: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          zIndex: 2000,
          maxWidth: '400px',
          fontWeight: 'bold'
        }}>
          {notification.type === 'success' ? '✅' : '❌'} {notification.message}
        </div>
      )}
    </div>
  );
}

export default AdminUsers;