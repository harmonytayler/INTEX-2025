import { useState, useEffect } from 'react';
import { MovieUser } from '../../types/MovieUser';
import { useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import '../../style/header.css';
import '../../style/LandingPage.css';

const NewUserForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, isAuthenticated } = location.state || {};

  // Redirect if not coming from registration page
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/register');
    }
  }, [isAuthenticated, navigate]);

  const [userId, setUserId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await fetch(
          'https://intex-bougier.azurewebsites.net/MovieUser/GetNextUserId',
          {
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        );
        if (!response.ok) {
          throw new Error('Failed to fetch user ID');
        }
        const data = await response.json();
        setUserId(data);
      } catch (error) {
        console.error('Error fetching user ID:', error);
        setError('Error fetching user ID. Please try again.');
      }
    };

    if (isAuthenticated) {
      fetchUserId();
    }
  }, [isAuthenticated]);

  const [formData, setFormData] = useState<MovieUser>({
    movieUserId: userId || 0,
    userId: userId || 0,
    name: '',
    phone: '',
    email: email || '',
    age: NaN,
    gender: '',
    netflix: 0,
    amazonPrime: 0,
    disneyPlus: 0,
    paramountPlus: 0,
    max: 0,
    hulu: 0,
    city: '',
    state: '',
    zip: NaN,
    appleTVPlus: 0,
    peacock: 0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked ? 1 : 0
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://intex-bougier.azurewebsites.net';
      const response = await fetch(`${baseUrl}/MovieUser/AddUser`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user profile');
      }

      setSuccess(true);
      setError(null);

      // Redirect to login page after successfully adding the user
      navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
    } catch (error: any) {
      console.error('Error creating user profile:', error);
      setError(error.message || 'Failed to create user profile. Please try again.');
      setSuccess(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

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
        <h1 className="login-title">Complete Your Profile</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form">
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form">
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form">
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              readOnly
            />
          </div>

          <div className="form">
            <input
              type="number"
              id="age"
              name="age"
              placeholder="Age"
              value={formData.age}
              onChange={handleChange}
              required
              min="0"
            />
          </div>

          <div className="form">
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form">
            <input
              type="text"
              id="city"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
            />
          </div>

          <div className="form">
            <input
              type="text"
              id="state"
              name="state"
              placeholder="State"
              value={formData.state}
              onChange={handleChange}
            />
          </div>

          <div className="form">
            <input
              type="number"
              id="zip"
              name="zip"
              placeholder="ZIP Code"
              value={formData.zip}
              onChange={handleChange}
            />
          </div>

          <div className="form-divider"></div>
          
          <p className="streaming-p">Do you have a subscription to any of the following?</p>
          <div className="streaming-services">
            <div className="form-check">
              <input
                type="checkbox"
                id="netflix"
                name="netflix"
                checked={formData.netflix === 1}
                onChange={handleCheckboxChange}
                className="form-check-input"
              />
              <label htmlFor="netflix" className="form-check-label">Netflix</label>
            </div>

            <div className="form-check">
              <input
                type="checkbox"
                id="amazonPrime"
                name="amazonPrime"
                checked={formData.amazonPrime === 1}
                onChange={handleCheckboxChange}
                className="form-check-input"
              />
              <label htmlFor="amazonPrime" className="form-check-label">Amazon Prime</label>
            </div>

            <div className="form-check">
              <input
                type="checkbox"
                id="disneyPlus"
                name="disneyPlus"
                checked={formData.disneyPlus === 1}
                onChange={handleCheckboxChange}
                className="form-check-input"
              />
              <label htmlFor="disneyPlus" className="form-check-label">Disney+</label>
            </div>

            <div className="form-check">
              <input
                type="checkbox"
                id="paramountPlus"
                name="paramountPlus"
                checked={formData.paramountPlus === 1}
                onChange={handleCheckboxChange}
                className="form-check-input"
              />
              <label htmlFor="paramountPlus" className="form-check-label">Paramount+</label>
            </div>

            <div className="form-check">
              <input
                type="checkbox"
                id="max"
                name="max"
                checked={formData.max === 1}
                onChange={handleCheckboxChange}
                className="form-check-input"
              />
              <label htmlFor="max" className="form-check-label">Max</label>
            </div>

            <div className="form-check">
              <input
                type="checkbox"
                id="hulu"
                name="hulu"
                checked={formData.hulu === 1}
                onChange={handleCheckboxChange}
                className="form-check-input"
              />
              <label htmlFor="hulu" className="form-check-label">Hulu</label>
            </div>
          </div>

          <button type="submit" className="btn-login btn-primary">
            Complete Registration
          </button>

          {error && <div className="error">{error}</div>}
          {success && <div className="success">Profile created successfully!</div>}
        </form>
      </div>
    </>
  );
};

export default NewUserForm;
