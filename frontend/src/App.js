import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { useEffect } from 'react';
import { socketService } from './services/api';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Explore from './pages/Explore';
import PostItem from './pages/PostItem';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import LostFound from './pages/LostFound';
import Donate from './pages/Donate';
import ReportUser from './pages/ReportUser';
import TermsConditions from './pages/TermsConditions';

function App() {
  // Session management - use sessionStorage for auto-logout on browser close
  useEffect(() => {
    // On app load, check if user data exists in localStorage
    const userData = localStorage.getItem('user');
    const authToken = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    
    if (userData && authToken) {
      // Move to sessionStorage so it clears on browser close
      sessionStorage.setItem('user', userData);
      sessionStorage.setItem('authToken', authToken);
      sessionStorage.setItem('isLoggedIn', localStorage.getItem('isLoggedIn') || 'true');
      sessionStorage.setItem('isAdmin', localStorage.getItem('isAdmin') || 'false');
      
      // Clear from localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('isAdmin');
      
      console.log('✅ Session moved to sessionStorage - will clear on browser close');
    }

    // Disconnect socket when browser closes
    const handleBeforeUnload = () => {
      socketService.disconnect();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Add global logout function for debugging/emergency use
  window.clearSession = () => {
    sessionStorage.clear();
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('authToken');
    socketService.disconnect();
    window.location.href = '/';
    console.log('🔄 Session cleared! Redirecting to home...');
  };

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/post-item" element={<PostItem />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/lost-found" element={<LostFound />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/report-user" element={<ReportUser />} />
          <Route path="/terms" element={<TermsConditions />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
