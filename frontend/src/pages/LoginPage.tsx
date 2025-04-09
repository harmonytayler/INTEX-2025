import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/identity.css';
import '@fortawesome/fontawesome-free/css/all.css';
import { useAuth } from '../contexts/AuthContext';

function LoginPage() {
  // state variables for email and passwords
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberme, setRememberme] = useState<boolean>(false);
  const { setUser } = useAuth();

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

    // 🔑  NEW — start Google OAuth by redirecting to the API
    const handleGoogleLogin = () => {
      const api = import.meta.env.VITE_API_BASE_URL || 'https://localhost:5001';
      const redirectUrl = `${api}/auth/google?returnUrl=/home`;
      console.log("Redirecting to:", redirectUrl); // <-- temporary log
      window.location.href = redirectUrl;
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
    const loginUrl = rememberme
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
    <div className="container">
      <div className="row">
        <div className="card border-0 shadow rounded-3 ">
          <div className="card-body p-4 p-sm-5">
            <h5 className="card-title text-center mb-5 fw-light fs-5">
              Sign In
            </h5>
            <form onSubmit={handleSubmit}>
              <div className="form-floating mb-3">
                <input
                  className="form-control"
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleChange}
                />
                <label htmlFor="email">Email address</label>
              </div>
              <div className="form-floating mb-3">
                <input
                  className="form-control"
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={handleChange}
                />
                <label htmlFor="password">Password</label>
              </div>

              <div className="form-check mb-3">
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
              <div className="d-grid mb-2">
                <button
                  className="btn btn-primary btn-login text-uppercase fw-bold"
                  type="submit"
                >
                  Sign in
                </button>
              </div>
              <div className="d-grid mb-2">
                <button
                  className="btn btn-primary btn-login text-uppercase fw-bold"
                  onClick={handleRegisterClick}
                >
                  Register
                </button>
              </div>
              <hr className="my-4" />
              <div className="d-grid mb-2">
              <button
  className="btn btn-google btn-login text-uppercase fw-bold"
  type="button"  // Prevents form submission
  onClick={handleGoogleLogin}
>
  <i className="fa-brands fa-google me-2"></i> Sign in with Google
</button>





              </div>
              <div className="d-grid mb-2">
              </div>
            </form>
            {error && <p className="error">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;