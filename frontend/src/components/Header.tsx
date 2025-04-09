import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  // Redirect logged-in users from login/register pages to home
  useEffect(() => {
    if (user && (location.pathname === '/login' || location.pathname === '/register')) {
      navigate('/home');
    }
  }, [user, location.pathname, navigate]);

  // Don't show header on login and register pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  const handleLogout = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:5001';
      const response = await fetch(`${baseUrl}/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setUser(null); // Clear the user from auth context
        navigate('/login');
      } else {
        console.error('Logout failed:', response.status);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-black/80 fixed top-0 left-0 right-0 z-50 p-4">
      <div className="container mx-auto flex justify-between items-center relative">
        <div className="text-white text-xl font-bold">
          Movie App
        </div>
        {user && (
          <div className="absolute right-0 flex space-x-2">
            <button 
              onClick={() => navigate('/account')}
              className="bg-white text-black px-4 py-2 rounded-md hover:bg-gray-200 transition-colors font-medium cursor-pointer"
              style={{
                display: 'inline-block',
                textDecoration: 'none',
                border: 'none',
                outline: 'none'
              }}
            >
              {user.email}
            </button>
            <button 
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors font-medium cursor-pointer"
              style={{
                display: 'inline-block',
                textDecoration: 'none',
                border: 'none',
                outline: 'none'
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
