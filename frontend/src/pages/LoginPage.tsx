import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../style/identity.css';
import '@fortawesome/fontawesome-free/css/all.css';
import '../style/header.css';
import '../style/LandingPage.css';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';

const LoginPage: React.FC = () => {
  // state variables for email and passwords
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const { setUser } = useAuth();

  // state variable for error messages
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  // handle change events for input fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    if (type === 'checkbox') {
      setRememberMe(checked);
    } else if (name === 'email') {
      setEmail(value);
    } else if (name === 'password') {
      setPassword(value);
    }
  };


  // handle submit event for the form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(''); // Clear any previous errors

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:5001';
    const loginUrl = rememberMe
      ? `${baseUrl}/login?useCookies=true`
      : `${baseUrl}/login?useSessionCookies=true`;

    try {
      const response = await fetch(loginUrl, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      // Ensure we only parse JSON if there is content
      let data = null;
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength, 10) > 0) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error(data?.message || 'Invalid email or password.');
      }

      // Fetch user data to get the user ID
      const userResponse = await fetch(`${baseUrl}/MovieUser/GetUserByEmail?email=${encodeURIComponent(email)}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData = await userResponse.json();
      
      // Set the user data in the AuthContext with both email and userId
      setUser({ 
        email,
        userId: userData.userId
      });
      
      navigate('/home');
    } catch (error: any) {
      setError(error.message || 'Error logging in.');
      console.error('Fetch attempt failed:', error);
    }
  };

  return (
    <>
      {/* HEADER */}
      <header>
        <div className="container">
          <div className="logo-container">
            <Link to="/" className="logo">
              <img src="/CineNiche_Logo.png" alt="CineNiche Logo" className="logo-image" />
            </Link>
            <Link to="/" className="site-title">CineNiche</Link>
          </div>
        </div>
      </header>

    <div className="login-container">
      <h1 className="login-title">Sign In</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form">
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form">
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-check">
          <input
            type="checkbox"
            id="rememberMe"
            className="form-check-input"
            checked={rememberMe}
            onChange={handleChange}
          />
          <label htmlFor="rememberMe" className="form-check-label">
            Remember me
          </label>
        </div>

        <button type="submit" className="btn-login btn-primary">
          Sign In
        </button>

        <div className="login-divider">OR</div>

        <button type="button" className="btn-login btn-google">
          <FontAwesomeIcon icon={faGoogle} className="me-2" />
          Continue with Google
        </button>

        {error && <div className="error">{error}</div>}
      </form>

      <div className="login-footer">
        Don't have an account?{' '}
        <a href="/register" onClick={(e) => {
          e.preventDefault();
          navigate('/register');
        }}>
          Sign up
        </a>
      </div>
    </div>
    </>
  );
};

export default LoginPage;