import React, { useRef, useState, useEffect } from 'react';
import { Movie } from '../types/Movie';
import MovieCard from './MovieCard';

interface MovieRowProps {
  genre: string;
  movies: Movie[];
  onMovieClick?: (movie: Movie) => void;
}

const MovieRow: React.FC<MovieRowProps> = ({ genre, movies, onMovieClick }) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Check if we need to show arrows based on scroll position
  const checkScrollPosition = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      
      // Show left arrow if we've scrolled right
      setShowLeftArrow(scrollLeft > 0);
      
      // Show right arrow if there's more content to scroll to
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Add scroll event listener
  useEffect(() => {
    const rowElement = rowRef.current;
    if (rowElement) {
      rowElement.addEventListener('scroll', checkScrollPosition);
      // Initial check
      checkScrollPosition();
      
      return () => {
        rowElement.removeEventListener('scroll', checkScrollPosition);
      };
    }
  }, []);

  // Scroll functions
  const scrollLeft = () => {
    if (rowRef.current) {
      rowRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (rowRef.current) {
      rowRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="movie-row mb-6 relative group">
      <h2 className="text-lg font-bold text-white mb-2">{genre}</h2>
      
      {/* Left Arrow */}
      {showLeftArrow && (
        <button 
          onClick={scrollLeft}
          className="absolute left-0 top-16 z-10 bg-black/50 rounded-full p-2 text-white opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Scroll left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      
      {/* Right Arrow */}
      {showRightArrow && (
        <button 
          onClick={scrollRight}
          className="absolute right-0 top-16 z-10 bg-black/50 rounded-full p-2 text-white opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Scroll right"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
      
      <div 
        ref={rowRef}
        className="movie-row-container flex overflow-x-auto scrollbar-hide px-4"
      >
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