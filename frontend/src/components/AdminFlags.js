import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { flagAPI } from '../services/api';

function AdminFlags() {
  const { currentColors } = useTheme();
  const [flags, setFlags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Mock data for demonstration
  const mockFlags = [
    {
      id: 1,
      itemId: 'ITEM001',
      itemTitle: 'Vintage Bicycle',
      reportedBy: 'user123',
      reporterEmail: 'user123@example.com',
      reason: 'Inappropriate content',
      description: 'Item contains offensive material in the description',
      status: 'pending',
      priority: 'high',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      itemCategory: 'Sports Equipment',
      itemLocation: 'Downtown'
    },
    {
      id: 2,
      itemId: 'ITEM002',
      itemTitle: 'Used Laptop',
      reportedBy: 'user456',
      reporterEmail: 'user456@example.com',
      reason: 'Fraud or scam',
      description: 'Seller asking for money upfront without showing actual item',
      status: 'under_review',
      priority: 'high',
      createdAt: '2024-01-14T15:45:00Z',
      updatedAt: '2024-01-15T09:20:00Z',
      itemCategory: 'Electronics',
      itemLocation: 'North Side'
    },
    {
      id: 3,
      itemId: 'ITEM003',
      itemTitle: 'Kitchen Utensils Set',
      reportedBy: 'user789',
      reporterEmail: 'user789@example.com',
      reason: 'Spam or duplicate',
      description: 'Same item posted multiple times by the same user',
      status: 'resolved',
      priority: 'medium',
      createdAt: '2024-01-13T12:15:00Z',
      updatedAt: '2024-01-14T16:30:00Z',
      itemCategory: 'Home & Garden',
      itemLocation: 'East Side',
      resolution: 'Duplicate posts removed, user warned'
    },
    {
      id: 4,
      itemId: 'ITEM004',
      itemTitle: 'Textbook Collection',
      reportedBy: 'user321',
      reporterEmail: 'user321@example.com',
      reason: 'Misleading information',
      description: 'Books described as new but appear heavily used in photos',
      status: 'pending',
      priority: 'low',
      createdAt: '2024-01-12T14:20:00Z',
      updatedAt: '2024-01-12T14:20:00Z',
      itemCategory: 'Books & Education',
      itemLocation: 'University Area'
    }
  ];

  useEffect(() => {
    loadFlags();
  }, []);

  const loadFlags = async () => {
    try {
      setIsLoading(true);
      const data = await flagAPI.getAllFlags();
      console.log('Loaded flags:', data);
      setFlags(data.flags || data || []);
    } catch (error) {
      console.error('Error loading flags:', error);
      setFlags([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (flagId, newStatus) => {
    try {
      await flagAPI.updateFlag(flagId, { status: newStatus });
      await loadFlags(); // Reload flags after update
      alert(`Flag status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating flag status:', error);
      alert(`Failed to update flag status: ${error.message}`);
    }
  };

  const handlePriorityChange = async (flagId, newSeverity) => {
    try {
      await flagAPI.updateFlag(flagId, { severity: newSeverity });
      await loadFlags();
      alert(`Flag severity updated to ${newSeverity}`);
    } catch (error) {
      console.error('Error updating flag severity:', error);
      alert(`Failed to update flag severity: ${error.message}`);
    }
  };

  const handleResolveFlag = async (flagId, actionTaken) => {
    try {
      await flagAPI.updateFlag(flagId, { 
        status: 'resolved', 
        action_taken: actionTaken
      });
      await loadFlags();
      alert('Flag resolved successfully');
    } catch (error) {
      console.error('Error resolving flag:', error);
      alert(`Failed to resolve flag: ${error.message}`);
    }
  };

  const handleUnflag = async (flagId) => {
    if (!window.confirm('Are you sure you want to delete this flag? This action cannot be undone.')) {
      return;
    }
    try {
      await flagAPI.deleteFlag(flagId);
      await loadFlags();
      alert('Flag deleted successfully');
    } catch (error) {
      console.error('Error deleting flag:', error);
      alert(`Failed to delete flag: ${error.message}`);
    }
  };

  const filteredFlags = flags.filter(flag => {
    if (filter === 'all') return true;
    return flag.status === filter;
  });

  const sortedFlags = [...filteredFlags].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'oldest':
        return new Date(a.created_at) - new Date(b.created_at);
      case 'priority':
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.severity] || 0) - (priorityOrder[a.severity] || 0);
      default:
        return 0;
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffa500';
      case 'under_review': return '#007bff';
      case 'resolved': return '#28a745';
      case 'dismissed': return '#6c757d';
      default: return '#ffa500';
    }
  };

  const getPriorityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#8b0000';
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const containerStyle = {
    padding: '20px',
    backgroundColor: currentColors.background,
    color: currentColors.text,
    minHeight: '100vh'
  };

  const cardStyle = {
    backgroundColor: currentColors.surface,
    border: `1px solid ${currentColors.border}`,
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px'
  };

  const buttonStyle = {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '8px',
    marginBottom: '8px',
    fontSize: '14px'
  };

  if (isLoading) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div>Loading flags...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: '20px' }}>
        <h2>Flag Management</h2>
        <p>Review and manage reported items and content flags.</p>
      </div>

      {/* Filters and Controls */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label style={{ marginRight: '8px' }}>Filter by status:</label>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              style={{
                padding: '8px',
                border: `1px solid ${currentColors.border}`,
                borderRadius: '4px',
                backgroundColor: currentColors.background,
                color: currentColors.text
              }}
            >
              <option value="all">All Flags</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>

          <div>
            <label style={{ marginRight: '8px' }}>Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '8px',
                border: `1px solid ${currentColors.border}`,
                borderRadius: '4px',
                backgroundColor: currentColors.background,
                color: currentColors.text
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div style={cardStyle}>
        <h3>Flag Statistics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffa500' }}>
              {flags.filter(f => f.status === 'pending').length}
            </div>
            <div>Pending</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
              {flags.filter(f => f.status === 'under_review').length}
            </div>
            <div>Under Review</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
              {flags.filter(f => f.status === 'resolved').length}
            </div>
            <div>Resolved</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
              {flags.filter(f => f.severity === 'high' || f.severity === 'critical').length}
            </div>
            <div>High/Critical</div>
          </div>
        </div>
      </div>

      {/* Flags List */}
      <div>
        {sortedFlags.length === 0 ? (
          <div style={cardStyle}>
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '18px', marginBottom: '10px' }}>No flags found</div>
              <div style={{ color: currentColors.textSecondary }}>
                {filter !== 'all' ? `No ${filter} flags at the moment.` : 'No flags have been submitted yet.'}
              </div>
            </div>
          </div>
        ) : (
          sortedFlags.map(flag => (
            <div key={flag.id} style={cardStyle}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', alignItems: 'start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0 }}>Flag #{flag.id}</h3>
                    <span style={{
                      backgroundColor: getStatusColor(flag.status),
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      textTransform: 'capitalize'
                    }}>
                      {flag.status.replace('_', ' ')}
                    </span>
                    <span style={{
                      backgroundColor: getPriorityColor(flag.severity),
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      textTransform: 'capitalize'
                    }}>
                      {flag.severity} Severity
                    </span>
                  </div>

                  {/* Item Image */}
                  {flag.target_images && flag.target_images.length > 0 && flag.target_images[0] && (
                    <div style={{ marginBottom: '15px' }}>
                      <img 
                        src={flag.target_images[0]} 
                        alt={flag.target_title}
                        style={{
                          maxWidth: '200px',
                          maxHeight: '200px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: `1px solid ${currentColors.border}`
                        }}
                      />
                    </div>
                  )}

                  <div style={{ marginBottom: '15px' }}>
                    <strong>Item:</strong> {flag.target_title || 'N/A'} (ID: {flag.target_id}, Type: {flag.target_type})
                    <br />
                    {flag.target_category && (
                      <>
                        <strong>Category:</strong> {flag.target_category}
                        <br />
                      </>
                    )}
                    {flag.target_location && (
                      <>
                        <strong>Location:</strong> {flag.target_location}
                        <br />
                      </>
                    )}
                    {flag.target_username && (
                      <>
                        <strong>Item Owner:</strong> {flag.target_username}
                        <br />
                      </>
                    )}
                    <strong>Reported by:</strong> {flag.flagger_username || 'Unknown'} {flag.flagger_email ? `(${flag.flagger_email})` : ''}
                    <br />
                    <strong>Reason:</strong> {flag.reason}
                    <br />
                    <strong>Severity:</strong> {flag.severity}
                    <br />
                    <strong>Created:</strong> {new Date(flag.created_at).toLocaleString()}
                    <br />
                    <strong>Last updated:</strong> {new Date(flag.updated_at).toLocaleString()}
                  </div>

                  {flag.admin_notes && (
                    <div style={{ marginBottom: '15px' }}>
                      <strong>Admin Notes:</strong>
                      <div style={{
                        backgroundColor: currentColors.background,
                        padding: '10px',
                        borderRadius: '4px',
                        border: `1px solid ${currentColors.border}`,
                        marginTop: '5px'
                      }}>
                        {flag.admin_notes}
                      </div>
                    </div>
                  )}

                  {flag.action_taken && (
                    <div style={{ marginBottom: '15px' }}>
                      <strong>Action Taken:</strong>
                      <div style={{
                        backgroundColor: '#d4edda',
                        color: '#155724',
                        padding: '10px',
                        borderRadius: '4px',
                        border: '1px solid #c3e6cb',
                        marginTop: '5px'
                      }}>
                        {flag.action_taken}
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ minWidth: '200px' }}>
                  <div style={{ marginBottom: '15px' }}>
                    <strong>Actions:</strong>
                  </div>
                  
                  {flag.status !== 'resolved' && flag.status !== 'dismissed' && (
                    <>
                      {flag.status === 'pending' && (
                        <button
                          onClick={() => handleStatusChange(flag.id, 'under_review')}
                          style={{
                            ...buttonStyle,
                            backgroundColor: '#007bff',
                            color: 'white'
                          }}
                        >
                          Mark Under Review
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          const actionTaken = prompt('What action was taken to resolve this flag?');
                          if (actionTaken) {
                            handleResolveFlag(flag.id, actionTaken);
                          }
                        }}
                        style={{
                          ...buttonStyle,
                          backgroundColor: '#28a745',
                          color: 'white'
                        }}
                      >
                        Resolve
                      </button>

                      <button
                        onClick={() => handleStatusChange(flag.id, 'dismissed')}
                        style={{
                          ...buttonStyle,
                          backgroundColor: '#6c757d',
                          color: 'white'
                        }}
                      >
                        Dismiss
                      </button>

                      <button
                        onClick={() => handleUnflag(flag.id)}
                        style={{
                          ...buttonStyle,
                          backgroundColor: '#dc3545',
                          color: 'white'
                        }}
                      >
                        Unflag (Delete)
                      </button>
                    </>
                  )}

                  <div style={{ marginTop: '15px' }}>
                    <strong>Severity:</strong>
                    <select
                      value={flag.severity}
                      onChange={(e) => handlePriorityChange(flag.id, e.target.value)}
                      disabled={flag.status === 'resolved' || flag.status === 'dismissed'}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: `1px solid ${currentColors.border}`,
                        borderRadius: '4px',
                        backgroundColor: flag.status === 'resolved' || flag.status === 'dismissed' ? '#e9ecef' : currentColors.background,
                        color: currentColors.text,
                        marginTop: '5px',
                        cursor: flag.status === 'resolved' || flag.status === 'dismissed' ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminFlags;