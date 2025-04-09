import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MovieUser } from '../types/MovieUser';
import { fetchMovieUserById, updateMovieUser } from '../api/MovieUserAPI';
import { useAuth } from '../contexts/AuthContext';
import '../style/account.css';

const EditingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [movieUser, setMovieUser] = useState<MovieUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<MovieUser | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.userId) {
        setError('User ID not found. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        const userData = await fetchMovieUserById(user.userId);
        setMovieUser(userData);
        setFormData(userData);
        setError(null);
      } catch (err) {
        setError('Failed to load user data. Please try again later.');
        console.error('Error loading user data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!formData) return;

    const { name, value, type } = e.target;
    setFormData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [name]: type === 'number' ? Number(value) : value
      };
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;

    const { name, checked } = e.target;
    setFormData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [name]: checked ? 1 : 0
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !user?.userId) return;

    try {
      console.log('Submitting form data:', formData);
      await updateMovieUser(user.userId, formData);
      navigate('/account');
    } catch (err) {
      setError('Failed to update user data. Please try again.');
      console.error('Error updating user data:', err);
      // Log more details about the error
      if (err instanceof Error) {
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
      }
    }
  };

  const handleBackClick = () => {
    navigate('/account');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading user data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <div className="text-xl text-red-500 mb-4">{error}</div>
        <button
          onClick={handleBackClick}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Back to Account
        </button>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <div className="text-xl text-red-500 mb-4">User data not found</div>
        <button
          onClick={handleBackClick}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Back to Account
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="account-container flex-grow">
        <div className="max-w-4xl mx-auto">
          <h1 className="account-header">Edit Account Information</h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            <table className="account-table">
              <tbody>
                <tr>
                  <td>Name</td>
                  <td>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </td>
                </tr>
                <tr>
                  <td>Phone</td>
                  <td>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </td>
                </tr>
                <tr>
                  <td>Age</td>
                  <td>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </td>
                </tr>
                <tr>
                  <td>Gender</td>
                  <td>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td>City/State</td>
                  <td>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </td>
                </tr>
                <tr>
                  <td>ZIP Code</td>
                  <td>
                    <input
                      type="number"
                      name="zip"
                      value={formData.zip}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <br/>
            <div className="flex justify-end space-x-4">
            <button
                type="submit"
                className="account-button account-button-edit"
              >
                Save Changes
              </button>
              <br/>
              <br/>
              <button
                type="button"
                onClick={handleBackClick}
                className="account-button account-button-delete"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
        <footer className="account-footer">
          <div className="footer-content">
            <p className="footer-copyright">
              © {new Date().getFullYear()} CineNiche. All rights reserved.
            </p>
            <div className="footer-links">
              <Link to="/" className="footer-link">
                Home
              </Link>
              <Link to="/home" className="footer-link">
                Browse
              </Link>
              <Link to="/privacy" className="footer-link">
                Privacy Policy
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default EditingPage; 