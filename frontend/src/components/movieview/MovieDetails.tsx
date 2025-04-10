import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Movie } from '../../types/Movie';
import {
  fetchMovieById,
  submitRating,
  getUserRating,
} from '../../api/MovieAPI';
import { useAuth } from '../../contexts/AuthContext';
import StarRating from './StarRating';
import ContentBasedRecommendations from './ContentBasedRecommendations';
import CollaborativeRecommendations from './CollaborativeRecommendations';
import './MovieDetails.css';

const MovieDetails: React.FC = () => {
  const { showId } = useParams<{ showId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [userRating, setUserRating] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMovie = async () => {
      if (!showId) return;
      try {
        setIsLoading(true);
        const movieData = await fetchMovieById(showId);
        setMovie(movieData);
        if (user) {
          const rating = await getUserRating(showId, user.userId);
          setUserRating(rating);
        }
      } catch (err) {
        setError('Failed to load movie details');
        console.error('Error loading movie:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMovie();
  }, [showId, user]);

  const handleRatingChange = async (rating: number) => {
    if (!movie || !user) return;
    try {
      await submitRating(movie.showId, user.userId, rating);
      setUserRating(rating);
    } catch (err) {
      console.error('Error submitting rating:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="movie-details-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="movie-details-container">
        <div className="error">{error || 'Movie not found'}</div>
      </div>
    );
  }

  return (
    <div className="movie-details-container">
      <div className="movie-details-content">
        <div className="movie-poster-section">
          <img
            src={movie.posterUrl || '/placeholder-poster.jpg'}
            alt={movie.title}
            className="movie-poster"
          />
        </div>
        <div className="movie-info-section">
          <h1 className="movie-title">{movie.title}</h1>
          <div className="movie-meta">
            <span className="movie-year">{movie.releaseYear}</span>
            <span className="movie-runtime">{movie.duration || 'N/A'}</span>
            <span className="movie-rating">{movie.rating || 'N/A'}</span>
          </div>
          <div className="movie-rating-section">
            <div className="average-rating">
              <span className="rating-label">Average Rating:</span>
              <StarRating
                rating={movie.averageStarRating || 0}
                readOnly={true}
                onRatingChange={() => {}}
              />
              <span className="rating-value">
                {movie.averageStarRating?.toFixed(1) || '0.0'}
              </span>
            </div>
            {user && (
              <div className="user-rating">
                <span className="rating-label">Your Rating:</span>
                <StarRating
                  rating={userRating}
                  onRatingChange={handleRatingChange}
                />
              </div>
            )}
          </div>
          <div className="movie-description">
            <h3>Description</h3>
            <p>{movie.description || 'No description available.'}</p>
          </div>
          <div className="movie-details-grid">
            <div className="detail-item">
              <span className="detail-label">Director:</span>
              <span className="detail-value">
                {movie.director || 'Unknown'}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Cast:</span>
              <span className="detail-value">{movie.cast || 'Unknown'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Genres:</span>
              <span className="detail-value">
                {Object.entries(movie)
                  .filter(
                    ([key, value]) =>
                      typeof value === 'number' &&
                      value === 1 &&
                      !['showId', 'releaseYear', 'averageStarRating'].includes(
                        key
                      )
                  )
                  .map(([key]) => key.replace(/([A-Z])/g, ' $1').trim())
                  .join(', ') || 'Unknown'}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Type:</span>
              <span className="detail-value">{movie.type}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="recommendations-section">
        <ContentBasedRecommendations showId={movie.showId} />
        <CollaborativeRecommendations showId={movie.showId} />
      </div>
    </div>
  );
};

export default MovieDetails;
