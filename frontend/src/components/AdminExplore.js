import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { itemAPI, userAPI, flagAPI, donatedItemAPI } from '../services/api';
import AdminMessages from './AdminMessages';

function AdminExplore() {
  const { currentColors } = useTheme();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // all, flagged, reported
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState(null);
  const [selectedItemMenu, setSelectedItemMenu] = useState(null);

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, searchTerm, categoryFilter, statusFilter]);

  const loadItems = async () => {
    try {
      setIsLoading(true);
      
      // Load regular items
      const regularItemsResponse = await itemAPI.getAllItems();
      let regularItems = Array.isArray(regularItemsResponse) ? regularItemsResponse : [];
      
      // Load donated items
      let donatedItems = [];
      try {
        const donatedItemsResponse = await donatedItemAPI.getAllDonatedItems();
        if (donatedItemsResponse && donatedItemsResponse.donatedItems) {
          donatedItems = donatedItemsResponse.donatedItems;
        } else if (Array.isArray(donatedItemsResponse)) {
          donatedItems = donatedItemsResponse;
        }
      } catch (donatedError) {
        console.warn('Donated items API not available:', donatedError);
      }
      
      // Mark items with type - filter like user view does
      const regularItemsWithType = regularItems
        .filter(item => item.status !== 'sold') // Filter out sold items like user view
        .map(item => ({
          ...item,
          type: 'sale',
          isDonated: false,
          uniqueKey: `item-${item.id}` // Unique key for React
        }));
      
      const donatedItemsWithType = donatedItems
        .filter(item => item.status !== 'claimed' && item.status !== 'archived') // Filter out claimed/archived like user view
        .map(item => ({
          ...item,
          type: 'donated',
          isDonated: true,
          title: item.title,
          description: item.description,
          category: item.category,
          location: item.pickup_location,
          user_id: item.donor_id,
          status: item.status,
          uniqueKey: `donated-${item.id}` // Unique key for React
        }));
      
      // Combine both arrays
      const allItems = [...regularItemsWithType, ...donatedItemsWithType];
      
      console.log('Admin Explore - Loaded items:', allItems.length, '(Regular:', regularItems.length, ', Donated:', donatedItems.length, ')');
      setItems(allItems);
    } catch (error) {
      console.error('Error loading items:', error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...items];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        (item.title || '').toLowerCase().includes(term) ||
        (item.description || '').toLowerCase().includes(term) ||
        (item.category || '').toLowerCase().includes(term)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    // Status filter
    if (statusFilter === 'flagged') {
      filtered = filtered.filter(item => item.is_flagged || item.isFlagged);
    } else if (statusFilter === 'reported') {
      filtered = filtered.filter(item => item.user_reported || item.owner_reported);
    }

    setFilteredItems(filtered);
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await itemAPI.deleteItem(itemId);
      alert('Item deleted successfully');
      loadItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  const handleContactUser = async (item) => {
    try {
      const userId = item.owner_id || item.ownerId || item.user_id;
      if (!userId) {
        alert('User information not available');
        return;
      }

      const userResponse = await userAPI.getUserById(userId);
      const user = userResponse.user || userResponse;
      
      setMessageRecipient({
        id: userId,
        name: user.username || user.name || 'User'
      });
      setShowMessageModal(true);
      setSelectedItemMenu(null);
    } catch (error) {
      console.error('Error getting user info:', error);
      alert('Failed to get user information');
    }
  };

  const handleToggleFlag = async (itemId, currentStatus) => {
    try {
      if (currentStatus) {
        // Unflag - delete the flag
        // First get the flag ID for this item
        const response = await flagAPI.getTargetFlags('item', itemId);
        const flags = response.flags || response;
        if (flags && flags.length > 0) {
          await flagAPI.deleteFlag(flags[0].id);
          alert('Item unflagged successfully');
        }
      } else {
        // Flag - create new flag
        await flagAPI.createFlag({ 
          targetType: 'item',
          targetId: itemId,
          reason: 'Admin flagged',
          flagType: 'inappropriate'
        });
        alert('Item flagged successfully');
      }
      loadItems();
      setSelectedItemMenu(null);
    } catch (error) {
      console.error('Error toggling flag:', error);
      alert('Failed to update flag status');
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '20px', color: currentColors.text }}>
        Loading items...
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ color: currentColors.text, margin: '0 0 10px 0' }}>🔍 Explore Management</h2>
        <p style={{ color: currentColors.textSecondary, margin: 0, fontSize: '14px' }}>
          Manage all marketplace items
        </p>
      </div>

      {/* Filters */}
      <div style={{
        backgroundColor: currentColors.surface,
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '15px' }}>
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '10px',
              borderRadius: '6px',
              border: `1px solid ${currentColors.border}`,
              backgroundColor: currentColors.cardBackground,
              color: currentColors.text,
              fontSize: '14px'
            }}
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '10px',
              borderRadius: '6px',
              border: `1px solid ${currentColors.border}`,
              backgroundColor: currentColors.cardBackground,
              color: currentColors.text,
              fontSize: '14px'
            }}
          >
            <option value="all">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="furniture">Furniture</option>
            <option value="clothing">Clothing</option>
            <option value="books">Books</option>
            <option value="toys">Toys</option>
            <option value="other">Other</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '10px',
              borderRadius: '6px',
              border: `1px solid ${currentColors.border}`,
              backgroundColor: currentColors.cardBackground,
              color: currentColors.text,
              fontSize: '14px'
            }}
          >
            <option value="all">All Status</option>
            <option value="flagged">Flagged Only</option>
            <option value="reported">Reported Users</option>
          </select>
        </div>
      </div>

      {/* Items Grid */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ color: currentColors.text, marginBottom: '15px' }}>
          {filteredItems.length} Items
          {statusFilter === 'flagged' && ' (Flagged)'}
          {statusFilter === 'reported' && ' (Reported Users)'}
        </h4>
      </div>

      {filteredItems.length === 0 ? (
        <div style={{
          backgroundColor: currentColors.surface,
          padding: '40px',
          borderRadius: '8px',
          textAlign: 'center',
          color: currentColors.textSecondary
        }}>
          No items found
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {filteredItems.map(item => (
            <div
              key={item.uniqueKey || `item-${item.id}`}
              style={{
                backgroundColor: currentColors.surface,
                borderRadius: '8px',
                border: `1px solid ${currentColors.border}`,
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              {/* Three Dots Menu */}
              <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
                <button
                  onClick={() => setSelectedItemMenu(selectedItemMenu === item.id ? null : item.id)}
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    fontSize: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ⋮
                </button>
                {selectedItemMenu === item.id && (
                  <div style={{
                    position: 'absolute',
                    top: '40px',
                    right: 0,
                    backgroundColor: currentColors.cardBackground,
                    border: `1px solid ${currentColors.border}`,
                    borderRadius: '6px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    minWidth: '160px',
                    zIndex: 100
                  }}>
                    <button
                      onClick={() => handleContactUser(item)}
                      style={{
                        width: '100%',
                        padding: '10px 15px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: currentColors.text,
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '14px',
                        borderBottom: `1px solid ${currentColors.border}`
                      }}
                    >
                      💬 Contact User
                    </button>
                    <button
                      onClick={() => handleToggleFlag(item.id, item.is_flagged || item.isFlagged)}
                      style={{
                        width: '100%',
                        padding: '10px 15px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: currentColors.text,
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '14px',
                        borderBottom: `1px solid ${currentColors.border}`
                      }}
                    >
                      {(item.is_flagged || item.isFlagged) ? '✓ Unflag Item' : '🚩 Flag Item'}
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      style={{
                        width: '100%',
                        padding: '10px 15px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: '#ff4757',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      🗑️ Delete Item
                    </button>
                  </div>
                )}
              </div>

              {/* Status Badges */}
              <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 5 }}>
                {(item.is_flagged || item.isFlagged) && (
                  <span style={{
                    backgroundColor: '#ff4757',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    marginRight: '5px'
                  }}>
                    🚩 FLAGGED
                  </span>
                )}
                {(item.user_reported || item.owner_reported) && (
                  <span style={{
                    backgroundColor: '#ff4757',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    ⚠️ USER REPORTED
                  </span>
                )}
              </div>

              {/* Item Image */}
              {((item.image_urls && item.image_urls.length > 0) || (item.images && item.images.length > 0)) && (
                <img
                  src={item.image_urls?.[0] || item.images?.[0]}
                  alt={item.title}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover'
                  }}
                />
              )}

              {/* Item Details */}
              <div style={{ padding: '15px' }}>
                <h3 style={{
                  margin: '0 0 8px 0',
                  color: currentColors.text,
                  fontSize: '16px'
                }}>
                  {item.title}
                </h3>
                <p style={{
                  margin: '0 0 10px 0',
                  color: currentColors.textSecondary,
                  fontSize: '14px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {item.description}
                </p>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '10px'
                }}>
                  <span style={{
                    backgroundColor: currentColors.primary + '20',
                    color: currentColors.primary,
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {item.category}
                  </span>
                  <span style={{ color: currentColors.textSecondary, fontSize: '12px' }}>
                    {item.condition}
                  </span>
                </div>
                <div style={{ marginTop: '10px', fontSize: '12px', color: currentColors.textSecondary }}>
                  Posted by: <span style={{ 
                    color: (item.user_reported || item.owner_reported) ? '#ff4757' : currentColors.textSecondary,
                    fontWeight: (item.user_reported || item.owner_reported) ? 'bold' : 'normal'
                  }}>
                    {item.username || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && messageRecipient && (
        <AdminMessages
          recipientId={messageRecipient.id}
          recipientName={messageRecipient.name}
          onClose={() => {
            setShowMessageModal(false);
            setMessageRecipient(null);
          }}
        />
      )}
    </div>
  );
}

export default AdminExplore;
