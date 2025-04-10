import React, { useState } from 'react';
import { Movie } from '../types/Movie';

interface MovieCardProps {
  movie: Movie;
  onClick?: () => void;
  ranking?: number; // Optional ranking number for top movies
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onClick, ranking }) => {
  const [isImageError, setIsImageError] = useState(false); // State to track if the image has failed to load
  const imageUrl = movie.posterUrl; // Extract the URL from the JSON object

  // Don't render if there's no poster URL or if the image fails to load
  if (!imageUrl || isImageError) {
    return null;
  }

  // Handle image loading error
  const handleImageError = () => {
    setIsImageError(true);
  };

  return (
    <div 
      className="movie-card"
      onClick={onClick}
      title={`Click to view details for ${movie.title}`}
    >
      <div className="poster-placeholder">
        <img 
          src={imageUrl} 
          alt={movie.title} 
          className="movie-poster-image"
          onError={handleImageError} // Trigger the error handler if the image fails to load
          loading="lazy"
          width={130}
          height={195}
        />
      </div>
      <h3 className="movie-title">
        {ranking ? `${ranking}. ${movie.title}` : movie.title}
      </h3>
    </div>
  );
};

export default MovieCard;
