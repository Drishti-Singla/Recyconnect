import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:8080';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  // Connect to Socket.io server with authentication
  connect(token) {
    if (this.socket?.connected) {
      console.log('⚡ Socket already connected');
      return this.socket;
    }

    console.log('⚡ Connecting to Socket.io server...');
    
    this.socket = io(SOCKET_URL, {
      auth: {
        token: token
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    // Connection event handlers
    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      this.connected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      this.connected = false;
    });

    return this.socket;
  }

  // Disconnect from socket
  disconnect() {
    if (this.socket) {
      console.log('⚡ Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Check if socket is connected
  isConnected() {
    return this.connected && this.socket?.connected;
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }

  // ==================== CHAT EVENTS ====================

  // Send a chat message
  sendMessage(receiverId, message, itemId = null) {
    if (!this.socket) {
      console.error('❌ Socket not connected');
      return;
    }

    console.log('📤 Sending message:', { receiverId, message, itemId });
    
    this.socket.emit('chat_message', {
      receiver_id: receiverId,
      message: message,
      item_id: itemId
    });
  }

  // Listen for incoming messages
  onMessageReceived(callback) {
    if (!this.socket) return;

    this.socket.on('new_chat_message', (data) => {
      console.log('📥 Message received:', data);
      callback(data);
    });
  }

  // Mark message as read
  markMessageAsRead(messageId) {
    if (!this.socket) return;

    console.log('✅ Marking message as read:', messageId);
    this.socket.emit('message_read', { messageId });
  }

  // Listen for read receipts
  onMessageRead(callback) {
    if (!this.socket) return;

    this.socket.on('message_read', (data) => {
      console.log('✅ Message read receipt:', data);
      callback(data);
    });
  }

  // ==================== TYPING INDICATORS ====================

  // Emit typing indicator
  startTyping(receiverId) {
    if (!this.socket) return;
    
    this.socket.emit('typing', { receiverId });
  }

  // Stop typing indicator
  stopTyping(receiverId) {
    if (!this.socket) return;
    
    this.socket.emit('stop_typing', { receiverId });
  }

  // Listen for typing indicators
  onTyping(callback) {
    if (!this.socket) return;

    this.socket.on('typing', (data) => {
      console.log('⌨️ User typing:', data);
      callback(data);
    });
  }

  onStopTyping(callback) {
    if (!this.socket) return;

    this.socket.on('stop_typing', (data) => {
      console.log('⌨️ User stopped typing:', data);
      callback(data);
    });
  }

  // ==================== ONLINE STATUS ====================

  // Join a chat (mark as active in conversation)
  joinChat(userId) {
    if (!this.socket) return;
    
    console.log('👤 Joining chat with user:', userId);
    this.socket.emit('join_chat', { userId });
  }

  // Leave a chat
  leaveChat(userId) {
    if (!this.socket) return;
    
    console.log('👤 Leaving chat with user:', userId);
    this.socket.emit('leave_chat', { userId });
  }

  // Get online users
  getOnlineUsers() {
    if (!this.socket) return;
    
    this.socket.emit('get_online_users');
  }

  // Listen for online users list
  onOnlineUsers(callback) {
    if (!this.socket) return;

    this.socket.on('online_users', (data) => {
      console.log('👥 Online users:', data);
      callback(data);
    });
  }

  // Listen for user online status
  onUserOnline(callback) {
    if (!this.socket) return;

    this.socket.on('user_online', (data) => {
      console.log('✅ User came online:', data);
      callback(data);
    });
  }

  // Listen for user offline status
  onUserOffline(callback) {
    if (!this.socket) return;

    this.socket.on('user_offline', (data) => {
      console.log('❌ User went offline:', data);
      callback(data);
    });
  }

  // ==================== ERROR HANDLING ====================

  onError(callback) {
    if (!this.socket) return;

    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
      callback(error);
    });
  }

  // ==================== CLEAN UP ====================

  // Remove all event listeners
  removeAllListeners() {
    if (!this.socket) return;

    console.log('🧹 Removing all socket listeners');
    this.socket.removeAllListeners();
  }

  // Remove specific event listener
  removeListener(event, callback) {
    if (!this.socket) return;

    this.socket.off(event, callback);
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
