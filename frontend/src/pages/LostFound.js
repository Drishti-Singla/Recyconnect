import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportedItemAPI, userAPI } from '../services/api';
import socketService from '../services/socket';
import { useTheme } from '../contexts/ThemeContext';
import logo from '../components/logo.png';
import ImageUpload from '../components/ImageUpload';
import CAMPUS_LOCATIONS from '../constants/locations';
import './Explore.css'; // Import CSS for styling

// Default avatar for items
const defaultAvatar = "https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-174669.jpg?semt=ais_hybrid&w=740&q=80";

const ProfileDropdown = ({ navigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (timeoutId) {
          clearTimeout(timeoutId);
          setTimeoutId(null);
        }
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, timeoutId]);

  const handleMouseEnter = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    const id = setTimeout(() => {
      setIsOpen(false);
    }, 3000);
    setTimeoutId(id);
  };

  const handleMenuSelect = (option) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsOpen(false);
    switch (option) {
      case "Dashboard":
        navigate("/dashboard");
        break;
      case "Raise Concern":
        navigate("/report-user");
        break;
      case "Logout":
        // Clear all authentication data
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('authToken');
        localStorage.removeItem('loginTime');
        // Navigate to home page instead of login to avoid auto-redirect loops
        navigate("/");
        break;
      default:
        break;
    }
  };

  return (
    <div 
      ref={dropdownRef}
      className="profile-dropdown" 
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        style={{
          background: "transparent",
          border: "2px solid #007bff",
          borderRadius: "50%",
          width: "45px",
          height: "45px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.3s ease",
          backgroundColor: isOpen ? "#007bff" : "transparent",
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{ color: isOpen ? "#fff" : "#007bff" }}
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      </button>
      
      {isOpen && (
        <div
          className="profile-dropdown-menu"
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            background: "#fff",
            border: "2px solid #e0e0e0",
            borderRadius: "22px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            zIndex: 1000,
            minWidth: "180px",
            marginTop: "8px",
          }}
        >
          {["Dashboard", "Raise Concern", "Logout"].map((option, index) => (
            <div
              key={index}
              className="profile-dropdown-option"
              style={{
                padding: "0.75rem 1rem",
                cursor: "pointer",
                transition: "background-color 0.2s ease",
                borderBottom: index < 2 ? "1px solid #f0f0f0" : "none",
                borderTopLeftRadius: index === 0 ? "20px" : "0",
                borderTopRightRadius: index === 0 ? "20px" : "0",
                borderBottomLeftRadius: index === 2 ? "20px" : "0",
                borderBottomRightRadius: index === 2 ? "20px" : "0",
                color: option === "Logout" ? "#dc3545" : "#333",
                fontWeight: option === "Logout" ? "500" : "normal",
              }}
              onClick={() => handleMenuSelect(option)}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = option === "Logout" ? "#fff5f5" : "#f8f9fa";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const LostFound = () => {
  const navigate = useNavigate();
  const { currentColors } = useTheme();
  
  // State variables
  const [activeTab, setActiveTab] = useState('lost');
  const [isLoading, setIsLoading] = useState(true);
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [reportedItems, setReportedItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('Recent');
  const [locationFilter, setLocationFilter] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [sellerInfo, setSellerInfo] = useState(null);
  const [loadingSellerInfo, setLoadingSellerInfo] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    color: '',
    brand: '',
    location_lost: '',
    location_found: '',
    date_lost: '',
    date_found: '',
    time_lost: '',
    time_found: '',
    current_location: '',
    image: ''
  });
  
  // Load items on component mount and when activeTab or showReportForm changes
  useEffect(() => {
    if (!showReportForm) {
      loadItems();
    }
  }, [showReportForm, activeTab]);
  
  // Filter items when search term, selected category, or items change
  useEffect(() => {
    filterItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedCategory, sortBy, locationFilter, lostItems, foundItems, reportedItems, activeTab]);
  
  // Auto-refresh data every 30 seconds to get updates when admin marks items as resolved
  useEffect(() => {
    const interval = setInterval(() => {
      loadItems();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  // Load all items from the unified reported_items table
  const loadItems = async () => {
    setIsLoading(true);
    try {
      // Fetch all reported items (both lost and found)
      const reportedResponse = await reportedItemAPI.getAllReportedItems();
      // Backend returns { reportedItems: [...] }
      const allItems = reportedResponse.reportedItems || [];
      
      console.log('API Response:', reportedResponse);
      console.log('All items:', allItems);
      if (allItems.length > 0) {
        console.log('First item structure:', allItems[0]);
        console.log('First item keys:', Object.keys(allItems[0]));
        console.log('First item location fields:', {
          location_lost: allItems[0].location_lost || allItems[0].locationLost,
          location_found: allItems[0].location_found || allItems[0].locationFound,
          current_location: allItems[0].current_location || allItems[0].currentLocation,
          report_type: allItems[0].report_type
        });
      }
      
      // Separate items by type
      const lost = allItems.filter(item => item.report_type === 'lost');
      const found = allItems.filter(item => item.report_type === 'found');
      
      setLostItems(lost);
      setFoundItems(found);
      setReportedItems(allItems); // Keep all items for reference
      
      console.log('Loaded items from unified table:', {
        lost: lost.length,
        found: found.length,
        total: allItems.length
      });
    } catch (error) {
      console.error('Error loading items:', error);
      // Set empty arrays on error
      setLostItems([]);
      setFoundItems([]);
      setReportedItems([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter items based on search term, category, condition, and sort order
  const filterItems = () => {
    // Combine all lost and found items
    let items = [...lostItems, ...foundItems];
    
    // Filter out pending, flagged, and resolved items for regular users (show active and verified items)
    items = items.filter(item => item.status === 'active' || item.status === 'verified');
    
    // Apply filters using Explore.js style logic
    const filtered = items.filter(item => {
      const term = searchTerm.toLowerCase().trim();
      // Search match (similar to Explore.js)
      const matchesSearch = term === "" || 
        (item.title || '').toLowerCase().includes(term) ||
        (item.description || '').toLowerCase().includes(term) ||
        (item.category || '').toLowerCase().includes(term) ||
        (item.brand || '').toLowerCase().includes(term) ||
        (item.color || '').toLowerCase().includes(term) ||
        (item.location_lost || item.locationLost || '').toLowerCase().includes(term) ||
        (item.location_found || item.locationFound || '').toLowerCase().includes(term) ||
        (item.current_location || item.currentLocation || '').toLowerCase().includes(term);
      
      // Smart category matching - handle both old and new category values
      let matchesCategory = selectedCategory === '';
      if (!matchesCategory) {
        const itemCategory = (item.category || '').toLowerCase();
        const filterCategory = selectedCategory.toLowerCase();
        
        // Direct match (exact category)
        matchesCategory = itemCategory === filterCategory;
      }
      
      // Location match
      const matchesLocation = locationFilter === "" ||
        (item.location_lost || '').toLowerCase().includes(locationFilter.toLowerCase()) ||
        (item.location_found || '').toLowerCase().includes(locationFilter.toLowerCase()) ||
        (item.current_location || '').toLowerCase().includes(locationFilter.toLowerCase());
      
      return matchesSearch && matchesCategory && matchesLocation;
    }).sort((a, b) => {
      // Apply sorting like in Explore.js
      switch (sortBy) {
        case 'Oldest':
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        case 'AZ':
          return (a.title || '').localeCompare(b.title || '');
        case 'ZA':
          return (b.title || '').localeCompare(a.title || '');
        case 'Recent':
        default:
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
    });
    
    setFilteredItems(filtered);
  };
  
  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      console.log('Submitting form data:', formData);
      
      // Validate required fields
      if (!formData.title || !formData.description) {
        alert('Please fill in all required fields: Title and Description');
        return;
      }
      
      // Validate type-specific required fields
      if (activeTab === 'lost' && !formData.location_lost) {
        alert('Please specify where the item was lost');
        return;
      }
      
      if (activeTab === 'found' && !formData.location_found) {
        alert('Please specify where the item was found');
        return;
      }
      
      // Prepare data for the backend
      const apiData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        report_type: activeTab, // 'lost' or 'found'
        status: 'active',
        image_urls: formData.image ? [formData.image] : []
      };
      
      // Set location based on item type
      if (activeTab === 'lost') {
        apiData.location = formData.location_lost.trim();
        apiData.date_lost_found = formData.date_lost || null;
        
        if (!apiData.location) {
          alert('Location lost is required and cannot be empty');
          return;
        }
      } else {
        apiData.location = formData.location_found.trim();
        apiData.date_lost_found = formData.date_found || null;
        
        if (!apiData.location) {
          alert('Location found is required and cannot be empty');
          return;
        }
      }
      
      // Log what we're submitting for debugging
      console.log('Submitting reported item:', apiData);
      console.log('Report type:', activeTab);
      
      // Submit to reported items API
      const response = await reportedItemAPI.createReportedItem(apiData);
      console.log('Item reported successfully:', response);
      
      // Reload items to show the newly posted item
      await loadItems();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        color: '',
        brand: '',
        location_lost: '',
        location_found: '',
        date_lost: '',
        date_found: '',
        time_lost: '',
        time_found: '',
        current_location: '',
        image: ''
      });
      
      // Close form and redirect to the appropriate tab (lost or found)
      setShowReportForm(false);
      setActiveTab(activeTab); // Stay on the current tab (lost or found)
      
      // Show success message
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error reporting item:', error);
      alert('Failed to submit item recovery. Please try again.');
    }
  };
  
  // Contact person handler
  const handleContact = async (item) => {
    // Get current user info
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserId = currentUser.id;
    
    // Get reporter ID from item
    const reporterId = item.reporter_id || item.reporterId || item.user_id;
    
    // Prevent user from contacting themselves
    if (currentUserId && reporterId && currentUserId === reporterId) {
      alert('⚠️ You cannot contact yourself on your own reported item!');
      return;
    }
    
    setSelectedItem(item);
    setShowContactModal(true);
    setLoadingSellerInfo(true);
    setSellerInfo(null);
    setChatMessage('');
    
    try {
      // For lost/found items, contact information might be stored differently
      // Check if there's an ownerId (reporterId) or use contact info from the item
      if (item.reporter_id || item.reporterId) {
        const reporter = await userAPI.getUserById(item.reporter_id || item.reporterId);
        console.log('Fetched reporter info:', reporter);
        
        // Check if user is deleted or invalid
        if (reporter && reporter.role !== 'DELETED' && reporter.name !== 'DELETED USER') {
          setSellerInfo(reporter);
        } else {
          // Handle deleted user case
          setSellerInfo({
            name: 'User No Longer Available',
            email: 'Contact information not available',
            phone: 'Contact information not available'
          });
        }
      } else {
        // No contact information available
        setSellerInfo({
          name: item.reporter_name || 'Anonymous Reporter',
          email: 'Contact information not available',
          phone: 'Contact information not available'
        });
      }
    } catch (error) {
      console.error('Error fetching reporter info:', error);
      // Set fallback info if API call fails
      setSellerInfo({
        name: item.reporter_name || 'Anonymous Reporter',
        email: item.contactInfo || item.contact_info || 'Contact information not available',
        phone: 'Contact information not available'
      });
    } finally {
      setLoadingSellerInfo(false);
    }
  };

  const closeContactModal = () => {
    setShowContactModal(false);
    setSelectedItem(null);
    setSellerInfo(null);
    setLoadingSellerInfo(false);
    setChatMessage('');
  };

  const handleStartChat = async () => {
    if (!chatMessage.trim()) {
      alert('Please enter a message');
      return;
    }

    // Get reporter ID from multiple possible fields
    const reporterId = sellerInfo?.id || selectedItem?.reporter_id || selectedItem?.reporterId;
    console.log('Sending message to reporter ID:', reporterId, 'Reporter info:', sellerInfo, 'Selected item:', selectedItem);
    
    if (!reporterId) {
      alert('Unable to identify reporter. Please try again later.');
      return;
    }

    setSendingMessage(true);
    try {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      
      if (!token) {
        alert('Please login to send messages');
        setSendingMessage(false);
        navigate('/login');
        return;
      }
      
      // Connect socket if not already connected
      if (!socketService.isConnected()) {
        socketService.connect(token);
      }

      // Send message via socket - it will handle both real-time delivery and persistence
      socketService.sendMessage(reporterId, chatMessage, selectedItem?.id);
      
      alert('✅ Message sent successfully! The reporter will receive your message.');
      closeContactModal();
      
    } catch (error) {
      console.error('Error sending message:', error);
      alert('❌ Failed to send message: ' + (error.message || 'Please try again.'));
    } finally {
      setSendingMessage(false);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  // Render component
  return (
    <div className="lost-found-page" style={{ background: currentColors?.background || "#f8f9fa", minHeight: "100vh" }}>
      {/* Top Navigation Bar */}
      <div 
        className="navbar"
        style={{
          padding: "1rem 2rem",
          background: currentColors?.cardBackground || "#fff",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <img src={logo} alt="Logo" style={{ width: 64, height: 64, marginRight: 10, objectFit: 'contain' }} />
          <h2 style={{ margin: 0, fontWeight: 'bold', letterSpacing: '2px', color: '#007bff', fontSize: '1.3rem' }}>
            RecyConnect
          </h2>
        </div>

        <nav style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          <button 
            onClick={() => navigate("/explore")} 
            style={{ 
              background: "none", 
              border: "none", 
              color: "#333", 
              cursor: "pointer",
              fontSize: "1rem",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              transition: "background-color 0.3s ease"
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "#f0f0f0"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
          >
            Explore
          </button>
          <button 
            onClick={() => navigate("/lost-found")} 
            style={{ 
              background: "#007bff", 
              color: "#fff",
              border: "none", 
              cursor: "pointer",
              fontSize: "1rem",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              fontWeight: "bold"
            }}
          >
            Lost & Found
          </button>
          <ProfileDropdown navigate={navigate} />
        </nav>
      </div>

      {/* Page Header */}
      <div className="bg-primary text-white py-5 mb-4">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <h1 className="display-4 fw-bold mb-3">
                <i className="fas fa-search me-2"></i>
                Lost & Found
              </h1>
              <p className="lead mb-4">
                Lost something or found an item? Report it here or browse through the listings.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-4">
        {/* Search & Filter Bar */}
        {!showReportForm && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-body">
                  {/* Search Bar - Matches Explore.js */}
                  <div className="row mb-3">
                    <div className="col-md-6 mx-auto">
                      <div className="input-group input-group-lg">
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Search items, categories, or locations..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="btn btn-primary" type="button">
                          <i className="fas fa-search"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Filters - Matches Explore.js structure */}
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Category</label>
                      <select 
                        className="form-select"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      >
                        <option value="">All Categories</option>
                        <optgroup label="📱 Electronics & Technology">
                          <option value="mobile-phones">Mobile Phones</option>
                          <option value="laptops">Laptops & Computers</option>
                          <option value="tablets">Tablets & E-readers</option>
                          <option value="cameras">Cameras & Photography</option>
                          <option value="audio">Audio & Headphones</option>
                          <option value="gaming">Gaming Consoles & Games</option>
                          <option value="smart-devices">Smart Devices & Wearables</option>
                          <option value="accessories">Tech Accessories</option>
                        </optgroup>
                        <optgroup label="👕 Fashion & Accessories">
                          <option value="mens-clothing">Men's Clothing</option>
                          <option value="womens-clothing">Women's Clothing</option>
                          <option value="shoes">Shoes & Footwear</option>
                          <option value="bags">Bags & Luggage</option>
                          <option value="jewelry">Jewelry & Watches</option>
                          <option value="sunglasses">Sunglasses & Eyewear</option>
                          <option value="fashion-accessories">Fashion Accessories</option>
                        </optgroup>
                        <optgroup label="📚 Books & Education">
                          <option value="textbooks">Textbooks</option>
                          <option value="novels">Novels & Fiction</option>
                          <option value="academic">Academic Books</option>
                          <option value="stationery">Stationery & Supplies</option>
                        </optgroup>
                        <optgroup label="⚽ Sports & Fitness">
                          <option value="gym-equipment">Gym & Fitness Equipment</option>
                          <option value="sports-gear">Sports Gear & Equipment</option>
                          <option value="bicycles">Bicycles & Cycling</option>
                        </optgroup>
                        <optgroup label="💼 Office & Business">
                          <option value="office-supplies">Office Supplies</option>
                          <option value="documents">Documents & IDs</option>
                        </optgroup>
                        <optgroup label="🎨 Other">
                          <option value="keys">Keys</option>
                          <option value="cards">Cards & Wallets</option>
                          <option value="other">Other Items</option>
                        </optgroup>
                      </select>
                    </div>
                    
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Location</label>
                      <select 
                        className="form-select"
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                      >
                        <option value="">Any Location</option>
                        {CAMPUS_LOCATIONS.map((location, index) => (
                          <option key={index} value={location}>{location}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Sort By</label>
                      <select 
                        className="form-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                      >
                        <option value="Recent">Most Recent</option>
                        <option value="Oldest">Oldest First</option>
                        <option value="AZ">A-Z</option>
                        <option value="ZA">Z-A</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-12 mb-3 d-flex justify-content-center">
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedCategory('');
                          setLocationFilter('');
                          setSortBy('Recent');
                        }}
                      >
                        <i className="fas fa-times me-1"></i> Clear All Filters
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Item Listings / Cards */}
        {!showReportForm && (
          <div className="row">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0" style={{ color: currentColors.text }}>
                  {filteredItems.length} Reported {filteredItems.length === 1 ? 'Item' : 'Items'}
                  {(searchTerm || selectedCategory) && (
                    <small className="text-muted ms-2">
                      {searchTerm && `"${searchTerm}"`}
                      {selectedCategory && ` in ${selectedCategory}`}
                    </small>
                  )}
                </h4>
                <div>
                  <span className="badge bg-danger me-2">
                    <i className="fas fa-search me-1"></i>Lost: {lostItems.filter(item => !item.isResolved && item.status !== 'resolved').length}
                  </span>
                  <span className="badge bg-success">
                    <i className="fas fa-hand-holding me-1"></i>Found: {foundItems.filter(item => !item.isResolved && item.status !== 'resolved').length}
                  </span>
                </div>
              </div>
              
              {isLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="text-muted mt-2">Loading items...</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-search fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">No items found</h5>
                  <p className="text-muted">Try adjusting your filters or be the first to report an item!</p>
                </div>
              ) : (
                <div className="row">
                  {filteredItems.map(item => {
                    // Determine if this item is from the reported items table
                    const isReportedItem = item.hasOwnProperty('report_type');
                    // Get the appropriate status based on item type
                    const itemStatus = isReportedItem 
                      ? item.report_type || item.status
                      : activeTab;
                    // Get location - database has single 'location' field
                    const itemLocation = item.location || 'Location not specified';
                    // Get reporter name from username field
                    const reporterName = item.username || 'Unknown Reporter';
                    
                    return (
                      <div key={item.id} className="col-lg-4 col-md-6 mb-4">
                        <div className="card h-100 shadow-sm">
                          {/* Item Image */}
                          {item.image_urls && item.image_urls.length > 0 && item.image_urls[0] && (
                            <img 
                              src={item.image_urls[0]} 
                              className="card-img-top" 
                              alt={item.title}
                              style={{ 
                                height: '200px', 
                                objectFit: 'cover',
                                cursor: 'pointer'
                              }}
                              onClick={() => window.open(item.image_urls[0], '_blank')}
                            />
                          )}
                          <div className="card-body d-flex flex-column">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h5 className="card-title mb-0">{item.title}</h5>
                              <div className="d-flex flex-column align-items-end">
                                <span className="badge bg-primary mb-1">
                                  {item.category}
                                </span>
                                <span className="badge bg-success">
                                  {item.color || 'No Color'}
                                </span>
                                {itemStatus === 'lost' && (
                                  <span className="badge bg-danger mt-1">
                                    🔍 LOST
                                  </span>
                                )}
                                {itemStatus === 'found' && (
                                  <span className="badge bg-success mt-1">
                                    ✅ FOUND
                                  </span>
                                )}
                                {item.urgent && (
                                  <span className="badge bg-warning text-dark mt-1">URGENT</span>
                                )}
                                {(item.isResolved || item.status === 'resolved') && (
                                  <span className="badge bg-secondary mt-1">
                                    ✓ RESOLVED
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <p className="card-text text-muted flex-grow-1">{item.description}</p>
                            
                            <div className="mt-auto">
                              <div className="row text-sm mb-3">
                                <div className="col-6">
                                  <strong>Status:</strong><br />
                                  <span className={(itemStatus === 'lost') ? "text-danger fw-bold" : "text-success fw-bold"}>
                                    {itemStatus === 'lost' ? "LOST ITEM" : "FOUND ITEM"}
                                  </span>
                                </div>
                                <div className="col-6">
                                  <strong>Reporter:</strong><br />
                                  <span className="text-muted">{reporterName}</span>
                                </div>
                              </div>
                              
                              <div className="row text-sm mb-3">
                                <div className="col-6">
                                  <strong>Posted:</strong><br />
                                  <span className="text-muted">
                                    {item.created_at 
                                      ? new Date(item.created_at).toLocaleDateString() 
                                      : "Unknown"}
                                  </span>
                                </div>
                                <div className="col-6">
                                  <strong>Location:</strong><br />
                                  <span className="text-muted">
                                    {itemLocation}
                                  </span>
                                </div>
                              </div>
                              
                              <button 
                                className="btn btn-outline-primary w-100 mb-2"
                                onClick={() => handleContact(item)}
                              >
                                <i className="fas fa-envelope me-2"></i>
                                Contact
                              </button>
                              
                              <button 
                                className="btn btn-outline-warning w-100"
                                onClick={async () => {
                                  const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
                                  if (!token) {
                                    alert('Please login to flag items');
                                    navigate('/login');
                                    return;
                                  }
                                  
                                  const reason = prompt('Why are you flagging this item?');
                                  if (!reason) return;
                                  
                                  try {
                                    const response = await fetch('http://localhost:8080/api/flags', {
                                      method: 'POST',
                                      headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${token}`
                                      },
                                      body: JSON.stringify({
                                        targetType: 'reported_item',
                                        targetId: item.id,
                                        reason: reason,
                                        severity: 'medium'
                                      })
                                    });
                                    
                                    const data = await response.json();
                                    
                                    if (response.ok) {
                                      alert('✅ Item flagged successfully! Admin will review it.');
                                    } else {
                                      alert('❌ ' + (data.error || 'Failed to flag item'));
                                    }
                                  } catch (error) {
                                    console.error('Flag error:', error);
                                    alert('❌ Failed to flag item. Please try again.');
                                  }
                                }}
                              >
                                <i className="fas fa-flag me-2"></i>
                                Flag Item
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Item Recovery Form */}
        {showReportForm && (
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="card shadow">
                <div className="card-header bg-primary text-white">
                  <h4 className="mb-0">
                    <i className={`fas ${activeTab === 'lost' ? 'fa-search' : 'fa-hand-holding'} me-2`}></i>
                    Item Recovery - {activeTab === 'lost' ? 'Lost' : 'Found'} Item
                  </h4>
                </div>
                <div className="card-body">
                  {showSuccess && (
                    <div className="alert alert-success alert-dismissible fade show" role="alert">
                      <i className="fas fa-check-circle me-2"></i>
                      <strong>Success!</strong> Your report has been submitted successfully!
                      <button type="button" className="btn-close" onClick={() => setShowSuccess(false)}></button>
                    </div>
                  )}
                  
                  <form onSubmit={handleFormSubmit}>
                    {/* Image Upload */}
                    <div className="mb-4">
                      <ImageUpload
                        label="Item Image (Optional)"
                        onImageSelect={(url) => setFormData(prev => ({ ...prev, image: url }))}
                        onImageRemove={() => setFormData(prev => ({ ...prev, image: '' }))}
                        existingImage={formData.image}
                      />
                    </div>

                    {/* Item Type Toggle */}
                    <div className="mb-4">
                      <label className="form-label">Item Type *</label>
                      <div className="d-flex">
                        <div className="btn-group w-100" role="group">
                          <button
                            type="button"
                            className={`btn ${activeTab === 'lost' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setActiveTab('lost')}
                          >
                            <i className="fas fa-search me-2"></i>Lost Item
                          </button>
                          <button
                            type="button"
                            className={`btn ${activeTab === 'found' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setActiveTab('found')}
                          >
                            <i className="fas fa-hand-holding me-2"></i>Found Item
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="title" className="form-label">Item Title *</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="col-md-6 mb-3">
                        <label htmlFor="category" className="form-label">Category *</label>
                        <select 
                          className="form-select" 
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select Category</option>
                          <optgroup label="📱 Electronics & Technology">
                            <option value="mobile-phones">Mobile Phones</option>
                            <option value="laptops">Laptops & Computers</option>
                            <option value="tablets">Tablets & E-readers</option>
                            <option value="cameras">Cameras & Photography</option>
                            <option value="audio">Audio & Headphones</option>
                            <option value="gaming">Gaming Consoles & Games</option>
                            <option value="smart-devices">Smart Devices & Wearables</option>
                            <option value="accessories">Tech Accessories</option>
                          </optgroup>
                          <optgroup label="👕 Fashion & Accessories">
                            <option value="mens-clothing">Men's Clothing</option>
                            <option value="womens-clothing">Women's Clothing</option>
                            <option value="shoes">Shoes & Footwear</option>
                            <option value="bags">Bags & Luggage</option>
                            <option value="jewelry">Jewelry & Watches</option>
                            <option value="sunglasses">Sunglasses & Eyewear</option>
                            <option value="fashion-accessories">Fashion Accessories</option>
                          </optgroup>
                          <optgroup label="📚 Books & Education">
                            <option value="textbooks">Textbooks</option>
                            <option value="novels">Novels & Fiction</option>
                            <option value="academic">Academic Books</option>
                            <option value="stationery">Stationery & Supplies</option>
                          </optgroup>
                          <optgroup label="⚽ Sports & Fitness">
                            <option value="gym-equipment">Gym & Fitness Equipment</option>
                            <option value="sports-gear">Sports Gear & Equipment</option>
                            <option value="bicycles">Bicycles & Cycling</option>
                          </optgroup>
                          <optgroup label="💼 Office & Business">
                            <option value="office-supplies">Office Supplies</option>
                            <option value="documents">Documents & IDs</option>
                          </optgroup>
                          <optgroup label="🎨 Other">
                            <option value="keys">Keys</option>
                            <option value="cards">Cards & Wallets</option>
                            <option value="other">Other Items</option>
                          </optgroup>
                        </select>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="description" className="form-label">Description *</label>
                      <textarea 
                        className="form-control" 
                        id="description"
                        name="description"
                        rows="3"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                      ></textarea>
                      <div className="form-text">
                        Please provide as much detail as possible to help identify the item.
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="color" className="form-label">Color</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="color"
                          name="color"
                          value={formData.color}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="col-md-6 mb-3">
                        <label htmlFor="brand" className="form-label">Brand</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="brand"
                          name="brand"
                          value={formData.brand}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    {activeTab === 'lost' ? (
                      // Lost item specific fields
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="location_lost" className="form-label">Location Lost *</label>
                          <select 
                            className="form-select" 
                            id="location_lost"
                            name="location_lost"
                            value={formData.location_lost}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Select a location</option>
                            {CAMPUS_LOCATIONS.map((location, index) => (
                              <option key={index} value={location}>{location}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="col-md-6 mb-3">
                          <label htmlFor="date_lost" className="form-label">Date Lost *</label>
                          <input 
                            type="date" 
                            className="form-control" 
                            id="date_lost"
                            name="date_lost"
                            value={formData.date_lost}
                            onChange={handleInputChange}
                            max={new Date().toISOString().split('T')[0]}
                            required
                          />
                          <div className="form-text">
                            Cannot select a future date
                          </div>
                        </div>
                        
                        <div className="col-md-6 mb-3">
                          <label htmlFor="time_lost" className="form-label">Time Lost (approximate)</label>
                          <input 
                            type="time" 
                            className="form-control" 
                            id="time_lost"
                            name="time_lost"
                            value={formData.time_lost}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    ) : (
                      // Found item specific fields
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="location_found" className="form-label">Location Found *</label>
                          <select 
                            className="form-select" 
                            id="location_found"
                            name="location_found"
                            value={formData.location_found}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Select a location</option>
                            {CAMPUS_LOCATIONS.map((location, index) => (
                              <option key={index} value={location}>{location}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="col-md-6 mb-3">
                          <label htmlFor="date_found" className="form-label">Date Found *</label>
                          <input 
                            type="date" 
                            className="form-control" 
                            id="date_found"
                            name="date_found"
                            value={formData.date_found}
                            onChange={handleInputChange}
                            max={new Date().toISOString().split('T')[0]}
                            required
                          />
                          <div className="form-text">
                            Cannot select a future date
                          </div>
                        </div>
                        
                        <div className="col-md-6 mb-3">
                          <label htmlFor="time_found" className="form-label">Time Found (approximate)</label>
                          <input 
                            type="time" 
                            className="form-control" 
                            id="time_found"
                            name="time_found"
                            value={formData.time_found}
                            onChange={handleInputChange}
                          />
                        </div>
                        
                        <div className="col-md-6 mb-3">
                          <label htmlFor="current_location" className="form-label">Current Item Location *</label>
                          <select 
                            className="form-select" 
                            id="current_location"
                            name="current_location"
                            value={formData.current_location}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Where is the item being kept?</option>
                            {CAMPUS_LOCATIONS.map((location, index) => (
                              <option key={index} value={location}>{location}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                    
                    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary"
                        onClick={() => setShowReportForm(false)}
                      >
                        <i className="fas fa-times me-2"></i>Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                      >
                        <i className="fas fa-paper-plane me-2"></i>Submit Report
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Contact Modal */}
      {showContactModal && selectedItem && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={closeContactModal}
        >
          <div 
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#333' }}>Contact Reporter</h3>
              <button 
                onClick={closeContactModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <img 
                  src={(selectedItem.image_urls && selectedItem.image_urls.length > 0 && selectedItem.image_urls[0]) || selectedItem.image || defaultAvatar} 
                  alt={selectedItem.title}
                  style={{
                    width: '80px',
                    height: '80px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '2px solid #e0e0e0'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>{selectedItem.title}</h4>
                  <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>
                    <span style={{ 
                      backgroundColor: (selectedItem.report_type === 'lost' || selectedItem.itemType === 'lost') ? '#ff475720' : '#2ed57320',
                      color: (selectedItem.report_type === 'lost' || selectedItem.itemType === 'lost') ? '#ff4757' : '#2ed573',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {(selectedItem.report_type === 'lost' || selectedItem.itemType === 'lost') ? '🔍 Lost Item' : '✅ Found Item'}
                    </span>
                  </p>
                  <p style={{ margin: 0, color: '#888', fontSize: '12px' }}>
                    Reporter: {sellerInfo ? sellerInfo.name : (selectedItem.username || selectedItem.reporter_name || 'Loading...')}
                  </p>
                </div>
              </div>
              
              {/* Item Description */}
              <div style={{ 
                backgroundColor: '#fff',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                marginBottom: '12px'
              }}>
                <h5 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '14px', fontWeight: '600' }}>Description:</h5>
                <p style={{ margin: 0, color: '#666', fontSize: '14px', lineHeight: '1.5' }}>
                  {selectedItem.description || 'No description provided'}
                </p>
              </div>
            </div>
            
            {loadingSellerInfo ? (
              <div style={{ backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
                <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                <span style={{ color: '#666' }}>Connecting to reporter...</span>
              </div>
            ) : (
              <div style={{ backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                <h5 style={{ margin: '0 0 12px 0', color: '#333' }}>About this Item</h5>
                <div style={{ marginBottom: '8px' }}>
                  <strong>📍 Location:</strong> {selectedItem.location || 'Location not specified'}
                </div>
                <div style={{ color: '#666', fontSize: '14px', marginTop: '12px' }}>
                  💬 Send a message to start chatting with the reporter. They'll receive your message instantly.
                </div>
              </div>
            )}
            
            {/* Chat Message Input */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                💬 Send a message to the reporter
              </label>
              <textarea
                placeholder={`Hi! I found information about "${selectedItem.title}". Can we discuss?`}
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                disabled={sendingMessage || loadingSellerInfo}
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '12px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>
            
            <button
              onClick={handleStartChat}
              disabled={sendingMessage || loadingSellerInfo || !chatMessage.trim()}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: (sendingMessage || loadingSellerInfo || !chatMessage.trim()) ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: (sendingMessage || loadingSellerInfo || !chatMessage.trim()) ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!sendingMessage && !loadingSellerInfo && chatMessage.trim()) {
                  e.target.style.backgroundColor = '#0056b3';
                }
              }}
              onMouseLeave={(e) => {
                if (!sendingMessage && !loadingSellerInfo && chatMessage.trim()) {
                  e.target.style.backgroundColor = '#007bff';
                }
              }}
            >
              {sendingMessage ? (
                <>
                  <div className="spinner-border spinner-border-sm" role="status"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span>📨</span>
                  <span>Send Message</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Buttons */}
      <div
        style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {/* Messages Button */}
        <button
          style={{
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "50px",
            padding: "1rem 2rem",
            fontWeight: "bold",
            fontSize: "1rem",
            cursor: "pointer",
            boxShadow: "0 6px 20px rgba(0, 123, 255, 0.4)",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
          onClick={() => navigate("/dashboard?section=messages")}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-3px) scale(1.05)";
            e.target.style.boxShadow = "0 8px 25px rgba(0, 123, 255, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0) scale(1)";
            e.target.style.boxShadow = "0 6px 20px rgba(0, 123, 255, 0.4)";
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>💬</span>
          Messages
        </button>

        {/* Report Item Button */}
        <button
          style={{
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "50px",
            padding: "1rem 2rem",
            fontWeight: "bold",
            fontSize: "1rem",
            cursor: "pointer",
            boxShadow: "0 6px 20px rgba(0, 123, 255, 0.4)",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
          onClick={() => setShowReportForm(true)}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-3px) scale(1.05)";
            e.target.style.boxShadow = "0 8px 25px rgba(0, 123, 255, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0) scale(1)";
            e.target.style.boxShadow = "0 6px 20px rgba(0, 123, 255, 0.4)";
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>🔍</span>
          Report Item
        </button>
      </div>
    </div>
  );
};

export default LostFound;