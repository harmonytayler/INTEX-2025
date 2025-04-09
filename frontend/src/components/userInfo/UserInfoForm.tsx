import { useState, useEffect } from 'react';
import { MovieUser } from '../../types/MovieUser';
import { addMovieUser } from '../../api/MovieUserAPI';
import { useLocation, useNavigate } from 'react-router-dom';

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

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await fetch(
          'https://localhost:5001/MovieUser/GetNextUserId',
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
    name: '',
    phone: '',
    email: email || '', // Use the email passed from the register page
    age: 0,
    gender: '',
    netflix: 0,
    amazonPrime: 0,
    disneyPlus: 0,
    paramountPlus: 0,
    max: 0,
    hulu: 0,
    appleTVPlus: 0,
    peacock: 0,
    city: '',
    state: '',
    zip: 0,
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const isCheckbox = (e.target as HTMLInputElement).type === 'checkbox';

    if (isCheckbox) {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked ? 1 : 0,
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'number' ? parseInt(value) : value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.email || !formData.age || !formData.gender) {
      setError('Please fill in all required fields (Name, Email, Age, Gender)');
      return;
    }

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:5001';
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
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="container">
      <div className="row">
        <div className="card border-0 shadow rounded-3">
          <div className="card-body p-4 p-sm-5">
            <h5 className="card-title text-center mb-5 fw-light fs-5">
              Complete Your Profile
            </h5>
            <form onSubmit={handleSubmit}>
              <div className="form-floating mb-3">
                <input
                  className="form-control"
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="name">Name</label>
              </div>

              <div className="form-floating mb-3">
                <input
                  className="form-control"
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
                <label htmlFor="phone">Phone</label>
              </div>

              <div className="form-floating mb-3">
                <input
                  className="form-control"
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  readOnly
                />
                <label htmlFor="email">Email</label>
              </div>

              <div className="form-floating mb-3">
                <input
                  className="form-control"
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  min="0"
                />
                <label htmlFor="age">Age</label>
              </div>

              <div className="form-floating mb-3">
                <select
                  className="form-control"
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <label htmlFor="gender">Gender</label>
              </div>

              <h6 className="mb-3">Streaming Services</h6>
              <div className="row mb-3">
                <div className="col-md-6">
                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="netflix"
                      name="netflix"
                      checked={formData.netflix === 1}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="netflix">
                      Netflix
                    </label>
                  </div>

                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="amazonPrime"
                      name="amazonPrime"
                      checked={formData.amazonPrime === 1}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="amazonPrime">
                      Amazon Prime
                    </label>
                  </div>

                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="disneyPlus"
                      name="disneyPlus"
                      checked={formData.disneyPlus === 1}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="disneyPlus">
                      Disney+
                    </label>
                  </div>

                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="paramountPlus"
                      name="paramountPlus"
                      checked={formData.paramountPlus === 1}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="paramountPlus">
                      Paramount+
                    </label>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="max"
                      name="max"
                      checked={formData.max === 1}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="max">
                      Max
                    </label>
                  </div>

                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="hulu"
                      name="hulu"
                      checked={formData.hulu === 1}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="hulu">
                      Hulu
                    </label>
                  </div>

                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="appleTVPlus"
                      name="appleTVPlus"
                      checked={formData.appleTVPlus === 1}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="appleTVPlus">
                      Apple TV+
                    </label>
                  </div>

                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="peacock"
                      name="peacock"
                      checked={formData.peacock === 1}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="peacock">
                      Peacock
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-floating mb-3">
                <input
                  className="form-control"
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
                <label htmlFor="city">City</label>
              </div>

              <div className="form-floating mb-3">
                <input
                  className="form-control"
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                />
                <label htmlFor="state">State</label>
              </div>

              <div className="form-floating mb-3">
                <input
                  className="form-control"
                  type="number"
                  id="zip"
                  name="zip"
                  value={formData.zip}
                  onChange={handleChange}
                  min="0"
                />
                <label htmlFor="zip">ZIP Code</label>
              </div>

              <div className="d-grid mb-2">
                <button
                  className="btn btn-primary btn-login text-uppercase fw-bold"
                  type="submit"
                >
                  Complete Registration
                </button>
              </div>
            </form>
            {error && <div className="alert alert-danger mt-3">{error}</div>}
            {success && (
              <div className="alert alert-success mt-3">
                Registration successful! Redirecting to login...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewUserForm;
