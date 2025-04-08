import React, { useState } from 'react';
import { Movie } from '../types/Movie';

interface MovieCardProps {
  movie: Movie;
  onClick?: () => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onClick }) => {
  const [isImageError, setIsImageError] = useState(false); // State to track if the image has failed to load
  const imageUrl = movie.posterUrl; // Extract the URL from the JSON object

  // Handle image loading error
  const handleImageError = () => {
    setIsImageError(true);
  };

  return (
    <div 
      className="movie-card-container"
      onClick={onClick}
      title={`Click to view details for ${movie.title}`}
    >
      <div className="poster-placeholder">
        {!isImageError && imageUrl ? (
          <img 
            src={imageUrl} 
            alt={movie.title} 
            className="movie-poster-image"
            onError={handleImageError} // Trigger the error handler if the image fails to load
          />
        ) : (
          <div className="default-poster-message">
            <span>This show doesn't have a poster yet! :(</span>
          </div>
        )}
      </div>
      <h3 className="movie-title">{movie.title}</h3>
    </div>
  );
};

export default MovieCard;
