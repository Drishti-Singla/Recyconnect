// Simple API service to connect frontend to backend
const API_BASE_URL = 'http://localhost:8080/api';

// Token management functions (uses sessionStorage for auto-logout on browser close)
export const authUtils = {
  // Store token in sessionStorage (clears on browser close)
  setToken: (token) => {
    sessionStorage.setItem('authToken', token);
  },
  
  // Get token from sessionStorage (or localStorage as fallback)
  getToken: () => {
    return sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
  },
  
  // Remove token from both storages
  removeToken: () => {
    sessionStorage.removeItem('authToken');
    localStorage.removeItem('authToken');
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!(sessionStorage.getItem('authToken') || localStorage.getItem('authToken'));
  }
};

// Helper function to make API calls
const apiCall = async (endpoint, method = 'GET', data = null, customHeaders = {}) => {
  console.log('🔗 Making API call:', { endpoint, method, data, customHeaders });
  
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...customHeaders,
    },
  };

  // Add authorization header if token exists (check sessionStorage first)
  const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('📡 Full URL:', url);
    
    const response = await fetch(url, config);
    console.log('📥 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      
      // Try to parse error response as JSON
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        
        // Check for validation errors array (from express-validator)
        if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
          // Extract all error messages from the errors array
          const errorMessages = errorData.errors.map(err => err.msg).join(', ');
          errorMessage = errorMessages;
        } else {
          // Use the 'error' or 'message' field from backend if available
          errorMessage = errorData.error || errorData.message || errorMessage;
        }
      } catch (parseError) {
        // If not JSON, use the text directly or a generic message
        errorMessage = errorText || errorMessage;
      }
      
      // Create a more user-friendly error object
      const error = new Error(errorMessage);
      error.status = response.status;
      error.statusText = response.statusText;
      throw error;
    }
    
    // Handle responses with no content (like DELETE operations)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      console.log('✅ Success response: No content');
      return null;
    }
    
    const result = await response.json();
    console.log('✅ Success response:', result);
    return result;
  } catch (error) {
    console.error('💥 API call failed:', error);
    throw error;
  }
};

// User API functions
export const userAPI = {
  // Get all users
  getAll: async () => {
    const response = await apiCall('/users');
    return response.users || response;
  },
  
  // Register a new user
  register: (userData) => apiCall('/users/register', 'POST', userData),
  
  // Login user
  login: (credentials) => apiCall('/users/login', 'POST', credentials),
  
  // Get user profile (requires authentication)
  getProfile: () => apiCall('/users/profile'),

  // Get user by ID
  getUserById: (id) => apiCall(`/users/${id}`),

  // Update user by ID
  updateUser: (id, userData) => apiCall(`/users/${id}`, 'PUT', userData),

  // Update user profile
  updateProfile: (userData) => apiCall('/users/profile', 'PUT', userData),

  // Change user password
  changePassword: (passwordData) => apiCall('/users/change-password', 'PUT', passwordData),

  // Delete user account
  deleteAccount: () => apiCall('/users/profile', 'DELETE'),

  // Delete user by ID (admin function)
  deleteUser: (id) => apiCall(`/users/${id}`, 'DELETE'),
};

// Item API functions
export const itemAPI = {
  // Get all items with optional filtering
  getAllItems: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await apiCall(`/items${params ? '?' + params : ''}`);
    return response.items || response;
  },
  
  // Create a new item (authentication required)
  createItem: (itemData) => apiCall('/items', 'POST', itemData),
  
  // Get item by ID
  getItem: (id) => apiCall(`/items/${id}`),

  // Get current user's items
  getUserItems: async (userId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await apiCall(`/items/user/${userId}${queryParams ? '?' + queryParams : ''}`);
    return response.items || response;
  },

  // Update item (authentication required, user must own item)
  updateItem: (id, itemData) => apiCall(`/items/${id}`, 'PUT', itemData),

  // Delete item (authentication required, user must own item)
  deleteItem: (id) => apiCall(`/items/${id}`, 'DELETE'),
};

// Donated Item API functions
export const donatedItemAPI = {
  // Get all donated items (public)
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await apiCall(`/donated-items${queryParams ? '?' + queryParams : ''}`);
    return response.donatedItems || response;
  },

  getAllDonatedItems: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiCall(`/donated-items${queryParams ? '?' + queryParams : ''}`);
  },

  // Create a new donated item (authentication required)
  createDonatedItem: (donatedItemData) => apiCall('/donated-items', 'POST', donatedItemData),

  // Get user's donated items (authentication required)
  getUserDonatedItems: () => {
    return apiCall('/donated-items/user/my-donations', 'GET');
  },

  // Update donated item (authentication required, user must own item)
  updateDonatedItem: (id, donatedItemData) => apiCall(`/donated-items/${id}`, 'PUT', donatedItemData),

  // Update donated item status
  updateStatus: (id, statusData) => apiCall(`/donated-items/${id}`, 'PATCH', statusData),

  // Delete donated item (authentication required, user must own item)
  deleteDonatedItem: (id) => apiCall(`/donated-items/${id}`, 'DELETE'),
};

// Message API functions
export const messageAPI = {
  // Send a new message
  sendMessage: (messageData) => apiCall('/messages', 'POST', messageData),
  
  // Get user's conversations
  getConversations: () => apiCall('/messages/conversations'),
  
  // Get conversation with specific user
  getConversation: (userId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiCall(`/messages/conversation/${userId}${queryParams ? '?' + queryParams : ''}`);
  },
};

// Reported Item API functions (unified lost/found/reported items)
export const reportedItemAPI = {
  // Get all reported items (public)
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await apiCall(`/reported${queryParams ? '?' + queryParams : ''}`);
    return response.reportedItems || response;
  },

  getAllReportedItems: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiCall(`/reported${queryParams ? '?' + queryParams : ''}`);
  },

  // Create a new reported item (authentication required)
  createReportedItem: (reportedItemData) => apiCall('/reported', 'POST', reportedItemData),

  // Get user's reported items (authentication required)
  getUserReportedItems: () => {
    return apiCall('/reported/user/my-reported', 'GET');
  },

  // Update reported item status (authentication required, user must own item)
  updateReportedItemStatus: (id, statusData) => apiCall(`/reported/${id}`, 'PATCH', statusData),

  // Admin function to update status
  updateStatus: (id, status) => {
    console.log(`📡 AdminAPI - Updating item ${id} with status:`, status);
    const payload = { 
      status: status,
      updatedAt: new Date().toISOString() // Add timestamp to ensure update
    };
    console.log(`📡 AdminAPI - Sending payload:`, payload);
    return apiCall(`/reported/${id}`, 'PATCH', payload);
  },

  // Delete reported item (authentication required, user must own item)
  deleteReportedItem: (id) => apiCall(`/reported/${id}`, 'DELETE'),
};

// User Concern API functions (for raising concerns about users/items/issues)
export const userConcernAPI = {
  // Submit a new user concern (authentication required)
  createUserConcern: (concernData) => apiCall('/concerns', 'POST', concernData),

  // Get user's own concerns (authentication required)
  getUserOwnConcerns: () => {
    return apiCall('/concerns/my-concerns', 'GET');
  },

  // Get all concerns (admin view with filtering)
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await apiCall(`/concerns${queryParams ? '?' + queryParams : ''}`);
    return response.concerns || response;
  },

  getAllUserConcerns: (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiCall(`/concerns${queryParams ? '?' + queryParams : ''}`);
  },

  // Update concern status (admin/moderator function)
  updateConcernStatus: (id, statusData) => apiCall(`/concerns/${id}`, 'PATCH', statusData),

  // Delete concern (authentication required, user must own concern)
  deleteConcern: (id) => apiCall(`/concerns/${id}`, 'DELETE'),
};

// Flag API functions (for flagging content/users for moderation)
export const flagAPI = {
  // Create a new flag (authentication required)
  createFlag: (flagData) => apiCall('/flags', 'POST', flagData),

  // Get all flags (admin function with filtering)
  getAllFlags: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await apiCall(`/flags${queryParams ? '?' + queryParams : ''}`);
    return response.flags || response;
  },

  // Get flags by user (authentication required)
  getUserFlags: (userId) => apiCall(`/flags/user/${userId}`),

  // Get flags for a specific target
  getTargetFlags: (targetType, targetId) => apiCall(`/flags/target/${targetType}/${targetId}`),

  // Update flag status (admin function)
  updateFlag: (id, updateData) => apiCall(`/flags/${id}`, 'PATCH', updateData),

  // Delete flag (admin function)
  deleteFlag: (id) => apiCall(`/flags/${id}`, 'DELETE'),

  // Get flag counts for a target
  getFlagCounts: (targetType, targetId) => apiCall(`/flags/count/${targetType}/${targetId}`),
};

// Export socket service
export { default as socketService } from './socket';

const api = { userAPI, itemAPI, donatedItemAPI, messageAPI, reportedItemAPI, userConcernAPI, flagAPI, authUtils };
export default api;
