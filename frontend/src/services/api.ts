// API Service for Recyconnect Frontend
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Helper to get auth token
const getAuthToken = () => sessionStorage.getItem('token');

// Helper to handle API responses
async function handleResponse(response: Response) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Request failed');
  }
  return data;
}

// Auth APIs
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  register: async (userData: any) => {
    const response = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  getProfile: async () => {
    const response = await fetch(`${API_URL}/users/profile`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  updateProfile: async (profileData: any) => {
    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(profileData),
    });
    return handleResponse(response);
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await fetch(`${API_URL}/users/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return handleResponse(response);
  },
};

// Items APIs (Lost & Found)
export const itemsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/items`, {
      headers: getAuthToken() ? { 'Authorization': `Bearer ${getAuthToken()}` } : {},
    });
    return handleResponse(response);
  },

  getById: async (id: number) => {
    const response = await fetch(`${API_URL}/items/${id}`, {
      headers: getAuthToken() ? { 'Authorization': `Bearer ${getAuthToken()}` } : {},
    });
    return handleResponse(response);
  },

  create: async (itemData: any) => {
    const response = await fetch(`${API_URL}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(itemData),
    });
    return handleResponse(response);
  },

  getUserItems: async () => {
    const token = getAuthToken();
    const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
    const response = await fetch(`${API_URL}/items/user/${userData.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  delete: async (itemId: number) => {
    const response = await fetch(`${API_URL}/items/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  updateStatus: async (itemId: number, updates: any) => {
    const response = await fetch(`${API_URL}/items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  },
};

// Donated Items APIs
export const donatedItemsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/donated-items`, {
      headers: getAuthToken() ? { 'Authorization': `Bearer ${getAuthToken()}` } : {},
    });
    return handleResponse(response);
  },

  create: async (itemData: any) => {
    const response = await fetch(`${API_URL}/donated-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(itemData),
    });
    return handleResponse(response);
  },

  getUserDonations: async () => {
    const response = await fetch(`${API_URL}/donated-items/user/my-donations`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  delete: async (itemId: number) => {
    const response = await fetch(`${API_URL}/donated-items/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  updateStatus: async (itemId: number, updates: any) => {
    const response = await fetch(`${API_URL}/donated-items/${itemId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  },
};

// Concerns APIs
export const concernsAPI = {
  create: async (concernData: any) => {
    const response = await fetch(`${API_URL}/concerns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(concernData),
    });
    return handleResponse(response);
  },

  getUserConcerns: async () => {
    const response = await fetch(`${API_URL}/concerns/my-concerns`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  getAll: async () => {
    const response = await fetch(`${API_URL}/concerns`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  delete: async (concernId: number) => {
    const response = await fetch(`${API_URL}/concerns/${concernId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  updateStatus: async (concernId: number, updates: any) => {
    const response = await fetch(`${API_URL}/concerns/${concernId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  },
};

// Admin APIs
export const adminAPI = {
  getAllUsers: async () => {
    const response = await fetch(`${API_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  updateUser: async (userId: number, updates: any) => {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  },

  deleteUser: async (userId: number) => {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },
};

// Messages APIs
export const messagesAPI = {
  getConversations: async () => {
    const response = await fetch(`${API_URL}/messages/conversations`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },
};

// Reported Items APIs (Lost & Found)
export const reportedItemsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/reported`, {
      headers: getAuthToken() ? { 'Authorization': `Bearer ${getAuthToken()}` } : {},
    });
    return handleResponse(response);
  },

  getUserReportedItems: async () => {
    const response = await fetch(`${API_URL}/reported/user/my-reported`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  create: async (itemData: any) => {
    const response = await fetch(`${API_URL}/reported`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(itemData),
    });
    return handleResponse(response);
  },

  delete: async (itemId: number) => {
    const response = await fetch(`${API_URL}/reported/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  updateStatus: async (itemId: number, updates: any) => {
    const response = await fetch(`${API_URL}/reported/${itemId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  },
};

// Upload API
export const uploadAPI = {
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${API_URL}/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: formData,
    });
    return handleResponse(response);
  },

  uploadImages: async (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    
    const response = await fetch(`${API_URL}/upload/images`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: formData,
    });
    return handleResponse(response);
  },
};