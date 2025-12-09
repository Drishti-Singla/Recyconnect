import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import socketService from '../services/socket';

function AdminMessages({ recipientId, recipientName, onClose }) {
  const { currentColors } = useTheme();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadMessages();
    
    // Listen for new messages
    const handleNewMessage = (data) => {
      if (data.sender_id === recipientId || data.recipient_id === recipientId) {
        loadMessages();
      }
    };

    socketService.onMessageReceived(handleNewMessage);

    return () => {
      socketService.removeListener('new_chat_message', handleNewMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipientId]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8080/api/chat/messages/${recipientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      
      // Send via REST API only (backend will handle socket notification)
      const response = await fetch('http://localhost:8080/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientId: recipientId,
          content: newMessage
        })
      });

      if (response.ok) {
        setNewMessage('');
        await loadMessages();
      } else {
        alert('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: currentColors.cardBackground,
        borderRadius: '12px',
        width: '90%',
        maxWidth: '600px',
        height: '600px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: `1px solid ${currentColors.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, color: currentColors.text }}>
            💬 Chat with {recipientName || 'User'}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: currentColors.text
            }}
          >
            ×
          </button>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          backgroundColor: currentColors.background
        }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: currentColors.textSecondary }}>
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: currentColors.textSecondary }}>
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((msg, index) => {
              const isCurrentUser = msg.sender_id !== recipientId;
              const senderName = isCurrentUser ? 'You' : (msg.sender_username || recipientName || 'User');
              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                    marginBottom: '12px'
                  }}
                >
                  <div style={{
                    maxWidth: '70%',
                    padding: '10px 15px',
                    borderRadius: '12px',
                    backgroundColor: isCurrentUser ? currentColors.primary : currentColors.surface,
                    color: isCurrentUser ? '#fff' : currentColors.text
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '4px' 
                    }}>
                      <div style={{ fontSize: '10px', opacity: 0.6, fontWeight: 'bold' }}>
                        {senderName}
                      </div>
                      <div style={{ fontSize: '11px', opacity: 0.7 }}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div>{msg.content}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input */}
        <div style={{
          padding: '20px',
          borderTop: `1px solid ${currentColors.border}`,
          display: 'flex',
          gap: '10px'
        }}>
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={isSending}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: `1px solid ${currentColors.border}`,
              backgroundColor: currentColors.cardBackground,
              color: currentColors.text,
              resize: 'none',
              fontFamily: 'inherit',
              fontSize: '14px'
            }}
            rows="2"
          />
          <button
            onClick={handleSendMessage}
            disabled={isSending || !newMessage.trim()}
            style={{
              padding: '10px 20px',
              backgroundColor: isSending || !newMessage.trim() ? '#ccc' : currentColors.primary,
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: isSending || !newMessage.trim() ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {isSending ? '...' : '📨 Send'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminMessages;
