import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../style/header.css';
import { fetchMovies } from '../api/MovieAPI';
import { Movie } from '../types/Movie';
import SearchDropdown from './SearchDropdown';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Redirect logged-in users from login/register pages to home
  useEffect(() => {
    if (user && (location.pathname === '/login' || location.pathname === '/register')) {
      navigate('/home');
    }
  }, [user, location.pathname, navigate]);

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Don't show header on login and register pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = async (query: string) => {
    if (query.trim() === '') {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    try {
      const response = await fetchMovies(10, 1, [], query, []);
      if (response && Array.isArray(response.movies)) {
        const validMovies = await Promise.all(
          response.movies.map(async (movie) => {
            if (!movie.posterUrl || 
                movie.posterUrl.trim() === '' || 
                movie.posterUrl === 'null' || 
                movie.posterUrl === 'undefined' ||
                movie.posterUrl.includes('placeholder')) {
              return null;
            }

            try {
              const img = new Image();
              await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = movie.posterUrl as string;
              });
              return movie;
            } catch (err) {
              return null;
            }
          })
        );

        const filteredMovies = validMovies.filter((movie): movie is Movie => movie !== null);
        setSearchResults(filteredMovies);
        setShowDropdown(filteredMovies.length > 0);
      }
    } catch (err) {
      console.error('Error fetching search results:', err);
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(query);
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowDropdown(false);
    }
  };

  return (
    <header>
      <div className="container">
        <div className="logo-container">
          <Link to="/home" className="logo">
            <img src="/CineNiche_Logo.png" alt="CineNiche Logo" className="logo-image" />
          </Link>
          <Link to="/home" className="site-title">CineNiche</Link>
        </div>

        <div className="menu-container" ref={menuRef}>
        <div className="search-container" ref={searchContainerRef}>
          <form onSubmit={handleSubmit} className="search-form">
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={() => {
                setIsFocused(true);
                if (searchQuery.trim() !== '') {
                  setShowDropdown(true);
                }
              }}
              onBlur={() => {
                setIsFocused(false);
                // Don't hide dropdown immediately to allow clicking on results
                setTimeout(() => {
                  if (!isFocused) {
                    setShowDropdown(false);
                  }
                }, 200);
              }}
              className="search-input"
            />
            <button type="submit" className="search-button">
              <i className="fas fa-search"></i>
            </button>
          </form>
          {showDropdown && searchResults.length > 0 && (
            <SearchDropdown
              results={searchResults}
              onClose={() => {
                setShowDropdown(false);
                setSearchQuery('');
              }}
            />
          )}
        </div>
        
          <button className="hamburger-button" onClick={toggleMenu}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {isMenuOpen && (
            <div className="dropdown-menu">
              <Link to="/" className="dropdown-item" onClick={toggleMenu}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Home</span>
              </Link>
              <Link to="/home" className="dropdown-item" onClick={toggleMenu}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Browse</span>
              </Link>
              {user && (
                <>
                  <Link to="/account" className="dropdown-item" onClick={toggleMenu}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Account</span>
                  </Link>
                  <button className="dropdown-item" onClick={() => { handleLogout(); toggleMenu(); }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
