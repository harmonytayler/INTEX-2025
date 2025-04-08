import React, { useState, useEffect, useRef } from 'react';
import { Movie } from '../types/Movie';

interface SearchDropdownProps {
  searchTerm: string;
  movies: Movie[];
  onMovieSelect: (movie: Movie) => void;
  onClose: () => void;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({
  searchTerm,
  movies,
  onMovieSelect,
  onClose
}) => {
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter movies based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredMovies([]);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const matches = movies.filter(movie => 
      movie.title.toLowerCase().includes(lowerSearchTerm) ||
      (movie.director && movie.director.toLowerCase().includes(lowerSearchTerm)) ||
      (movie.cast && movie.cast.toLowerCase().includes(lowerSearchTerm))
    );

    // Sort by relevance (title matches first, then director, then cast)
    const sortedMatches = matches.sort((a, b) => {
      const aTitleMatch = a.title.toLowerCase().includes(lowerSearchTerm);
      const bTitleMatch = b.title.toLowerCase().includes(lowerSearchTerm);
      
      if (aTitleMatch && !bTitleMatch) return -1;
      if (!aTitleMatch && bTitleMatch) return 1;
      
      const aDirectorMatch = a.director && a.director.toLowerCase().includes(lowerSearchTerm);
      const bDirectorMatch = b.director && b.director.toLowerCase().includes(lowerSearchTerm);
      
      if (aDirectorMatch && !bDirectorMatch) return -1;
      if (!aDirectorMatch && bDirectorMatch) return 1;
      
      return 0;
    });

    // Limit to top 10 results
    setFilteredMovies(sortedMatches.slice(0, 10));
  }, [searchTerm, movies]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  if (filteredMovies.length === 0) {
    return null;
  }

  return (
    <div 
      ref={dropdownRef}
      className="absolute z-50 w-full bg-gray-900/95 rounded-md shadow-lg mt-1 max-h-80 overflow-y-auto"
    >
      <ul className="py-1">
        {filteredMovies.map((movie) => (
          <li 
            key={movie.showId}
            className="px-4 py-2 hover:bg-red-900/50 cursor-pointer flex items-center"
            onClick={() => onMovieSelect(movie)}
          >
            <div className="w-10 h-14 mr-3 bg-gray-800 rounded flex-shrink-0"></div>
            <div>
              <div className="text-white font-medium">{movie.title}</div>
              <div className="text-gray-400 text-sm">
                {movie.type} • {movie.releaseYear}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchDropdown; 