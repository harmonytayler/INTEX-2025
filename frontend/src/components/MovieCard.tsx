import React from 'react';
import { Movie } from '../types/Movie';

interface MovieCardProps {
  movie: Movie;
  onClick?: () => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onClick }) => {
  return (
    <div 
      className="movie-card flex-shrink-0 w-32 mx-4 cursor-pointer transform transition-transform duration-200 hover:scale-105 hover:shadow-lg hover:shadow-red-900/50"
      onClick={onClick}
      title={`Click to view details for ${movie.title}`}
    >
      <div className="poster-placeholder bg-gray-800 w-full aspect-square rounded-md mb-1 flex items-center justify-center">
        <span className="text-gray-400 text-xs">Poster</span>
      </div>
      <h3 className="text-white text-xs font-medium truncate text-center hover:text-red-500 transition-colors duration-200">{movie.title}</h3>
    </div>
  );
};

export default MovieCard; 