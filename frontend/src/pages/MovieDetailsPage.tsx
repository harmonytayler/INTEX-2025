import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Movie } from '../types/Movie';
import { submitRating, getUserRating, getAverageRating } from '../api/MovieAPI';
import AuthorizeView from '../components/security/AuthorizeView';
import StarRating from '../components/StarRating';
import { useAuth } from '../contexts/AuthContext';
import ContentBasedRecommendations from '../components/movieview/ContentBasedRecommendations';
import CollaborativeRecommendations from '../components/movieview/CollaborativeRecommendations';
import '../style/MovieDetails.css';
import '../style/account.css';
import {
  FaArrowLeft,
  FaBookmark,
  FaRegBookmark,
  FaPlay,
  FaCookieBite,
} from 'react-icons/fa';
import Cookies from 'js-cookie';

const MovieDetailsPage: React.FC = () => {
  const { movieId } = useParams<{ movieId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRating, setUserRating] = useState<number>(0);
  const [userId, setUserId] = useState<number | null>(null);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showWatchModal, setShowWatchModal] = useState(false);
  const [showCookiesMessage, setShowCookiesMessage] = useState(false);

  // Load bookmarked movies from cookies on component mount
  useEffect(() => {
    const cookiesEnabled = navigator.cookieEnabled;

    if (cookiesEnabled) {
      const bookmarkedMovies = Cookies.get('bookmarkedMovies');
      if (bookmarkedMovies) {
        const bookmarkedIds = JSON.parse(bookmarkedMovies);
        if (movieId && bookmarkedIds.includes(movieId)) {
          setIsBookmarked(true);
        }
      }
    }
  }, [movieId]);

  useEffect(() => {
    const loadMovieDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const baseUrl =
          import.meta.env.VITE_API_BASE_URL || 'https://localhost:5001';
        const response = await fetch(`${baseUrl}/Movie/GetMovie/${movieId}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);

          if (response.status === 401) {
            throw new Error('Authentication failed. Please log in again.');
          } else if (response.status === 404) {
            throw new Error('Movie not found.');
          } else {
            throw new Error(
              `Failed to load movie details: ${response.status} ${response.statusText}`
            );
          }
        }

        const data = await response.json();
        setMovie({
          ...data.movie,
          posterUrl: data.posterUrl,
        });
      } catch (error) {
        console.error('Error loading movie details:', error);
        setError(
          error instanceof Error
            ? error.message
            : 'An error occurred while loading the movie. Please try again later.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (movieId) {
      loadMovieDetails();
    }
  }, [movieId]);

  // Load user ID and rating when movie is loaded
  useEffect(() => {
    const loadUserData = async () => {
      if (!movieId) return;

      try {
        // Get user ID from AuthContext
        if (user && user.userId) {
          setUserId(user.userId);

          // Get user's rating for this movie
          const rating = await getUserRating(movieId, user.userId);
          setUserRating(rating);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, [movieId, user]);

  // Load average rating and review count
  useEffect(() => {
    const loadAverageRating = async () => {
      if (!movieId) return;

      try {
        const { averageRating, reviewCount } = await getAverageRating(movieId);
        setAverageRating(averageRating);
        setReviewCount(reviewCount);
      } catch (error) {
        console.error('Error loading average rating:', error);
      }
    };

    loadAverageRating();
  }, [movieId]);

  // Helper function to get all genres for this movie
  const getGenres = () => {
    if (!movie) return '';

    const genres: string[] = [];

    // Check each genre field and add to the list if it's 1
    if (movie.action === 1) genres.push('Action');
    if (movie.adventure === 1) genres.push('Adventure');
    if (movie.animeSeriesInternationalTVShows === 1) genres.push('Anime');
    if (movie.britishTVShowsDocuseriesInternationalTVShows === 1)
      genres.push('British TV');
    if (movie.children === 1) genres.push('Children');
    if (movie.comedies === 1) genres.push('Comedy');
    if (movie.comediesDramasInternationalMovies === 1)
      genres.push('Comedy-Drama');
    if (movie.comediesInternationalMovies === 1)
      genres.push('International Comedy');
    if (movie.comediesRomanticMovies === 1) genres.push('Romantic Comedy');
    if (movie.crimeTVShowsDocuseries === 1) genres.push('Crime');
    if (movie.documentaries === 1) genres.push('Documentary');
    if (movie.documentariesInternationalMovies === 1)
      genres.push('International Documentary');
    if (movie.docuseries === 1) genres.push('Docuseries');
    if (movie.dramas === 1) genres.push('Drama');
    if (movie.dramasInternationalMovies === 1)
      genres.push('International Drama');
    if (movie.dramasRomanticMovies === 1) genres.push('Romantic Drama');
    if (movie.familyMovies === 1) genres.push('Family');
    if (movie.fantasy === 1) genres.push('Fantasy');
    if (movie.horrorMovies === 1) genres.push('Horror');
    if (movie.internationalMoviesThrillers === 1)
      genres.push('International Thriller');
    if (movie.internationalTVShowsRomanticTVShowsTVDramas === 1)
      genres.push('International TV');
    if (movie.kidsTV === 1) genres.push('Kids TV');
    if (movie.languageTVShows === 1) genres.push('Language TV');
    if (movie.musicals === 1) genres.push('Musical');
    if (movie.natureTV === 1) genres.push('Nature TV');
    if (movie.realityTV === 1) genres.push('Reality TV');
    if (movie.spirituality === 1) genres.push('Spirituality');
    if (movie.tVAction === 1) genres.push('TV Action');
    if (movie.tVComedies === 1) genres.push('TV Comedy');
    if (movie.tVDramas === 1) genres.push('TV Drama');
    if (movie.talkShowsTVComedies === 1) genres.push('Talk Show');
    if (movie.thrillers === 1) genres.push('Thriller');

    return genres.join(', ');
  };

  const handleRatingChange = async (rating: number) => {
    if (!movieId || !userId) {
      return;
    }

    try {
      await submitRating(movieId, userId, rating);
      setUserRating(rating);

      // Refresh the average rating and review count
      const { averageRating, reviewCount } = await getAverageRating(movieId);
      setAverageRating(averageRating);
      setReviewCount(reviewCount);
    } catch (error) {
      setError('Failed to submit rating. Please try again.');
    }
  };

  const toggleBookmark = () => {
    if (!movieId) return;

    // Check if cookies are enabled
    if (!navigator.cookieEnabled) {
      setShowCookiesMessage(true);
      return;
    }

    // Get current bookmarked movies from cookies
    const bookmarkedMovies = Cookies.get('bookmarkedMovies');
    let bookmarkedIds: string[] = [];

    if (bookmarkedMovies) {
      bookmarkedIds = JSON.parse(bookmarkedMovies);
    }

    if (isBookmarked) {
      // Remove from bookmarks
      bookmarkedIds = bookmarkedIds.filter((id) => id !== movieId);
    } else {
      // Add to bookmarks
      bookmarkedIds.push(movieId);
    }

    // Save updated bookmarks to cookies
    Cookies.set('bookmarkedMovies', JSON.stringify(bookmarkedIds), {
      expires: 365,
    }); // Expires in 1 year

    // Update state
    setIsBookmarked(!isBookmarked);
  };

  const handleWatchClick = () => {
    setShowWatchModal(true);
  };

  const closeWatchModal = () => {
    setShowWatchModal(false);
  };

  const closeCookiesMessage = () => {
    setShowCookiesMessage(false);
  };

  const checkCookiesEnabled = () => {
    if (navigator.cookieEnabled) {
      setShowCookiesMessage(false);
      toggleBookmark(); // Try to bookmark again
    }
  };

  return (
    <AuthorizeView>
      <div className="back-button-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft className="back-icon" />
        </button>
      </div>
      <div className="movie-page-container">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
          </div>
        ) : movie ? (
          <div className="movie-details-container">
            <div className="movie-details-header">
              <h1 className="selected-movie-title">{movie.title}</h1>
            </div>

            {/* Main content */}
            <div className="movie-details-content">
              {/* Poster Section */}
              <div className="movie-poster-section">
                <img
                  src={
                    movie.posterUrl ||
                    'https://via.placeholder.com/300x450?text=No+Poster'
                  }
                  alt={`${movie.title} poster`}
                  className="movie-poster"
                />
              </div>

              {/* Details Section */}
              <div className="movie-details-section">
                {movie.description && (
                  <div className="mt-6">
                    <p className="detail-description">{movie.description}</p>
                  </div>
                )}

                <p className="detail-item">
                  {movie.releaseYear} | {movie.duration} | {movie.rating} |{' '}
                  {getGenres()}
                </p>

                <div className="movie-details-grid">
                  {movie.director && (
                    <div>
                      <h3 className="detail-label">Directed by</h3>
                      <p className="detail-item">
                        {movie.director.split(' ').map((word, index, array) => (
                          <span key={index}>
                            {word}
                            {index % 2 === 1 && index < array.length - 1
                              ? ', '
                              : ' '}
                          </span>
                        ))}
                      </p>
                    </div>
                  )}

                  {movie.cast && (
                    <div>
                      <h3 className="detail-label">Starring</h3>
                      <p className="detail-item">
                        {movie.cast
                          .split(' ')
                          .slice(0, 6)
                          .map((word, index, array) => (
                            <span key={index}>
                              {word}
                              {index % 2 === 1 && index < array.length - 1
                                ? ', '
                                : ' '}
                            </span>
                          ))}
                      </p>
                    </div>
                  )}
                </div>
                <div className="divider-line"></div>

                {/* Action Buttons */}
                <div className="movie-action-buttons">
                  <button className="watch-button" onClick={handleWatchClick}>
                    <FaPlay className="watch-icon" />
                    <span>Watch</span>
                  </button>

                  <button
                    className={`bookmark-button ${isBookmarked ? 'bookmarked' : ''}`}
                    onClick={toggleBookmark}
                    aria-label={
                      isBookmarked
                        ? 'Remove from bookmarks'
                        : 'Add to bookmarks'
                    }
                  >
                    {isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
                    <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
                  </button>
                </div>

                <h3 className="rating-label">Rate {movie.title}</h3>
                <div className="movie-rating-container">
                  <StarRating
                    rating={userRating}
                    onRatingChange={handleRatingChange}
                  />
                  <div className="detail-item">
                    Average Rating: {averageRating.toFixed(1)} out of 5 (
                    {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                  </div>
                </div>
              </div>
            </div>
            {/* Recommendations Section */}
            <div className="recommendations-section">
              <ContentBasedRecommendations showId={movie.showId} />
            </div>

            <div className="recommendations-section">
              <CollaborativeRecommendations showId={movie.showId} />
            </div>
          </div>
        ) : null}
      </div>

      {/* Watch Modal */}
      {showWatchModal && movie && (
        <div className="modal-overlay" onClick={closeWatchModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Watch {movie.title}</h2>
              <button className="modal-close" onClick={closeWatchModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>This is a placeholder for the video player.</p>
              <p>
                In a real application, this would embed a video player or
                streaming service.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cookies Disabled Message */}
      {showCookiesMessage && (
        <div className="modal-overlay" onClick={closeCookiesMessage}>
          <div
            className="modal-content cookies-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Cookies Disabled</h2>
              <button className="modal-close" onClick={closeCookiesMessage}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="cookies-disabled-content">
                <FaCookieBite className="cookie-icon" />
                <p>
                  Please enable cookies in your browser to use the bookmark
                  feature.
                </p>
                <button
                  className="check-cookies-button"
                  onClick={checkCookiesEnabled}
                >
                  Check Again
                </button>
                <p className="cookie-help">
                  To enable cookies, please check your browser settings or
                  privacy settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="details-footer">
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
    </AuthorizeView>
  );
};

export default MovieDetailsPage;
