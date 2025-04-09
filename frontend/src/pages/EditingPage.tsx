import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MovieUser } from '../types/MovieUser';
import { fetchMovieUserById, updateMovieUser } from '../api/MovieUserAPI';
import { useAuth } from '../contexts/AuthContext';

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
    <div className="min-h-screen bg-black text-white">
      {/* Header with back button */}
      <div className="bg-black/80 fixed top-0 left-0 right-0 z-50 p-4">
        <div className="container mx-auto flex items-center">
          <button
            onClick={handleBackClick}
            className="flex items-center text-green-700 hover:text-green-500 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Account
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 pt-20 pb-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Edit Account Information</h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Gender</label>
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
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">ZIP Code</label>
                  <input
                    type="number"
                    name="zip"
                    value={formData.zip}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Streaming Services</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="netflix"
                    checked={formData.netflix === 1}
                    onChange={handleCheckboxChange}
                    className="form-checkbox h-5 w-5 text-green-500"
                  />
                  <span>Netflix</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="amazonPrime"
                    checked={formData.amazonPrime === 1}
                    onChange={handleCheckboxChange}
                    className="form-checkbox h-5 w-5 text-green-500"
                  />
                  <span>Amazon Prime</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="disneyPlus"
                    checked={formData.disneyPlus === 1}
                    onChange={handleCheckboxChange}
                    className="form-checkbox h-5 w-5 text-green-500"
                  />
                  <span>Disney+</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="paramountPlus"
                    checked={formData.paramountPlus === 1}
                    onChange={handleCheckboxChange}
                    className="form-checkbox h-5 w-5 text-green-500"
                  />
                  <span>Paramount+</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="max"
                    checked={formData.max === 1}
                    onChange={handleCheckboxChange}
                    className="form-checkbox h-5 w-5 text-green-500"
                  />
                  <span>Max</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="hulu"
                    checked={formData.hulu === 1}
                    onChange={handleCheckboxChange}
                    className="form-checkbox h-5 w-5 text-green-500"
                  />
                  <span>Hulu</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="appleTVPlus"
                    checked={formData.appleTVPlus === 1}
                    onChange={handleCheckboxChange}
                    className="form-checkbox h-5 w-5 text-green-500"
                  />
                  <span>Apple TV+</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="peacock"
                    checked={formData.peacock === 1}
                    onChange={handleCheckboxChange}
                    className="form-checkbox h-5 w-5 text-green-500"
                  />
                  <span>Peacock</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleBackClick}
                className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditingPage; 