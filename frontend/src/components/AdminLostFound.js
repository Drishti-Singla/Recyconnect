import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { reportedItemAPI } from '../services/api';
import AdminMessages from './AdminMessages';

function AdminLostFound() {
  const { currentColors } = useTheme();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // TEMPORARILY SET TO 'all' FOR DEBUGGING
  const [itemTypeFilter, setItemTypeFilter] = useState('all'); // all, lost, found
  const [sortBy, setSortBy] = useState('status'); // status, newest, oldest
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState(null);

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [items, filter, itemTypeFilter, sortBy]);

  const loadItems = async () => {
    try {
      setIsLoading(true);
      // Admin should see ALL statuses, not just 'active'
      // Pass empty string to override backend's default status='active' filter
      const data = await reportedItemAPI.getAll({ status: '' });
      
      // Debug logging to see the actual data structure
      console.log('🔍 AdminLostFound - Raw API data:', data);
      if (data && data.length > 0) {
        console.log('🔍 AdminLostFound - First item:', data[0]);
        console.log('🔍 AdminLostFound - First item keys:', Object.keys(data[0]));
        console.log('🔍 AdminLostFound - First item status:', data[0].status);
        
        // Show all items and their statuses using existing database fields
        console.log('🔍 AdminLostFound - All items with statuses:');
        data.forEach((item, index) => {
          console.log(`  Item ${item.id}: status = "${item.status}", isResolved = ${item.isResolved}, title = "${item.title}"`);
        });
      }
      
      setItems(data);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...items];
    
    console.log('🔍 AdminLostFound - Applying filters...');
    console.log('🔍 Total items before filtering:', items.length);
    console.log('🔍 Current filter:', filter);
    console.log('🔍 Current itemTypeFilter:', itemTypeFilter);

    if (filter !== 'all') {
      console.log('🔍 Before filtering - Total items:', filtered.length);
      
      filtered = filtered.filter(item => {
        const matchesFilter = (() => {
          switch (filter) {
            case 'pending': 
              // Pending: status=pending
              return item.status === 'pending';
            case 'verified': 
              // Verified: status=verified
              return item.status === 'verified';
            case 'resolved': 
              // Resolved: status=resolved
              return item.status === 'resolved';
            case 'flagged':
              // Flagged: status=flagged
              return item.status === 'flagged';
            default: 
              return true;
          }
        })();
        
        console.log(`🔍 Item ${item.id} - Status: "${item.status}" - Filter: ${filter} - Matches: ${matchesFilter}`);
        
        return matchesFilter;
      });
      
      console.log('🔍 After filtering - Remaining items:', filtered.length);
    }

    if (itemTypeFilter !== 'all') {
      filtered = filtered.filter(item => item.report_type === itemTypeFilter);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'status':
          // Sort by status priority: pending > flagged > verified > active > resolved > inactive
          const statusOrder = { 
            pending: 6, 
            flagged: 5, 
            verified: 4, 
            active: 3, 
            resolved: 2, 
            inactive: 1 
          };
          return (statusOrder[b.status] || 0) - (statusOrder[a.status] || 0);
        case 'newest':
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        case 'oldest':
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        default:
          return 0;
      }
    });
    
    console.log('🔍 Items after filtering:', filtered.length);
    setFilteredItems(filtered);
  };

  const handleStatusUpdate = async (itemId, newStatus) => {
    try {
      console.log(`🔄 Updating item ${itemId} status to: ${newStatus}`);
      
      // Update via API with the status directly (no mapping needed)
      await reportedItemAPI.updateReportedItemStatus(itemId, { status: newStatus });
      console.log(`✅ Status updated successfully`);
      
      // Reload items from server to get latest data
      await loadItems();
      
      setShowModal(false);
      
      // Show success message
      const statusMessages = {
        'verified': 'Item has been verified',
        'resolved': 'Item has been marked as resolved',
        'flagged': 'Item has been flagged as suspicious',
        'pending': 'Item set back to pending'
      };
      alert(statusMessages[newStatus] || `Item status updated to ${newStatus}`);
    } catch (error) {
      console.error('❌ Error updating status:', error);
      alert(`Failed to update status: ${error.message}`);
    }
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffa502';
      case 'verified': return '#3742fa';
      case 'active': return '#2ed573';
      case 'flagged': return '#ff4757';
      case 'resolved': return '#2ed573';
      default: return currentColors.textSecondary;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pending Verification';
      case 'verified': return 'Verified & Active';
      case 'active': return 'Active';
      case 'flagged': return 'Flagged';
      case 'resolved': return 'Resolved';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '20px', color: currentColors.text }}>
        Loading lost & found items...
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: currentColors.text, margin: 0 }}>
          Lost & Found Management
        </h2>
      </div>

      {/* Filters */}
      <div style={{
        backgroundColor: currentColors.surface,
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        display: 'flex',
        gap: '15px',
        flexWrap: 'wrap'
      }}>
        <div>
          <label style={{ color: currentColors.text, fontSize: '14px', marginRight: '8px' }}>
            Status:
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '4px',
              border: `1px solid ${currentColors.border}`,
              backgroundColor: currentColors.background,
              color: currentColors.text
            }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending Verification</option>
            <option value="verified">Verified & Active</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div>
          <label style={{ color: currentColors.text, fontSize: '14px', marginRight: '8px' }}>
            Type:
          </label>
          <select
            value={itemTypeFilter}
            onChange={(e) => setItemTypeFilter(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '4px',
              border: `1px solid ${currentColors.border}`,
              backgroundColor: currentColors.background,
              color: currentColors.text
            }}
          >
            <option value="all">All Types</option>
            <option value="lost">Lost Items</option>
            <option value="found">Found Items</option>
          </select>
        </div>

        <div>
          <label style={{ color: currentColors.text, fontSize: '14px', marginRight: '8px' }}>
            Sort By:
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '4px',
              border: `1px solid ${currentColors.border}`,
              backgroundColor: currentColors.background,
              color: currentColors.text
            }}
          >
            <option value="status">Status Priority</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        <div style={{ color: currentColors.textSecondary, fontSize: '14px', display: 'flex', alignItems: 'center' }}>
          Showing {filteredItems.length} of {items.length} items
        </div>
      </div>

      {/* Items Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {filteredItems.map(item => (
          <div
            key={item.id}
            onClick={() => handleItemClick(item)}
            style={{
              backgroundColor: currentColors.surface,
              padding: '15px',
              borderRadius: '8px',
              border: `1px solid ${currentColors.border}`,
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            {/* Item Image */}
            {((item.image_urls && item.image_urls.length > 0) || (item.images && item.images.length > 0)) && (
              <img
                src={item.image_urls?.[0] || item.images?.[0]}
                alt={item.title}
                style={{
                  width: '100%',
                  height: '150px',
                  objectFit: 'cover',
                  borderRadius: '6px',
                  marginBottom: '10px'
                }}
              />
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <h4 style={{ color: currentColors.text, margin: 0, fontSize: '16px' }}>
                {item.title}
              </h4>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{
                  backgroundColor: item.itemType === 'lost' ? '#ff475720' : '#2ed57320',
                  color: item.itemType === 'lost' ? '#ff4757' : '#2ed573',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {item.itemType?.toUpperCase()}
                </span>
              </div>
            </div>

            <p style={{
              color: currentColors.textSecondary,
              fontSize: '14px',
              margin: '0 0 10px 0',
              maxHeight: '40px',
              overflow: 'hidden'
            }}>
              {item.description}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                color: getStatusColor(item.status),
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {getStatusLabel(item.status)}
              </span>
              
              <span style={{ color: currentColors.textSecondary, fontSize: '12px' }}>
                {item.category}
              </span>
            </div>

            {item.locationLost && (
              <div style={{ marginTop: '8px' }}>
                <span style={{ color: currentColors.textSecondary, fontSize: '12px' }}>
                  📍 Lost at: {item.locationLost}
                </span>
              </div>
            )}

            {item.locationFound && (
              <div style={{ marginTop: '8px' }}>
                <span style={{ color: currentColors.textSecondary, fontSize: '12px' }}>
                  📍 Found at: {item.locationFound}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div style={{
          backgroundColor: currentColors.surface,
          padding: '40px',
          borderRadius: '8px',
          textAlign: 'center',
          color: currentColors.textSecondary
        }}>
          No items found matching the current filters.
        </div>
      )}

      {/* Item Detail Modal */}
      {showModal && selectedItem && (
        <div 
          onClick={(e) => {
            // Close modal when clicking the backdrop
            if (e.target === e.currentTarget) {
              setShowModal(false);
            }
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              padding: '20px',
              borderRadius: '10px',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '80vh',
              overflowY: 'auto',
              border: '2px solid #e0e0e0',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
              color: '#333333'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ color: '#333333', margin: 0 }}>
                {selectedItem.title}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#666666'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <strong style={{ color: '#333333' }}>Description:</strong>
              <p style={{ color: '#666666', margin: '5px 0' }}>
                {selectedItem.description}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
              <div>
                <strong style={{ color: '#333333' }}>Type:</strong>
                <p style={{ color: '#666666', margin: '2px 0' }}>
                  {selectedItem.itemType}
                </p>
              </div>
              <div>
                <strong style={{ color: '#333333' }}>Category:</strong>
                <p style={{ color: '#666666', margin: '2px 0' }}>
                  {selectedItem.category}
                </p>
              </div>
              <div>
                <strong style={{ color: '#333333' }}>Status:</strong>
                <p style={{ color: getStatusColor(selectedItem.status), margin: '2px 0' }}>
                  {getStatusLabel(selectedItem.status)}
                </p>
              </div>
              <div>
                <strong style={{ color: '#333333' }}>Reported:</strong>
                <p style={{ color: '#666666', margin: '2px 0' }}>
                  {new Date(selectedItem.reportedDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {selectedItem.color && (
              <div style={{ marginBottom: '10px' }}>
                <strong style={{ color: '#333333' }}>Color:</strong>
                <span style={{ color: '#666666', marginLeft: '8px' }}>
                  {selectedItem.color}
                </span>
              </div>
            )}

            {selectedItem.brand && (
              <div style={{ marginBottom: '10px' }}>
                <strong style={{ color: '#333333' }}>Brand:</strong>
                <span style={{ color: '#666666', marginLeft: '8px' }}>
                  {selectedItem.brand}
                </span>
              </div>
            )}

            {selectedItem.contactInfo && (
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: '#333333' }}>Contact Info:</strong>
                <p style={{ color: '#666666', margin: '5px 0' }}>
                  {selectedItem.contactInfo}
                </p>
              </div>
            )}

            {/* Admin Actions */}
            <div style={{ 
              borderTop: '1px solid #e0e0e0', 
              paddingTop: '15px',
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap'
            }}>
              <strong style={{ color: '#333333', width: '100%', marginBottom: '10px' }}>
                Admin Actions:
              </strong>
              
              {selectedItem.status === 'pending' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusUpdate(selectedItem.id, 'verified');
                  }}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#3742fa',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  ✓ Verify Item
                </button>
              )}

              {selectedItem.status !== 'resolved' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusUpdate(selectedItem.id, 'resolved');
                  }}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#2ed573',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  ✓ Mark as Resolved
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (selectedItem.reporter_id || selectedItem.reporterId) {
                    const reporterId = selectedItem.reporter_id || selectedItem.reporterId;
                    setMessageRecipient({
                      id: reporterId,
                      name: selectedItem.username || selectedItem.reporter_name || 'Reporter'
                    });
                    setShowMessageModal(true);
                  } else {
                    alert('Reporter contact information not available');
                  }
                }}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#ffa502',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                📧 Contact Reporter
              </button>

              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  if (window.confirm('Are you sure you want to flag this item as suspicious?')) {
                    try {
                      await handleStatusUpdate(selectedItem.id, 'flagged');
                      alert('Item has been flagged as suspicious');
                    } catch (error) {
                      console.error('Error flagging item:', error);
                      alert('Error flagging item');
                    }
                  }
                }}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#ff4757',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                🚩 Flag Suspicious
              </button>
            </div>
          </div>
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

export default AdminLostFound;