import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Movie } from '../../types/Movie';
import { getCollaborativeRecommendations } from '../../api/MovieAPI';
import MovieRow from '../MovieRow';
import './Recommendations.css';

interface CollaborativeRecommendationsProps {
  showId: string;
}

const CollaborativeRecommendations: React.FC<
  CollaborativeRecommendationsProps
> = ({ showId }) => {
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

      const collaborativeRecommendations =
        await getCollaborativeRecommendations(showId);

      if (
        collaborativeRecommendations &&
        collaborativeRecommendations.length > 0
      ) {
        setRecommendations(collaborativeRecommendations);
      } else {
        setError('No recommendations available');
      }
    } catch (err) {
      console.error('Error fetching collaborative recommendations:', err);
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
    <div className="recommendations-container">
      <MovieRow
        genre="Personalized Recommendations"
        movies={recommendations}
        onMovieClick={handleMovieClick}
      />
    </div>
  );
};

export default CollaborativeRecommendations;
