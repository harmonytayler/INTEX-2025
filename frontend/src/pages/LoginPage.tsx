import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../style/identity.css';
import '../style/header.css';
import '../style/LandingPage.css';
import '@fortawesome/fontawesome-free/css/all.css';
import { useAuth } from '../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle, faFacebook } from '@fortawesome/free-brands-svg-icons';


function LoginPage() {
  // state variables for email and passwords
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberme, setRememberme] = useState<boolean>(false);
  const { setUser, setLoading } = useAuth();

  // state variable for error messages
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  // handle change events for input fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    if (type === 'checkbox') {
      setRememberme(checked);
    } else if (name === 'email') {
      setEmail(value);
    } else if (name === 'password') {
      setPassword(value);
    }
  };
  const handleRegisterClick = () => {
    navigate('/register');
  };

  // handle submit event for the form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(''); // Clear any previous errors
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://intex-bougier.azurewebsites.net';
    const loginUrl = rememberme
      ? `${baseUrl}/login?useCookies=true`
      : `${baseUrl}/login?useSessionCookies=true`;

    try {
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      // Get the JWT token from the response
      const token = response.headers.get('Authorization')?.replace('Bearer ', '');
      if (token) {
        localStorage.setItem('token', token);
      }

      // Fetch user info including roles
      const userInfoResponse = await fetch(`${baseUrl}/userinfo`, {
        credentials: 'include',
      });

      if (!userInfoResponse.ok) {
        throw new Error('Failed to fetch user info');
      }

      const userInfo = await userInfoResponse.json();
      console.log('User info from server:', userInfo);
      
      // Set user with roles
      const userData = {
        email: userInfo.email,
        userId: userInfo.userId,
        roles: userInfo.roles || []
      };
      console.log('Setting user data:', userData);
      console.log('User roles:', userData.roles);
      setUser(userData);

      navigate('/home');
    } catch (error) {
      setError('Invalid email or password');
      setLoading(false);
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
            <h5 className="login-title">Sign In</h5>
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleChange}
                />
                <label htmlFor="email" className="form-check-label">Email address</label>
              </div>
              <div className="form">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={handleChange}
                />
                <label htmlFor="password" className="form-check-label">Password</label>
              </div>

              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  value=""
                  id="rememberme"
                  name="rememberme"
                  checked={rememberme}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="rememberme">
                  Remember password
                </label>
              </div>
                <button
                  className="btn-login btn-primary"
                  type="submit"
                >
                  Sign in
                </button>
                <button
                  className="btn-primary btn-login"
                  onClick={handleRegisterClick}
                >
                  Register
                </button>

            </form>
            {error && <p className="error">{error}</p>}

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
}

export default LoginPage;