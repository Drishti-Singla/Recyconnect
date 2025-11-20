import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import AdminMessages from './AdminMessages';

function AdminMessagesSection() {
  const { currentColors } = useTheme();
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8080/api/chat/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      console.log('💬 Admin conversations loaded:', data.conversations);
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChat = (conv) => {
    setSelectedUser({
      id: conv.other_user_id,
      name: conv.username || conv.other_username || conv.other_user_name || 'User'
    });
    setShowMessageModal(true);
  };

  if (isLoading) {
    return (
      <div style={{ padding: '20px', color: currentColors.text }}>
        Loading conversations...
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ color: currentColors.text, margin: '0 0 10px 0' }}>💬 Messages</h2>
        <p style={{ color: currentColors.textSecondary, margin: 0, fontSize: '14px' }}>
          Manage all chat conversations
        </p>
      </div>

      {conversations.length === 0 ? (
        <div style={{
          backgroundColor: currentColors.surface,
          padding: '40px',
          borderRadius: '8px',
          textAlign: 'center',
          color: currentColors.textSecondary
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
          <h3 style={{ margin: '0 0 8px 0' }}>No conversations yet</h3>
          <p style={{ margin: 0 }}>Messages from users will appear here</p>
        </div>
      ) : (
        <div style={{
          backgroundColor: currentColors.surface,
          borderRadius: '8px',
          border: `1px solid ${currentColors.border}`,
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr 1fr 120px',
            gap: '15px',
            padding: '15px',
            backgroundColor: currentColors.background,
            borderBottom: `1px solid ${currentColors.border}`,
            fontWeight: 'bold',
            color: currentColors.text
          }}>
            <div>User</div>
            <div>Last Message</div>
            <div>Time</div>
            <div>Actions</div>
          </div>

          {/* Conversations */}
          {conversations.map((conv) => (
            <div
              key={conv.other_user_id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 2fr 1fr 120px',
                gap: '15px',
                padding: '15px',
                borderBottom: `1px solid ${currentColors.border}`,
                alignItems: 'center',
                backgroundColor: currentColors.surface,
                color: currentColors.text
              }}
            >
              <div style={{ fontWeight: '600' }}>
                {conv.username || 'Unknown User'}
              </div>
              
              <div style={{
                color: currentColors.textSecondary,
                fontSize: '14px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {conv.last_message || 'No messages yet'}
              </div>
              
              <div style={{ color: currentColors.textSecondary, fontSize: '12px' }}>
                {conv.last_message_time 
                  ? new Date(conv.last_message_time).toLocaleDateString()
                  : 'N/A'}
              </div>
              
              <div>
                <button
                  onClick={() => handleOpenChat(conv)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: currentColors.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  💬 Open Chat
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && selectedUser && (
        <AdminMessages
          recipientId={selectedUser.id}
          recipientName={selectedUser.name}
          onClose={() => {
            setShowMessageModal(false);
            setSelectedUser(null);
            loadConversations(); // Refresh conversations when closing
          }}
        />
      )}
    </div>
  );
}

export default AdminMessagesSection;
