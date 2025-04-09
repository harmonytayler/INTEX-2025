import React from 'react';
import { Movie } from '../types/Movie';
import MovieCard from './MovieCard';

interface MovieRowProps {
  genre: string;
  movies: Movie[];
  onMovieClick?: (movie: Movie) => void;
}

const MovieRow: React.FC<MovieRowProps> = ({ genre, movies, onMovieClick }) => {
  return (
    <div className="movie-row">
      <h2 className="movie-row-header">Top {genre} Movies</h2>
      <div className="movie-row-container">
        {movies.map((movie) => (
          <MovieCard
            key={movie.showId}
            movie={movie}
            onClick={() => onMovieClick?.(movie)}
          />
        ))}
      </div>
    </div>
  );
};

export default MovieRow; 