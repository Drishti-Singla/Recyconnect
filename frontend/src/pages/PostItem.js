import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../components/logo.png';
import { itemAPI } from '../services/api';
import ImageUpload from '../components/ImageUpload';
import CAMPUS_LOCATIONS from '../constants/locations';

function PostItem() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    condition: '',
    damages: '',
    purchaseDate: '',
    usageDuration: '',
    usageTimeUnit: '',
    warranty: '',
    originalPrice: '',
    askingPrice: '',
    inStock: '',
    quantity: '',
    pickupLocation: '',
    delivery: '',
    batteryHealth: '',
    repairs: '',
    workingStatus: '',
    dimensions: '',
    dimensionLength: '',
    dimensionWidth: '',
    dimensionHeight: '',
    dimensionUnit: '',
    material: '',
    color: '',
    urgency: '',
    receipt: '',
    image: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Get user from localStorage (stored after login/signup)
      const currentUser = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}');
      const userId = currentUser.id;

      if (!userId) {
        setSubmitError('Please log in to post an item.');
        setIsSubmitting(false);
        return;
      }

      // Prepare item data with correct field mapping for backend
      const itemData = {
        userId: userId,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        condition: formData.condition,
        asking_price: formData.askingPrice, // snake_case for backend
        askingPrice: formData.askingPrice, // camelCase for compatibility
        location: formData.pickupLocation, // Map pickupLocation to location
        image_urls: formData.image ? [formData.image] : []
      };

      console.log('=== FRONTEND DEBUG ===');
      console.log('Form data being sent:', itemData);
      console.log('User ID:', currentUser.id);

      const result = await itemAPI.createItem(itemData);
      console.log('Item created successfully:', result);
      
      alert('Item posted successfully!');
      // Navigate to explore page on success
      navigate('/explore');
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError(error.message || 'Failed to post item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.title && formData.description && formData.category && formData.condition && formData.askingPrice && formData.pickupLocation;

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header (same as other pages) */}
      <div style={{ padding: '1rem 2rem', background: 'rgba(255,255,255,0.65)', borderBottom: '1px solid #eee', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          style={{ background: 'none', border: 'none', color: '#222', fontSize: '1rem', cursor: 'pointer', fontWeight: 500, zIndex: 2 }}
          onClick={() => navigate('/explore')}
        >
          &larr; Back to Explore
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0 auto' }}>
          <img src={logo} alt="RecyConnect Logo" style={{ width: 48, height: 48, objectFit: 'contain' }} />
          <span style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#007bff', letterSpacing: '2px' }}>RecyConnect</span>
        </div>
        <div style={{ width: '120px' }}></div>
      </div>

      {/* Main Content - centered with margins */}
      <div style={{ flex: 1, background: '#f8f9fa', overflowY: 'auto', padding: '2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#007bff', fontWeight: 'bold' }}>Post Your Item</h2>
          <form>
            {/* Image Upload */}
            <div style={{ marginBottom: '2rem' }}>
              <ImageUpload
                label="Item Image"
                onImageSelect={(url) => handleInputChange('image', url)}
                onImageRemove={() => handleInputChange('image', '')}
                existingImage={formData.image}
              />
            </div>

            {/* Basic Info */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: '#333', marginBottom: '1rem', borderBottom: '2px solid #007bff', paddingBottom: '0.5rem' }}>📝 Basic Information</h4>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, display: 'block', color: '#444' }}>Item Title *</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="What are you selling?" 
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #ccc', fontSize: 16, outline: 'none', marginTop: 2 }} 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, display: 'block', color: '#444' }}>Category *</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #ccc', fontSize: 16, outline: 'none', marginTop: 2 }}
                  >
                    <option value="">Select category</option>
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
                      <option value="bedding">Bedding & Linens</option>
                      <option value="storage">Storage & Organization</option>
                      <option value="lighting">Lighting & Lamps</option>
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
                      <option value="magazines">Magazines & Comics</option>
                      <option value="stationery">Stationery & Supplies</option>
                      <option value="study-materials">Study Materials</option>
                    </optgroup>
                    <optgroup label="⚽ Sports & Fitness">
                      <option value="gym-equipment">Gym & Fitness Equipment</option>
                      <option value="sports-gear">Sports Gear & Equipment</option>
                      <option value="bicycles">Bicycles & Cycling</option>
                      <option value="outdoor-sports">Outdoor & Adventure</option>
                      <option value="yoga">Yoga & Wellness</option>
                    </optgroup>
                    <optgroup label="🍕 Food & Beverages">
                      <option value="packaged-food">Packaged Food Items</option>
                      <option value="snacks">Snacks & Confectionery</option>
                      <option value="beverages">Beverages & Drinks</option>
                      <option value="health-food">Health & Organic Food</option>
                      <option value="baking">Baking Supplies</option>
                    </optgroup>
                    <optgroup label="💄 Beauty & Personal Care">
                      <option value="skincare">Skincare</option>
                      <option value="makeup">Makeup & Cosmetics</option>
                      <option value="haircare">Haircare</option>
                      <option value="fragrances">Fragrances & Perfumes</option>
                      <option value="grooming">Grooming & Shaving</option>
                    </optgroup>
                    <optgroup label="👶 Baby & Kids">
                      <option value="baby-clothes">Baby Clothing</option>
                      <option value="kids-toys">Toys & Games</option>
                      <option value="baby-gear">Baby Gear & Equipment</option>
                      <option value="kids-books">Children's Books</option>
                      <option value="baby-care">Baby Care Products</option>
                    </optgroup>
                    <optgroup label="🎨 Hobbies & Interests">
                      <option value="musical-instruments">Musical Instruments</option>
                      <option value="art-supplies">Art & Craft Supplies</option>
                      <option value="collectibles">Collectibles & Antiques</option>
                      <option value="board-games">Board Games & Puzzles</option>
                      <option value="photography">Photography Equipment</option>
                    </optgroup>
                    <optgroup label="🚗 Automotive & Tools">
                      <option value="car-accessories">Car Accessories</option>
                      <option value="bike-parts">Bike Parts & Accessories</option>
                      <option value="tools">Tools & Hardware</option>
                      <option value="automotive-care">Automotive Care Products</option>
                    </optgroup>
                    <optgroup label="🐾 Pets & Animals">
                      <option value="pet-food">Pet Food & Treats</option>
                      <option value="pet-accessories">Pet Accessories</option>
                      <option value="pet-toys">Pet Toys</option>
                      <option value="pet-care">Pet Care Products</option>
                    </optgroup>
                    <optgroup label="💼 Office & Business">
                      <option value="office-supplies">Office Supplies</option>
                      <option value="office-furniture">Office Furniture</option>
                      <option value="business-equipment">Business Equipment</option>
                      <option value="printing">Printing & Scanning</option>
                    </optgroup>
                    <optgroup label="🌿 Garden & Outdoor">
                      <option value="plants">Plants & Seeds</option>
                      <option value="garden-tools">Garden Tools</option>
                      <option value="outdoor-furniture">Outdoor Furniture</option>
                      <option value="camping">Camping & Hiking</option>
                    </optgroup>
                    <optgroup label="💊 Health & Wellness">
                      <option value="supplements">Supplements & Vitamins</option>
                      <option value="medical-equipment">Medical Equipment</option>
                      <option value="fitness-trackers">Fitness Trackers</option>
                      <option value="wellness">Wellness Products</option>
                    </optgroup>
                    <optgroup label="🎓 Other">
                      <option value="tickets">Event Tickets</option>
                      <option value="vouchers">Gift Cards & Vouchers</option>
                      <option value="services">Services</option>
                      <option value="other">Other Items</option>
                    </optgroup>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, display: 'block', color: '#444' }}>Quantity Available *</label>
                  <input 
                    type="number" 
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    placeholder="How many units?" 
                    min="1"
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #ccc', fontSize: 16, outline: 'none', marginTop: 2 }} 
                  />
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, display: 'block', color: '#444' }}>Description *</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your item in detail..." 
                  rows="4"
                  minLength="10"
                  maxLength="2000"
                  style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #ccc', fontSize: 16, outline: 'none', marginTop: 2, resize: 'vertical' }}
                />
                <small style={{ color: '#666', fontSize: '12px' }}>Must be between 10 and 2000 characters</small>
              </div>
            </div>
            {/* Item Condition */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: '#333', marginBottom: '1rem', borderBottom: '2px solid #007bff', paddingBottom: '0.5rem' }}>🛠 Item Condition</h4>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, display: 'block', color: '#444' }}>Condition *</label>
                  <select 
                    value={formData.condition}
                    onChange={(e) => handleInputChange('condition', e.target.value)}
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #ccc', fontSize: 16, outline: 'none', marginTop: 2 }}
                  >
                    <option value="">Select condition</option>
                    <option value="brand-new">Brand New</option>
                    <option value="like-new">Like New</option>
                    <option value="gently-used">Gently Used</option>
                    <option value="heavily-used">Heavily Used</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, display: 'block', color: '#444' }}>Visible Damages?</label>
                  <select 
                    value={formData.damages}
                    onChange={(e) => handleInputChange('damages', e.target.value)}
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #ccc', fontSize: 16, outline: 'none', marginTop: 2 }}
                  >
                    <option value="">Select option</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Age of Item */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: '#333', marginBottom: '1rem', borderBottom: '2px solid #007bff', paddingBottom: '0.5rem' }}>📅 Age of Item</h4>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, display: 'block', color: '#444' }}>When was it purchased?</label>
                  <input 
                    type="date" 
                    value={formData.purchaseDate}
                    onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                    max={new Date().toISOString().split('T')[0]} // Prevent future dates
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #ccc', fontSize: 16, outline: 'none', marginTop: 2 }} 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, display: 'block', color: '#444' }}>How long has it been used?</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type="number" 
                      value={formData.usageDuration}
                      onChange={(e) => handleInputChange('usageDuration', Math.max(0, e.target.value))} // Prevent negative numbers
                      placeholder="Enter number" 
                      min="0"
                      onKeyDown={(e) => {
                        if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                          e.preventDefault(); // Prevent negative sign and scientific notation
                        }
                      }}
                      style={{ width: '60%', padding: '14px 16px', borderRadius: 12, border: '1px solid #ccc', fontSize: 16, outline: 'none', marginTop: 2 }} 
                    />
                    <select 
                      value={formData.usageTimeUnit}
                      onChange={(e) => handleInputChange('usageTimeUnit', e.target.value)}
                      style={{ width: '40%', padding: '14px 16px', borderRadius: 12, border: '1px solid #ccc', fontSize: 16, outline: 'none', marginTop: 2 }}
                    >
                      <option value="">Unit</option>
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                      <option value="months">Months</option>
                      <option value="years">Years</option>
                    </select>
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, display: 'block', color: '#444' }}>Is it still under warranty?</label>
                <select 
                  value={formData.warranty}
                  onChange={(e) => handleInputChange('warranty', e.target.value)}
                  style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #ccc', fontSize: 16, outline: 'none', marginTop: 2 }}
                >
                  <option value="">Select option</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </div>

            {/* Pricing */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: '#333', marginBottom: '1rem', borderBottom: '2px solid #007bff', paddingBottom: '0.5rem' }}>💰 Pricing</h4>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, display: 'block', color: '#444' }}>Original MRP (₹)</label>
                  <input 
                    type="number" 
                    value={formData.originalPrice}
                    onChange={(e) => handleInputChange('originalPrice', Math.max(0, e.target.value))}
                    placeholder="Enter original price" 
                    min="0"
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                        e.preventDefault();
                      }
                    }}
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #ccc', fontSize: 16, outline: 'none', marginTop: 2 }} 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, display: 'block', color: '#444' }}>
                    Current asking price (₹) *
                  </label>
                  <input 
                    type="number" 
                    value={formData.askingPrice}
                    onChange={(e) => handleInputChange('askingPrice', Math.max(0, e.target.value))}
                    placeholder="Enter selling price"
                    min="0"
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                        e.preventDefault();
                      }
                    }}
                    style={{ 
                      width: '100%', 
                      padding: '14px 16px', 
                      borderRadius: 12, 
                      border: '1px solid #ccc', 
                      fontSize: 16, 
                      outline: 'none', 
                      marginTop: 2,
                      backgroundColor: 'white',
                      color: 'black'
                    }} 
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: '#333', marginBottom: '1rem', borderBottom: '2px solid #007bff', paddingBottom: '0.5rem' }}>📍 Location</h4>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, display: 'block', color: '#444' }}>Pickup location *</label>
                  <select 
                    value={formData.pickupLocation}
                    onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #ccc', fontSize: 16, outline: 'none', marginTop: 2 }}
                    required
                  >
                    <option value="">Select a location</option>
                    {CAMPUS_LOCATIONS.map((location, index) => (
                      <option key={index} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, display: 'block', color: '#444' }}>Is delivery available?</label>
                  <select 
                    value={formData.delivery}
                    onChange={(e) => handleInputChange('delivery', e.target.value)}
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #ccc', fontSize: 16, outline: 'none', marginTop: 2 }}
                  >
                    <option value="">Select option</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                    <option value="extra-charge">Yes (with extra charge)</option>
                  </select>
                </div>
              </div>
            </div>


            {/* For Electronics */}
            {formData.category === 'electronics' && (
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ color: '#333', marginBottom: '1rem', borderBottom: '2px solid #007bff', paddingBottom: '0.5rem' }}>🔋 For Electronics</h4>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, display: 'block', color: '#444' }}>Battery health</label>
                    <select 
                      value={formData.batteryHealth}
                      onChange={(e) => handleInputChange('batteryHealth', e.target.value)}
                      style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #ccc', fontSize: 16, outline: 'none', marginTop: 2 }}
                    >
                      <option value="">Select battery health</option>
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="poor">Poor</option>
                      <option value="not-applicable">Not Applicable</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, display: 'block', color: '#444' }}>Any repairs done?</label>
                    <select 
                      value={formData.repairs}
                      onChange={(e) => handleInputChange('repairs', e.target.value)}
                      style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #ccc', fontSize: 16, outline: 'none', marginTop: 2 }}
                    >
                      <option value="">Select option</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, display: 'block', color: '#444' }}>Working status</label>
                  <select 
                    value={formData.workingStatus}
                    onChange={(e) => handleInputChange('workingStatus', e.target.value)}
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #ccc', fontSize: 16, outline: 'none', marginTop: 2 }}
                  >
                    <option value="">Select working status</option>
                    <option value="fully-functional">Fully functional</option>
                    <option value="partially-working">Partially working</option>
                    <option value="not-working">Not working</option>
                  </select>
                </div>
              </div>
            )}

            {/* For Furniture/Other Goods */}
            {(formData.category === 'furniture' || formData.category === 'other') && (
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ color: '#333', marginBottom: '1rem', borderBottom: '2px solid #007bff', paddingBottom: '0.5rem' }}>🛋 For Furniture/Other Goods</h4>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, display: 'block', color: '#444' }}>Size/Dimensions</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <select 
                      value={formData.dimensionLength || ''}
                      onChange={(e) => handleInputChange('dimensionLength', e.target.value)}
                      style={{ flex: 1, padding: '14px 16px', borderRadius: 12, border: '1px solid #ccc', fontSize: 16, outline: 'none' }}
                    >
                      <option value="">Length</option>
                      {[...Array(200)].map((_, i) => (
                        <option key={i+1} value={i+1}>{i+1}</option>
                      ))}
                    </select>
                    <span style={{ fontSize: 16, color: '#666' }}>×</span>
                    <select 
                      value={formData.dimensionWidth || ''}
                      onChange={(e) => handleInputChange('dimensionWidth', e.target.value)}
                      style={{ flex: 1, padding: '14px 16px', borderRadius: 12, border: '1px solid #ccc', fontSize: 16, outline: 'none' }}
                    >
                      <option value="">Width</option>
                      {[...Array(200)].map((_, i) => (
                        <option key={i+1} value={i+1}>{i+1}</option>
                      ))}
                    </select>
                    <span style={{ fontSize: 16, color: '#666' }}>×</span>
                    <select 
                      value={formData.dimensionHeight || ''}
                      onChange={(e) => handleInputChange('dimensionHeight', e.target.value)}
                      style={{ flex: 1, padding: '14px 16px', borderRadius: 12, border: '1px solid #ccc', fontSize: 16, outline: 'none' }}
                    >
                      <option value="">Height</option>
                      {[...Array(200)].map((_, i) => (
                        <option key={i+1} value={i+1}>{i+1}</option>
                      ))}
                    </select>
                    <select 
                      value={formData.dimensionUnit || ''}
                      onChange={(e) => handleInputChange('dimensionUnit', e.target.value)}
                      style={{ padding: '14px 16px', borderRadius: 12, border: '1px solid #ccc', fontSize: 16, outline: 'none', minWidth: '80px' }}
                    >
                      <option value="">Unit</option>
                      <option value="cm">cm</option>
                      <option value="m">m</option>
                      <option value="inch">inch</option>
                      <option value="ft">ft</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, display: 'block', color: '#444' }}>Material</label>
                  <select 
                    value={formData.material}
                    onChange={(e) => handleInputChange('material', e.target.value)}
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #ccc', fontSize: 16, outline: 'none', marginTop: 2 }}
                  >
                    <option value="">Select material</option>
                    <option value="wood">Wood</option>
                    <option value="metal">Metal</option>
                    <option value="plastic">Plastic</option>
                    <option value="fabric">Fabric</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, display: 'block', color: '#444' }}>Color/Finish</label>
                  <input 
                    type="text" 
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    placeholder="e.g., Dark brown, Glossy white" 
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #ccc', fontSize: 16, outline: 'none', marginTop: 2 }} 
                  />
                </div>
              </div>
            )}

            {/* Urgency */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: '#333', marginBottom: '1rem', borderBottom: '2px solid #007bff', paddingBottom: '0.5rem' }}>⏱ Urgency</h4>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, display: 'block', color: '#444' }}>Are you in a hurry to sell?</label>
                  <select 
                    value={formData.urgency}
                    onChange={(e) => handleInputChange('urgency', e.target.value)}
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #ccc', fontSize: 16, outline: 'none', marginTop: 2 }}
                  >
                    <option value="">Select urgency</option>
                    <option value="urgent">Urgent</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Trust & Verification */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: '#333', marginBottom: '1rem', borderBottom: '2px solid #007bff', paddingBottom: '0.5rem' }}>🏷 Trust & Verification</h4>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: 500, fontSize: 15, marginBottom: 6, display: 'block', color: '#444' }}>Do you have receipt/proof of purchase?</label>
                <select 
                  value={formData.receipt}
                  onChange={(e) => handleInputChange('receipt', e.target.value)}
                  style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #ccc', fontSize: 16, outline: 'none', marginTop: 2 }}
                >
                  <option value="">Select option</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="partial">Partial documentation</option>
                </select>
              </div>
            </div>

            {/* Submit Error */}
            {submitError && (
              <div style={{ 
                marginTop: '1rem', 
                padding: '12px', 
                backgroundColor: '#f8d7da', 
                color: '#721c24', 
                border: '1px solid #f5c6cb', 
                borderRadius: '8px',
                fontSize: '14px'
              }}>
                {submitError}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="button"
              disabled={!isFormValid || isSubmitting}
              style={{ 
                width: '100%', 
                padding: '16px 0', 
                borderRadius: 24, 
                background: (isFormValid && !isSubmitting) ? '#007bff' : '#D9D9D9', 
                color: '#fff', 
                fontWeight: 600, 
                fontSize: 18, 
                border: 'none', 
                marginTop: '2rem',
                opacity: (isFormValid && !isSubmitting) ? 1 : 0.7, 
                cursor: (isFormValid && !isSubmitting) ? 'pointer' : 'not-allowed', 
                transition: 'background 0.2s' 
              }}
              onClick={handleSubmit}
            >
              {isSubmitting ? 'Posting Item...' : 'Post Item'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PostItem;
