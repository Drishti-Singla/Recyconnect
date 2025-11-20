import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from '../contexts/ThemeContext';
import { itemAPI, donatedItemAPI, userAPI } from '../services/api';
import socketService from '../services/socket';
import logo from '../components/logo.png';
import "./Explore.css";

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

export default function Explore() {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("Recent");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [conditionFilter, setConditionFilter] = useState("");
  const [donationFilter, setDonationFilter] = useState("all");
  const [currentUser, setCurrentUser] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [sellerInfo, setSellerInfo] = useState(null);
  const [loadingSellerInfo, setLoadingSellerInfo] = useState(false);
  const [hoveredItemId, setHoveredItemId] = useState(null);
  const [showItemMenu, setShowItemMenu] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const navigate = useNavigate();
  const { currentColors } = useTheme();

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showItemMenu !== null) {
        setShowItemMenu(null);
      }
    };

    if (showItemMenu !== null) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showItemMenu]);

  // Get current user from localStorage
  useEffect(() => {
    const userData = sessionStorage.getItem('user') || localStorage.getItem('user');
    if (userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Sample data for development
  const sampleItems = [
    {
      id: 1,
      title: "iPhone 13 Pro",
      description: "Excellent condition iPhone 13 Pro with 256GB storage. Comes with original charger and case.",
      price: "₹45,000",
      category: "Electronics",
      condition: "Like New",
      image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300",
      owner: { name: "Rahul Sharma" },
      location: "Campus Block A",
      date: new Date().toLocaleDateString(),
      urgent: true
    },
    {
      id: 2,
      title: "Study Desk",
      description: "Wooden study desk in good condition. Perfect for students.",
      price: "₹3,500",
      category: "Furniture",
      condition: "Good",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300",
      owner: { name: "Priya Singh" },
      location: "Campus Block B",
      date: new Date().toLocaleDateString(),
      urgent: false
    },
    {
      id: 3,
      title: "Engineering Textbooks",
      description: "Complete set of CSE textbooks for 2nd year. All in excellent condition.",
      price: "₹2,000",
      category: "Books",
      condition: "Excellent",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
      owner: { name: "Amit Kumar" },
      location: "Library Area",
      date: new Date().toLocaleDateString(),
      urgent: false
    },
    {
      id: 4,
      title: "Gaming Laptop",
      description: "High-performance gaming laptop with RTX graphics. Perfect for gaming and development.",
      price: "₹75,000",
      category: "Electronics",
      condition: "Excellent",
      image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=300",
      owner: { name: "Vikash Gupta" },
      location: "Hostel Block C",
      date: new Date().toLocaleDateString(),
      urgent: true
    }
  ];

  // Load items function - moved outside useEffect so it can be called from handlers
  const loadItems = async () => {
    try {
      // Load regular items first
      const regularItemsResponse = await itemAPI.getAllItems();
      
      console.log('Loaded items response:', regularItemsResponse);
      
      let regularItems = [];
      if (regularItemsResponse) {
        // apiCall returns the JSON directly, so it should be the array
        regularItems = Array.isArray(regularItemsResponse) ? regularItemsResponse : [];
      }
      
      // Try to load donated items, but don't fail if not available
      let donatedItems = [];
      try {
        const donatedItemsResponse = await donatedItemAPI.getAllDonatedItems();
        console.log('Donated items response:', donatedItemsResponse);
        
        // Handle different response structures - unwrap donatedItems if needed
        if (donatedItemsResponse && donatedItemsResponse.donatedItems) {
          donatedItems = donatedItemsResponse.donatedItems;
        } else if (Array.isArray(donatedItemsResponse)) {
          donatedItems = donatedItemsResponse;
        }
        console.log('Donated items loaded:', donatedItems.length);
      } catch (donatedError) {
        console.warn('Donated items API not available:', donatedError.message);
      }
      
      // Add a type field to distinguish between regular and donated items
      const regularItemsWithType = regularItems
        .filter(item => item.status !== 'sold') // Filter out sold items
        .map(item => ({
          ...item,
          type: 'sale',
          isDonated: false,
          // Ensure snake_case fields are available
          asking_price: item.asking_price,
          created_at: item.created_at,
          seller_name: item.username || 'Unknown Seller',
          ownerId: item.user_id,
          image: item.image_urls && item.image_urls.length > 0 ? item.image_urls[0] : null
        }));
      
      const donatedItemsWithType = donatedItems
        .filter(item => item.status !== 'claimed' && item.status !== 'archived') // Filter out claimed/archived items
        .map(item => ({
          ...item,
          type: 'donated',
          isDonated: true,
          seller_name: item.username || 'Anonymous Donor',
          ownerId: item.donor_id,
          price: 'Donated Item', // Override price for donated items
          location: item.pickup_location,
          created_at: item.created_at,
          image: item.image_urls && item.image_urls.length > 0 ? item.image_urls[0] : null
        }));
      
      // Combine both arrays
      const allItems = [...regularItemsWithType, ...donatedItemsWithType];
      
      console.log(`Regular items loaded: ${regularItems.length}`);
      console.log(`Donated items loaded: ${donatedItems.length}`);
      console.log(`Total items loaded: ${allItems.length}`);
      console.log('All items data:', allItems);
      
      // Always use real items from database, never use sample data
      setItems(allItems);
    } catch (error) {
      console.error('Error loading items:', error);
      // On error, show empty array instead of sample items
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Load items from API
  useEffect(() => {
    loadItems();
    
    // Auto-refresh items every 30 seconds to get updates
    const refreshInterval = setInterval(() => {
      loadItems();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(refreshInterval);
  }, []);

  // Contact seller handler
  const handleContactSeller = async (item) => {
    // Get current user info
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserId = currentUser.id;
    
    // Get seller ID from item
    const sellerId = item.user_id || item.seller_id || item.owner_id || item.userId || item.ownerId;
    
    // Prevent user from contacting themselves
    if (currentUserId && sellerId && currentUserId === sellerId) {
      alert('⚠️ You cannot contact yourself on your own item!');
      return;
    }
    
    setSelectedItem(item);
    setShowContactModal(true);
    setLoadingSellerInfo(true);
    setSellerInfo(null);
    setChatMessage('');
    
    try {
      // Fetch seller information - try multiple possible ID fields
      console.log('Fetching seller info for ID:', sellerId, 'Item:', item);
      
      if (sellerId) {
        const response = await userAPI.getUserById(sellerId);
        console.log('Seller info response:', response);
        
        if (response && response.user) {
          setSellerInfo(response.user);
        } else if (response && response.id) {
          // Handle case where response is the user object directly
          setSellerInfo(response);
        } else {
          // Handle case where seller not found
          setSellerInfo({
            username: item.sellerName || item.seller_name || 'Unknown Seller',
            email: 'Not available',
            phone: 'Not available'
          });
        }
      } else {
        console.warn('No seller ID found for item:', item);
        setSellerInfo({
          username: item.sellerName || item.seller_name || 'Unknown Seller',
          email: 'Not available',
          phone: 'Not available'
        });
      }
    } catch (error) {
      console.error('Error fetching seller info:', error);
      setSellerInfo({
        username: item.sellerName || item.seller_name || 'Unknown Seller',
        email: 'Not available',
        phone: 'Not available'
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

    // Get seller ID from multiple possible fields
    const sellerId = sellerInfo?.id || selectedItem?.user_id || selectedItem?.seller_id || selectedItem?.owner_id || selectedItem?.userId;
    console.log('Sending message to seller ID:', sellerId, 'Seller info:', sellerInfo, 'Selected item:', selectedItem);
    
    if (!sellerId) {
      alert('Unable to identify seller. Please try again later.');
      return;
    }

    setSendingMessage(true);
    try {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      
      if (!token) {
        alert('Please login to send messages');
        setSendingMessage(false);
        sessionStorage.setItem('returnUrl', window.location.pathname + window.location.search);
        navigate('/login');
        return;
      }
      
      // Connect socket if not already connected
      if (!socketService.isConnected()) {
        socketService.connect(token);
      }

      // Send message via socket - it will handle both real-time delivery and persistence
      socketService.sendMessage(sellerId, chatMessage, selectedItem?.id);
      
      alert('✅ Message sent successfully! The seller will receive your message.');
      closeContactModal();
      
    } catch (error) {
      console.error('Error sending message:', error);
      alert('❌ Failed to send message: ' + (error.message || 'Please try again.'));
    } finally {
      setSendingMessage(false);
    }
  };

  // Edit item handler
  const handleEditItem = (item) => {
    setEditingItem({
      ...item,
      editedTitle: item.title,
      editedDescription: item.description,
      editedCategory: item.category,
      editedCondition: item.condition,
      editedAskingPrice: item.asking_price || item.price || '',
      editedLocation: item.location || ''
    });
    setShowItemMenu(null);
  };

  const handleSaveEditItem = async () => {
    if (!editingItem.editedTitle || editingItem.editedTitle.trim().length < 3) {
      alert('Title must be at least 3 characters long');
      return;
    }
    
    if (!editingItem.editedDescription || editingItem.editedDescription.trim().length < 10) {
      alert('Description must be at least 10 characters long');
      return;
    }

    try {
      const updatedItem = {
        title: editingItem.editedTitle,
        description: editingItem.editedDescription,
        category: editingItem.editedCategory,
        condition: editingItem.editedCondition,
        asking_price: editingItem.editedAskingPrice ? parseFloat(editingItem.editedAskingPrice) : 0,
        location: editingItem.editedLocation || 'Not specified'
      };

      await itemAPI.updateItem(editingItem.id, updatedItem);
      setEditingItem(null);
      await loadItems();
      alert('✅ Item updated successfully!');
    } catch (error) {
      console.error('Error updating item:', error);
      alert('❌ Failed to update item. Please try again.');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      try {
        await itemAPI.deleteItem(itemId);
        await loadItems();
        setShowItemMenu(null);
        alert('✅ Item deleted successfully!');
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('❌ Failed to delete item. Please try again.');
      }
    }
  };

  // Filter items based on search and filters
  const filteredItems = items.filter(item => {
    const searchTerm = search.toLowerCase().trim();
    const matchesSearch = searchTerm === "" || 
      (item.title || '').toLowerCase().includes(searchTerm) ||
      (item.description || '').toLowerCase().includes(searchTerm) ||
      (item.seller_name || '').toLowerCase().includes(searchTerm) ||
      (item.owner?.name || '').toLowerCase().includes(searchTerm);
    
    // Smart category matching - handle both old and new category values
    let matchesCategory = categoryFilter === "";
    if (!matchesCategory) {
      const itemCategory = (item.category || '').toLowerCase();
      const filterCategory = categoryFilter.toLowerCase();
      
      // Direct match (exact category)
      matchesCategory = itemCategory === filterCategory;
    }
    
    const matchesCondition = conditionFilter === "" || (item.condition || '').toLowerCase() === conditionFilter.toLowerCase();
    const matchesDonation = donationFilter === "" || donationFilter === "all" || 
      (donationFilter === "donated" && (item.isDonated || item.type === 'donated')) ||
      (donationFilter === "for-sale" && (!item.isDonated && item.type !== 'donated'));
    
    return matchesSearch && matchesCategory && matchesCondition && matchesDonation;
  }).sort((a, b) => {
    // Apply sorting based on sortBy state
    switch (sortBy) {
      case "Price Low":
        // Handle donated items (treat as 0 price)
        const priceA = (a.isDonated || a.type === 'donated') ? 0 : parseFloat((a.asking_price || a.price || '0').toString().replace(/[₹,$,]/g, '')) || 0;
        const priceB = (b.isDonated || b.type === 'donated') ? 0 : parseFloat((b.asking_price || b.price || '0').toString().replace(/[₹,$,]/g, '')) || 0;
        return priceA - priceB;
      case "Price High":
        // Handle donated items (treat as 0 price, show them last)
        const priceA2 = (a.isDonated || a.type === 'donated') ? 0 : parseFloat((a.asking_price || a.price || '0').toString().replace(/[₹,$,]/g, '')) || 0;
        const priceB2 = (b.isDonated || b.type === 'donated') ? 0 : parseFloat((b.asking_price || b.price || '0').toString().replace(/[₹,$,]/g, '')) || 0;
        return priceB2 - priceA2;
      case "Recent":
      default:
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    }
  });

  return (
    <div className="explore-page" style={{ background: currentColors.background, minHeight: "100vh" }}>
      {/* Header */}
      <div 
        className="navbar"
        style={{
          padding: "1rem 2rem",
          background: currentColors.cardBackground,
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
            Explore
          </button>
          <button 
            onClick={() => navigate("/lost-found")} 
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
            Lost & Found
          </button>
          <ProfileDropdown navigate={navigate} />
        </nav>
      </div>

      {/* Header / Top Section */}
      <div className="container-fluid bg-primary text-white py-5">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <h1 className="display-4 fw-bold mb-3">Explore Items</h1>
              <p className="lead mb-4">
                Discover amazing items from your community! Buy, sell, donate, or find what you need.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-4">
        {/* Search & Filters Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body">
                {/* Search Bar */}
                <div className="row mb-3">
                  <div className="col-md-6 mx-auto">
                    <div className="input-group input-group-lg">
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Search items, categories, or sellers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                      <button className="btn btn-primary" type="button">
                        <i className="fas fa-search"></i>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Filters */}
                <div className="row">
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Category</label>
                    <select 
                      className="form-select"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
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
                      <optgroup label="🏠 Home & Living">
                        <option value="furniture">Furniture</option>
                        <option value="home-decor">Home Decor & Art</option>
                        <option value="kitchen">Kitchen & Dining</option>
                        <option value="appliances">Home Appliances</option>
                      </optgroup>
                      <optgroup label="👕 Fashion & Accessories">
                        <option value="mens-clothing">Men's Clothing</option>
                        <option value="womens-clothing">Women's Clothing</option>
                        <option value="shoes">Shoes & Footwear</option>
                        <option value="bags">Bags & Luggage</option>
                        <option value="jewelry">Jewelry & Watches</option>
                        <option value="sunglasses">Sunglasses & Eyewear</option>
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
                      <optgroup label="🎨 Other">
                        <option value="other">Other Items</option>
                      </optgroup>
                    </select>
                  </div>
                  
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Condition</label>
                    <select 
                      className="form-select"
                      value={conditionFilter}
                      onChange={(e) => setConditionFilter(e.target.value)}
                    >
                      <option value="">Any Condition</option>
                      <option value="brand-new">Brand New</option>
                      <option value="like-new">Like New</option>
                      <option value="gently-used">Gently Used</option>
                      <option value="heavily-used">Heavily Used</option>
                    </select>
                  </div>
                  
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Type</label>
                    <select 
                      className="form-select"
                      value={donationFilter}
                      onChange={(e) => setDonationFilter(e.target.value)}
                    >
                      <option value="all">All Items</option>
                      <option value="for-sale">For Sale</option>
                      <option value="donated">Donated Items</option>
                    </select>
                  </div>
                  
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Sort By</label>
                    <select 
                      className="form-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="Recent">Most Recent</option>
                      <option value="Price Low">Price: Low to High</option>
                      <option value="Price High">Price: High to Low</option>
                    </select>
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-12 mb-3 d-flex justify-content-center">
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        setSearch("");
                        setCategoryFilter("");
                        setConditionFilter("");
                        setDonationFilter("all");
                        setSortBy("Recent");
                      }}
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-5">
            <i className="fas fa-search fa-3x text-muted mb-3"></i>
            <h5 className="text-muted">No items found</h5>
            <p className="text-muted">
              {search ? `No items match "${search}"` : "Be the first to post an item!"}
            </p>
            <button 
              className="btn btn-primary mt-3"
              onClick={() => navigate("/post-item")}
            >
              Post an Item
            </button>
          </div>
        ) : (
          <div className="row">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0" style={{ color: currentColors.text }}>
                  {filteredItems.length} Available {filteredItems.length === 1 ? 'Item' : 'Items'}
                  {(search || categoryFilter || conditionFilter || donationFilter !== 'all') && (
                    <small className="text-muted ms-2">
                      {search && `"${search}"`}
                      {categoryFilter && ` in ${categoryFilter}`}
                      {conditionFilter && ` (${conditionFilter.replace('-', ' ')})`}
                      {donationFilter === 'donated' && ' (Donated Items)'}
                      {donationFilter === 'for-sale' && ' (Items for Sale)'}
                    </small>
                  )}
                </h4>
              </div>
              
              <div className="row">
                {filteredItems.map(item => (
                  <div 
                    key={item.id} 
                    className="col-lg-4 col-md-6 mb-4"
                    style={{ position: 'relative' }}
                  >
                    <div className="card h-100 shadow-sm" style={{ position: 'relative' }}>
                      {/* Three-dot menu button - always visible */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          zIndex: 10,
                          background: 'white',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowItemMenu(showItemMenu === item.id ? null : item.id);
                        }}
                      >
                        ⋮
                      </div>
                      
                      {/* Dropdown menu */}
                      {showItemMenu === item.id && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '45px',
                            right: '10px',
                            zIndex: 20,
                            background: 'white',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                            minWidth: '180px',
                            overflow: 'hidden',
                          }}
                        >
                          {/* Show Edit/Delete for own items */}
                          {currentUser && item.user_id === currentUser.id ? (
                            <>
                              {/* Only show edit/delete if item is not sold */}
                              {item.status !== 'sold' && (
                                <>
                                  <div
                                    style={{
                                      padding: '12px 16px',
                                      cursor: 'pointer',
                                      borderBottom: '1px solid #f0f0f0',
                                      transition: 'background 0.2s',
                                    }}
                                    onClick={() => handleEditItem(item)}
                                    onMouseEnter={(e) => e.target.style.background = '#f0f8ff'}
                                    onMouseLeave={(e) => e.target.style.background = 'white'}
                                  >
                                    ✏️ Edit Item
                                  </div>
                                  <div
                                    style={{
                                      padding: '12px 16px',
                                      cursor: 'pointer',
                                      transition: 'background 0.2s',
                                      color: '#dc3545',
                                    }}
                                    onClick={() => handleDeleteItem(item.id)}
                                    onMouseEnter={(e) => e.target.style.background = '#fff5f5'}
                                    onMouseLeave={(e) => e.target.style.background = 'white'}
                                  >
                                    🗑️ Delete Item
                                  </div>
                                </>
                              )}
                              {item.status === 'sold' && (
                                <div
                                  style={{
                                    padding: '12px 16px',
                                    color: '#666',
                                    textAlign: 'center',
                                  }}
                                >
                                  Sold items cannot be edited
                                </div>
                              )}
                            </>
                          ) : (
                            /* Show Flag/Report for other users' items */
                            <>
                              <div
                                style={{
                                  padding: '12px 16px',
                                  cursor: 'pointer',
                                  borderBottom: '1px solid #f0f0f0',
                                  transition: 'background 0.2s',
                                }}
                                onClick={async () => {
                              const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
                              if (!token) {
                                alert('Please login to flag posts');
                                navigate('/login');
                                return;
                              }
                              
                              const reason = prompt('Why does this post look suspicious?');
                              if (!reason) return;
                              
                              try {
                                const response = await fetch('http://localhost:8080/api/flags', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                  },
                                  body: JSON.stringify({
                                    targetType: 'item',
                                    targetId: item.id,
                                    reason: reason,
                                    flagType: 'suspicious',
                                    severity: 'medium'
                                  })
                                });
                                
                                const data = await response.json();
                                
                                if (response.ok) {
                                  alert('✅ Post flagged successfully! Admin will review it.');
                                } else {
                                  alert('❌ ' + (data.error || 'Failed to flag post'));
                                }
                              } catch (error) {
                                console.error('Flag error:', error);
                                alert('❌ Failed to flag post. Please try again.');
                              }
                              setShowItemMenu(null);
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#fff8e1'}
                            onMouseLeave={(e) => e.target.style.background = 'white'}
                          >
                            🚩 Flag This Post
                          </div>
                          <div
                            style={{
                              padding: '12px 16px',
                              cursor: 'pointer',
                              transition: 'background 0.2s',
                              color: '#dc3545',
                            }}
                            onClick={() => {
                              const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
                              if (!token) {
                                alert('Please login to report');
                                navigate('/login');
                                return;
                              }
                              
                              // Navigate to report concern with prefilled data
                              navigate('/report-user', { 
                                state: { 
                                  itemId: item.id,
                                  itemTitle: item.title,
                                  userId: item.user_id || item.userId,
                                  username: item.username,
                                  concernType: 'item',
                                  description: `Report for item: ${item.title}`
                                }
                              });
                              setShowItemMenu(null);
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#fff5f5'}
                            onMouseLeave={(e) => e.target.style.background = 'white'}
                          >
                            ⚠️ Report User/Post
                          </div>
                            </>
                          )}
                        </div>
                      )}
                      
                      {item.image && (
                        <img 
                          src={item.image} 
                          className="card-img-top" 
                          alt={item.title} 
                          style={{height: '200px', objectFit: 'cover'}} 
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
                              {item.condition}
                            </span>
                            {item.is_donated && (
                              <span className="badge bg-danger mt-1">
                                🎁 DONATED
                              </span>
                            )}
                            {item.urgent && (
                              <span className="badge bg-warning text-dark mt-1">URGENT</span>
                            )}
                          </div>
                        </div>
                        
                        <p className="card-text text-muted flex-grow-1">{item.description}</p>
                        
                        <div className="mt-auto">
                          <div className="row text-sm mb-3">
                            <div className="col-6">
                              <strong>Price:</strong><br />
                              <span className={(item.isDonated || item.type === 'donated') ? "text-success fw-bold" : "text-success fw-bold"}>
                                {(item.isDonated || item.type === 'donated') ? "DONATED" : (() => {
                                  const price = item.asking_price || item.price;
                                  if (typeof price === 'number') {
                                    return `₹${price.toLocaleString()}`;
                                  } else if (typeof price === 'string' && price !== '' && price !== '0') {
                                    const numPrice = parseFloat(price);
                                    return isNaN(numPrice) ? price : `₹${numPrice.toLocaleString()}`;
                                  }
                                  return "Price not listed";
                                })()}
                              </span>
                            </div>
                            <div className="col-6">
                              <strong>Seller:</strong><br />
                              <span className="text-muted">{item.seller_name || item.owner?.name || "Unknown"}</span>
                            </div>
                          </div>
                          
                          <div className="row text-sm mb-3">
                            <div className="col-6">
                              <strong>Posted:</strong><br />
                              <span className="text-muted">
                                {item.created_at 
                                  ? new Date(item.created_at).toLocaleDateString() 
                                  : item.date || "Unknown"}
                              </span>
                            </div>
                            <div className="col-6">
                              <strong>Location:</strong><br />
                              <span className="text-muted">{item.location}</span>
                            </div>
                          </div>
                          
                          {(() => {
                            const currentUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
                            const currentUserId = currentUser.id;
                            const sellerId = item.user_id || item.seller_id || item.owner_id || item.userId || item.ownerId || item.posted_by;
                            const isOwnItem = currentUserId && sellerId && String(currentUserId) === String(sellerId);
                            
                            if (isOwnItem) {
                              return null;
                            }
                            
                            return (
                              <button 
                                className="btn btn-outline-primary w-100 mb-2"
                                onClick={() => handleContactSeller(item)}
                              >
                                <i className="fas fa-envelope me-2"></i>
                                Contact Seller
                              </button>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom Action Buttons */}
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

        {/* Create Post Button */}
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
          onClick={() => navigate("/post-item")}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-3px) scale(1.05)";
            e.target.style.boxShadow = "0 8px 25px rgba(0, 123, 255, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0) scale(1)";
            e.target.style.boxShadow = "0 6px 20px rgba(0, 123, 255, 0.4)";
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>➕</span>
          Create Post
        </button>
      </div>

      {/* Edit Item Modal */}
      {editingItem && (
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
            zIndex: 2000,
            padding: '20px'
          }}
          onClick={() => setEditingItem(null)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Edit Item</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#444' }}>Title</label>
              <input
                type="text"
                value={editingItem.editedTitle}
                onChange={(e) => setEditingItem({...editingItem, editedTitle: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#444' }}>Description</label>
              <textarea
                value={editingItem.editedDescription}
                onChange={(e) => setEditingItem({...editingItem, editedDescription: e.target.value})}
                rows="4"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#444' }}>Category</label>
                <input
                  type="text"
                  value={editingItem.editedCategory}
                  onChange={(e) => setEditingItem({...editingItem, editedCategory: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#444' }}>Condition</label>
                <select
                  value={editingItem.editedCondition}
                  onChange={(e) => setEditingItem({...editingItem, editedCondition: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="brand-new">Brand New</option>
                  <option value="like-new">Like New</option>
                  <option value="gently-used">Gently Used</option>
                  <option value="heavily-used">Heavily Used</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#444' }}>Asking Price (₹)</label>
                <input
                  type="number"
                  value={editingItem.editedAskingPrice}
                  onChange={(e) => setEditingItem({...editingItem, editedAskingPrice: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#444' }}>Location</label>
                <input
                  type="text"
                  value={editingItem.editedLocation}
                  onChange={(e) => setEditingItem({...editingItem, editedLocation: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setEditingItem(null)}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  background: 'white',
                  color: '#666',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditItem}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  background: '#007bff',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Seller Modal */}
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
              <h3 style={{ margin: 0, color: '#333' }}>Contact Seller</h3>
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
                  src={selectedItem.image || defaultAvatar} 
                  alt={selectedItem.title}
                  style={{
                    width: '80px',
                    height: '80px',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />
                <div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>{selectedItem.title}</h4>
                  <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>
                    {selectedItem.askingPrice ? `₹${selectedItem.askingPrice}` : selectedItem.price || 'Price not specified'}
                  </p>
                  <p style={{ margin: 0, color: '#888', fontSize: '12px' }}>
                    Seller: {sellerInfo ? (sellerInfo.username || sellerInfo.name) : (selectedItem.sellerName || selectedItem.seller_name || 'Loading...')}
                  </p>
                </div>
              </div>
            </div>
            
            {loadingSellerInfo ? (
              <div style={{ backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
                <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                <span style={{ color: '#666' }}>Connecting to seller...</span>
              </div>
            ) : (
              <div style={{ backgroundColor: '#f8f9fa', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                <h5 style={{ margin: '0 0 12px 0', color: '#333' }}>About this Item</h5>
                <div style={{ marginBottom: '8px' }}>
                  <strong>📍 Location:</strong> {selectedItem.pickupLocation || selectedItem.location || 'Not specified'}
                </div>
                <div style={{ color: '#666', fontSize: '14px', marginTop: '12px' }}>
                  💬 Send a message to start chatting with the seller. They'll receive your message instantly.
                </div>
              </div>
            )}
            
            {/* Chat Message Input */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                💬 Send a message to the seller
              </label>
              <textarea
                placeholder={`Hi! I'm interested in "${selectedItem.title}". Is it still available?`}
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
                  <span>💬</span>
                  <span>Send Message</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}