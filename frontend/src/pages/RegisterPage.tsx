import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../style/identity.css';
import '@fortawesome/fontawesome-free/css/all.css';
import '../style/header.css';
import '../style/LandingPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';

const RegisterPage: React.FC = () => {
  // state variables for email and passwords
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const navigate = useNavigate();

  // state variable for error messages
  const [error, setError] = useState<string>('');

  // handle change events for input fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'email') setEmail(value);
    if (name === 'password') setPassword(value);
    if (name === 'confirmPassword') setConfirmPassword(value);
  };

  // handle submit event for the form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // validate email and passwords
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
    } else if (password !== confirmPassword) {
      setError('Passwords do not match.');
    } else {
      // clear error message
      setError('');
      
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:5001';
      
      try {
        // First create the authentication account
        const authResponse = await fetch(`${baseUrl}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (!authResponse.ok) {
          const errorData = await authResponse.json();
          throw new Error(errorData.message || 'Failed to create authentication account');
        }

        // If authentication account was created successfully, navigate to user info form
        navigate('/register/userinfo', { 
          state: { 
            email,
            isAuthenticated: true
          } 
        });
      } catch (error: any) {
        console.error('Registration error:', error);
        setError(error.message || 'Error registering. Please try again.');
      }
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
        <h1 className="login-title">Create Account</h1>
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

          <div className="form">
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn-login btn-primary">
            Create Account
          </button>


          {error && <div className="error">{error}</div>}
        </form>

        <div className="login-footer">
          Already have an account?{' '}
          <a href="/login" onClick={(e) => {
            e.preventDefault();
            navigate('/login');
          }}>
            Sign in
          </a>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
