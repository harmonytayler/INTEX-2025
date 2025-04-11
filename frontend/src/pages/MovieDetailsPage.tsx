import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Movie } from '../types/Movie';
import {
  submitRating,
  getUserRating,
  getAverageRating,
  getMovieUserId,
  fetchMovieById,
  getContentBasedRecommendations,
  saveWatchedMovie,
  areCookiesEnabled,
} from '../api/MovieAPI';
import AuthorizeView from '../components/security/AuthorizeView';
import StarRating from '../components/StarRating';
import { useAuth } from '../contexts/AuthContext';
import ContentBasedRecommendations from '../components/movieview/ContentBasedRecommendations';
import CollaborativeRecommendations from '../components/movieview/CollaborativeRecommendations';
import '../style/MovieDetails.css';
import '../style/account.css';

const MovieDetailsPage: React.FC = () => {
  const { movieId } = useParams<{ movieId: string }>();
  const { user } = useAuth();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRating, setUserRating] = useState<number>(0);
  const [userId, setUserId] = useState<number | null>(null);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [showWatchPopup, setShowWatchPopup] = useState(false);
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [tempRating, setTempRating] = useState<number>(0);
  const [watchedMovie, setWatchedMovie] = useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadMovieDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const baseUrl =
          import.meta.env.VITE_API_BASE_URL || 'https://intex-bougier.azurewebsites.net';
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
        // Get user ID from auth context first
        if (user && user.userId) {
          setUserId(user.userId);
          
          // Get user's rating for this movie
          const rating = await getUserRating(movieId, user.userId);
          console.log('User rating for movie:', rating);
          setUserRating(rating);
        } else {
          // If no user ID in auth context, try to get it from movies_users table
          const movieUserId = await getMovieUserId();
          if (movieUserId) {
            setUserId(movieUserId);
            const rating = await getUserRating(movieId, movieUserId);
            setUserRating(rating);
          }
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

  // Load bookmark status when movie is loaded
  useEffect(() => {
    if (movieId) {
      const cookies = document.cookie.split(';');
      const bookmarkCookie = cookies.find((cookie) =>
        cookie.trim().startsWith('bookmarked_movies=')
      );

      if (bookmarkCookie) {
        const movieIds = JSON.parse(
          decodeURIComponent(bookmarkCookie.split('=')[1])
        );
        setIsBookmarked(movieIds.includes(movieId));
      }
    }
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

  const handleWatchNow = () => {
    setShowWatchPopup(true);
  };

  const handleLeaveMovie = () => {
    setShowWatchPopup(false);
  };

  const handleStartWatching = () => {
    if (movie) {
      saveWatchedMovie(movie.showId);
      setShowWatchPopup(false);
      setShowRatingPopup(true);
    }
  };

  const handleMarkAsWatched = () => {
    setShowWatchPopup(false);
    setWatchedMovie(true);
    setShowRatingPopup(true);
    // Store in cookies that the movie was watched
    document.cookie = `watched_${movieId}=true; path=/; max-age=31536000`; // Expires in 1 year
  };

  const handleRatingChange = async (rating: number) => {
    if (!movieId || !userId) {
      console.error('Missing movieId or userId:', { movieId, userId });
      setError('Please log in to rate this movie.');
      return;
    }

    try {
      // Submit the rating directly
      await submitRating(movieId, userId, rating);

      // Update the user's rating in state
      setUserRating(rating);

      // Refresh the average rating and review count
      const { averageRating, reviewCount } = await getAverageRating(movieId);
      setAverageRating(averageRating);
      setReviewCount(reviewCount);

      // Show success message
      setError(null);
    } catch (error) {
      console.error('Error submitting rating:', error);
      setError('Failed to submit rating. Please try again.');
    }
  };

  const handleRatingSubmit = async () => {
    if (!movieId || !userId) {
      console.error('Missing movieId or userId:', { movieId, userId });
      return;
    }

    try {
      // Ensure tempRating is a valid number
      if (typeof tempRating !== 'number' || tempRating < 1 || tempRating > 5) {
        setError('Please select a valid rating between 1 and 5 stars');
        return;
      }

      console.log('Submitting rating with values:', {
        movieId,
        userId,
        rating: tempRating,
      });

      // Submit the rating
      await submitRating(movieId, userId, tempRating);

      // Update the user's rating in state
      setUserRating(tempRating);

      // Close the rating popup
      setShowRatingPopup(false);

      // Refresh the average rating and review count
      const { averageRating, reviewCount } = await getAverageRating(movieId);
      setAverageRating(averageRating);
      setReviewCount(reviewCount);

      // Show success message
      setError(null);
    } catch (error) {
      console.error('Error submitting rating:', error);
      setError('Failed to submit rating. Please try again.');
    }
  };

  const handleBookmarkClick = () => {
    if (!movieId) return;

    if (!areCookiesEnabled()) {
      navigate('/bookmarks');
      return;
    }

    const cookies = document.cookie.split(';');
    const bookmarkCookie = cookies.find((cookie) =>
      cookie.trim().startsWith('bookmarked_movies=')
    );

    let movieIds: string[] = [];
    if (bookmarkCookie) {
      movieIds = JSON.parse(decodeURIComponent(bookmarkCookie.split('=')[1]));
    }

    if (isBookmarked) {
      // Remove from bookmarks
      movieIds = movieIds.filter((id) => id !== movieId);
    } else {
      // Add to bookmarks
      if (!movieIds.includes(movieId)) {
        movieIds.push(movieId);
      }
    }

    // Update cookie
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1); // Cookie expires in 1 year
    document.cookie = `bookmarked_movies=${encodeURIComponent(JSON.stringify(movieIds))}; expires=${expiryDate.toUTCString()}; path=/`;

    setIsBookmarked(!isBookmarked);
  };

  return (
    <AuthorizeView>
      <div className="back-button-container">
        <button className="back-button" onClick={() => window.history.back()}>
          <span>&larr;</span>
        </button>
      </div>
      <div>
        {/* Main content */}
        {loading && (
          <div className="text-center py-8">Loading movie details...</div>
        )}

        {error && (
          <div className="text-red-500 text-center py-8">Error: {error}</div>
        )}

        {!loading && !error && movie && (
          <div className="movie-details-container">
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
                <h1 className="selected-movie-title">{movie.title}</h1>

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
                <div className="action-buttons">
                  <button className="watch-button" onClick={handleWatchNow}>
                    <i className="fas fa-play"></i> Watch Now
                  </button>
                  <button
                    className={`bookmark-button ${isBookmarked ? 'bookmarked' : ''}`}
                    onClick={handleBookmarkClick}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
                  </button>
                </div>

                {/* Watch Popup */}
                {showWatchPopup && (
                  <div className="popup-overlay">
                    <div className="popup-content">
                      <div className="popup-header">
                        <h3>Watch {movie.title}</h3>
                        <button
                          className="close-button"
                          onClick={handleLeaveMovie}
                        >
                          ×
                        </button>
                      </div>
                      <div className="popup-body">
                        <div className="movie-poster-container">
                          <img
                            src={
                              movie.posterUrl ||
                              'https://via.placeholder.com/300x450?text=No+Poster'
                            }
                            alt={`${movie.title} poster`}
                            className="popup-poster"
                          />
                        </div>
                        <div className="popup-actions">
                          <p className="popup-description">
                            In a production environment, this would open the
                            movie in a streaming player. For now, this
                            simulation will track your watch history. Click
                            "Start Watching" to mark this movie as watched, or
                            "Leave Movie" to exit and provide feedback.
                          </p>
                          <div className="popup-buttons">
                            <button
                              className="popup-button leave-button"
                              onClick={handleLeaveMovie}
                            >
                              Leave Movie
                            </button>
                            <button
                              className="popup-button watch-button"
                              onClick={handleStartWatching}
                            >
                              Start Watching
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rating Section */}
                <div className="movie-rating-container">
                  <h3 className="rating-label">Rate {movie.title}</h3>
                  <div className="flex items-center gap-4">
                    <StarRating
                      rating={userRating}
                      onRatingChange={handleRatingChange}
                    />
                    {error && (
                      <div className="text-red-500 text-sm">{error}</div>
                    )}
                  </div>
                  <div className="detail-item mt-2">
                    Average Rating: {averageRating.toFixed(1)} out of 5 (
                    {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                  </div>
                  {!userId && (
                    <div className="mt-2 text-yellow-400 text-sm">
                      Please log in to rate this movie.
                    </div>
                  )}
                </div>

                {/* Rating Popup */}
                {showRatingPopup && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
                      <h3 className="text-xl font-semibold text-white mb-4">Rate this movie</h3>
                      <StarRating 
                        rating={tempRating} 
                        onRatingChange={setTempRating}
                        isPopup={true}
                      />
                      <div className="mt-4 flex justify-end gap-2">
                        <button
                          onClick={() => setShowRatingPopup(false)}
                          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleRatingSubmit}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Submit Rating
                        </button>
                      </div>
                    </div>
                  </div>
                )}
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
        )}
      </div>
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
