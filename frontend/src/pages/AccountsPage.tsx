import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MovieUser } from '../types/MovieUser';
import { getMovieUserByEmail, deleteMovieUser } from '../api/MovieUserAPI';
import { useAuth } from '../contexts/AuthContext';
import '../style/account.css';

const AccountsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [movieUser, setMovieUser] = useState<MovieUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.email) {
        setError('Email not found. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        const userData = await getMovieUserByEmail(user.email);
        setMovieUser(userData);
        setError(null);
      } catch (err) {
        // If the user is an admin and doesn't have a movie user record, show a message
        if (isAdmin) {
          setError(
            'Admin accounts do not have movie user profiles. Please use the admin page to manage the system.'
          );
        } else {
          setError('Failed to load user data. Please try again later.');
        }
        console.error('Error loading user data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user, isAdmin]);

  const handleBackClick = () => {
    navigate('/home');
  };

  const handleEditClick = () => {
    if (isAdmin) {
      navigate('/admin');
    } else {
      navigate('/account/edit');
    }
  };

  const handleDeleteClick = async () => {
    if (!movieUser) return;

    if (
      window.confirm(
        'Are you sure you want to delete your account? This action cannot be undone.'
      )
    ) {
      try {
        await deleteMovieUser(movieUser.movieUserId);
        logout();
        navigate('/login');
      } catch (err) {
        console.error('Error deleting account:', err);
        setError('Failed to delete account. Please try again later.');
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="back-button-container">
        <button className="back-button" onClick={() => window.history.back()}>
          <span>&larr;</span>
        </button>
      </div>
      <div className="account-container flex-grow">
        <h1 className="account-header">Account Information</h1>

        {error ? (
          <div className="error-message">{error}</div>
        ) : movieUser ? (
          <>
            <table className="account-table">
              <tbody>
                <tr>
                  <td>Name</td>
                  <td>{movieUser.name}</td>
                </tr>
                <tr>
                  <td>Email</td>
                  <td>{movieUser.email}</td>
                </tr>
                <tr>
                  <td>Phone</td>
                  <td>{movieUser.phone}</td>
                </tr>
                <tr>
                  <td>Age</td>
                  <td>{movieUser.age}</td>
                </tr>
                <tr>
                  <td>Gender</td>
                  <td>{movieUser.gender}</td>
                </tr>
                <tr>
                  <td>Location</td>
                  <td>
                    {movieUser.city}, {movieUser.state} {movieUser.zip}
                  </td>
                </tr>
              </tbody>
            </table>
            <br />

            <div className="flex flex-col space-y-4">
              <button
                onClick={handleEditClick}
                className="account-button account-button-edit"
              >
                {isAdmin ? 'Go to Admin Page' : 'Edit Account Details'}
              </button>
              <br />
              <br />

              {!isAdmin && (
                <button
                  onClick={handleDeleteClick}
                  className="account-button account-button-delete"
                >
                  Delete Account
                </button>
              )}
            </div>
          </>
        ) : null}
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
  );
};

export default AccountsPage;
