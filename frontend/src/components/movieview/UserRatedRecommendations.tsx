import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Movie } from '../../types/Movie';
import { getContentBasedRecommendations } from '../../api/MovieAPI';
import MovieRow from '../MovieRow';
import './Recommendations.css';
import '../../style/MovieDetails.css';

interface UserRatedRecommendationsProps {
  showId: string;
  movieTitle: string;
}

const UserRatedRecommendations: React.FC<UserRatedRecommendationsProps> = ({ 
  showId,
  movieTitle 
}) => {
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleMovieClick = (movie: Movie) => {
    navigate(`/movie/${movie.showId}`);
  };

  const fetchRecommendations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching recommendations for showId:', showId);

      const contentBasedRecommendations =
        await getContentBasedRecommendations(showId);
      console.log('Received recommendations:', contentBasedRecommendations);

      if (
        contentBasedRecommendations &&
        contentBasedRecommendations.length > 0
      ) {
        setRecommendations(contentBasedRecommendations);
      } else {
        console.log('No recommendations available for showId:', showId);
        setError('No recommendations available');
      }
    } catch (err) {
      console.error('Error fetching content-based recommendations:', err);
      setError('Failed to load recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (showId) {
      fetchRecommendations();
    }
  }, [showId]);

  if (isLoading) {
    return (
      <div className="recommendations-loading">Loading recommendations...</div>
    );
  }

  if (error) {
    return <div className="recommendations-error">{error}</div>;
  }

  if (recommendations.length === 0) {
    return (
      <div className="recommendations-empty">No recommendations available</div>
    );
  }

  return (
    <div>
      <MovieRow
        genre={`Since you like ${movieTitle}, you may also like...`}
        movies={recommendations}
        onMovieClick={handleMovieClick}
      />
    </div>
  );
};

export default UserRatedRecommendations; 