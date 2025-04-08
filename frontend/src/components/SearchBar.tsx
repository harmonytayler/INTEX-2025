import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Movie } from '../types/Movie';
import { fetchMovies } from '../api/MovieAPI';
import '../style/movies.css';

interface SearchBarProps {
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder = "Search movies..." }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length >= 2) {
        fetchSuggestions();
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchSuggestions = async () => {
    try {
      setIsLoading(true);
      // Fetch more movies to ensure we have a good selection
      const response = await fetchMovies(1000, 1, [], searchTerm, []);
      
      // Log the movie IDs for debugging
      console.log("Search results:", response.movies.map(m => ({ id: m.showId, title: m.title })));
      
      setSuggestions(response.movies);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSuggestionClick = (movie: Movie) => {
    console.log("Selected movie:", { id: movie.showId, title: movie.title });
    setSearchTerm('');
    setShowSuggestions(false);
    navigate(`/movie/${movie.showId}`);
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          className="w-full p-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
        />
        {isLoading && (
          <div className="absolute right-3 top-2">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-red-600"></div>
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 rounded-lg shadow-lg max-h-60 overflow-y-auto search-dropdown">
          {suggestions.map((movie) => (
            <div
              key={movie.showId}
              className="p-2 hover:bg-gray-700 cursor-pointer text-white search-suggestion-item"
              onClick={() => handleSuggestionClick(movie)}
            >
              <div className="flex items-center">
                <div className="w-10 h-14 mr-3 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                  <div className="w-full h-full flex items-center justify-center bg-gray-600 text-gray-400 text-xs">
                    {movie.type}
                  </div>
                </div>
                <div>
                  <div className="font-medium">{movie.title}</div>
                  <div className="text-sm text-gray-400">{movie.releaseYear}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar; 