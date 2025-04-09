import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MovieUser } from '../types/MovieUser';
import { fetchMovieUserById, deleteMovieUser } from '../api/MovieUserAPI';
import { useAuth } from '../contexts/AuthContext';

const AccountsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [movieUser, setMovieUser] = useState<MovieUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const handleBackClick = () => {
    navigate('/home');
  };

  const handleEditClick = () => {
    navigate('/account/edit');
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!user?.userId) return;

    try {
      await deleteMovieUser(user.userId);
      // Log out the user after successful deletion
      logout();
      navigate('/login');
    } catch (err) {
      setError('Failed to delete account. Please try again later.');
      console.error('Error deleting account:', err);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
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
          Back to Home
        </button>
      </div>
    );
  }

  if (!movieUser) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <div className="text-xl text-red-500 mb-4">User data not found</div>
        <button
          onClick={handleBackClick}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header with back button */}
      <div className="bg-black/80 fixed top-0 left-0 right-0 z-50 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <button
            onClick={handleBackClick}
            className="flex items-center text-green-700 hover:text-green-500 transition-colors"
            style={{ color: '#15803d', textDecoration: 'none' }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
              style={{ color: '#15803d' }}
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Home
          </button>
          <div className="flex space-x-2">
            <button
              onClick={handleEditClick}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit Account
            </button>
            <button
              onClick={handleDeleteClick}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-red-500">Delete Account</h2>
            <p className="mb-6">
              Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="container mx-auto px-4 pt-20 pb-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Account Information</h1>

          <div className="bg-gray-900 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400">Name</p>
                <p className="text-white">{movieUser.name}</p>
              </div>
              <div>
                <p className="text-gray-400">Email</p>
                <p className="text-white">{movieUser.email}</p>
              </div>
              <div>
                <p className="text-gray-400">Phone</p>
                <p className="text-white">{movieUser.phone}</p>
              </div>
              <div>
                <p className="text-gray-400">Age</p>
                <p className="text-white">{movieUser.age}</p>
              </div>
              <div>
                <p className="text-gray-400">Gender</p>
                <p className="text-white">{movieUser.gender}</p>
              </div>
              <div>
                <p className="text-gray-400">Location</p>
                <p className="text-white">
                  {movieUser.city}, {movieUser.state} {movieUser.zip}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Streaming Services</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center">
                <span className="mr-2">
                  {movieUser.netflix === 1 ? '✓' : '✗'}
                </span>
                <span>Netflix</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">
                  {movieUser.amazonPrime === 1 ? '✓' : '✗'}
                </span>
                <span>Amazon Prime</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">
                  {movieUser.disneyPlus === 1 ? '✓' : '✗'}
                </span>
                <span>Disney+</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">
                  {movieUser.paramountPlus === 1 ? '✓' : '✗'}
                </span>
                <span>Paramount+</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">
                  {movieUser.max === 1 ? '✓' : '✗'}
                </span>
                <span>Max</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">
                  {movieUser.hulu === 1 ? '✓' : '✗'}
                </span>
                <span>Hulu</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">
                  {movieUser.appleTVPlus === 1 ? '✓' : '✗'}
                </span>
                <span>Apple TV+</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">
                  {movieUser.peacock === 1 ? '✓' : '✗'}
                </span>
                <span>Peacock</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountsPage; 