import React, { useRef } from 'react';
import { Movie } from '../types/Movie';
import MovieCard from './MovieCard';

interface MovieRowProps {
  genre: string;
  movies: Movie[];
  onMovieClick: (movie: Movie) => void;
  isTopTen?: boolean;
}

const MovieRow: React.FC<MovieRowProps> = ({ genre, movies, onMovieClick }) => {
  const rowRef = useRef<HTMLDivElement>(null);

  return (
    <div className="movie-row">
      <h2 className="movie-row-header">{genre}</h2>
      <div className="movie-row-container" ref={rowRef}>
        {movies.map((movie) => (
          <MovieCard
            key={movie.showId || `movie-${movie.title}`}
            movie={movie}
            onClick={() => onMovieClick(movie)}
          />
        ))}
      </div>
    </div>
  );
};

export default MovieRow;
