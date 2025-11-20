import React, { useState, useEffect } from 'react';
import logo from './logo.png';
import { socketService } from '../services/api';

function Header() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const checkAuthStatus = () => {
      // Check sessionStorage first (active session), then localStorage (backup)
      const userData = sessionStorage.getItem('user') || localStorage.getItem('user');
      const adminStatus = sessionStorage.getItem('isAdmin') || localStorage.getItem('isAdmin');
      const isLoggedIn = sessionStorage.getItem('isLoggedIn') || localStorage.getItem('isLoggedIn');
      
      if (userData && isLoggedIn === 'true') {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAdmin(adminStatus === 'true');
        } catch (error) {
          console.error('❌ Header: Error parsing user data:', error);
          // Clear corrupted data from both storages
          sessionStorage.clear();
          localStorage.clear();
          setUser(null);
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    };

    // Check immediately on mount
    checkAuthStatus();

    // Listen for storage changes (for cross-tab sync only)
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'isLoggedIn' || e.key === 'isAdmin') {
        checkAuthStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    console.log('🚺 Logging out...');
    
    // Immediately clear state first
    setUser(null);
    setIsAdmin(false);
    
    // Disconnect socket
    socketService.disconnect();
    
    // Clear all session data from both storages
    sessionStorage.clear();
    localStorage.clear();
    
    console.log('✅ Logged out successfully');
    
    // Force redirect after a brief delay to ensure state is cleared
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  };

  // Direct check for admin status (double-check in render)
  const checkIsAdmin = () => {
    const adminFlag = sessionStorage.getItem('isAdmin') || localStorage.getItem('isAdmin');
    console.log('🔍 Direct admin check in render:', adminFlag);
    return adminFlag === 'true' || isAdmin;
  };

  return (
  <header style={{ background: 'rgba(255,255,255,0.45)', padding: '0.2rem 0', marginBottom: '1.2rem', height: '56px' }}>
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 2rem' }}>
    {/* Left: Logo and Website Name */}
    <div style={{ display: 'flex', alignItems: 'center', flex: '1 1 0%', justifyContent: 'flex-start' }}>
      <img src={logo} alt="RecyConnect Logo" style={{ width: 64, height: 64, marginRight: 10, objectFit: 'contain' }} />
      <h2 style={{ margin: 0, fontWeight: 'bold', letterSpacing: '2px', color: '#007bff', fontSize: '1.3rem' }}>RecyConnect</h2>
    </div>
    {/* Right: Buttons and Profile Icon */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 0%', justifyContent: 'flex-end' }}>
      {user ? (
        <>
          <button onClick={handleLogout} className="btn btn-outline-danger">
            Logout
          </button>
        </>
      ) : (
        <>
          <a href="/login" className="btn btn-outline-primary">Login</a>
          <a href="/signup" className="btn btn-primary">Sign Up</a>
        </>
      )}
  {}
    </div>
      </div>
    </header>
  );
}

export default Header;