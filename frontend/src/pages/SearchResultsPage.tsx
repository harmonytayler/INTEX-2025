import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Movie } from '../types/Movie';
import { fetchMovies } from '../api/MovieAPI';
import SearchDropdown from '../components/SearchDropdown';
import MovieRow from '../components/MovieRow';
import SearchBar from '../components/SearchBar';
import '../style/header.css';
import '../style/MovieDetails.css';

// Define genre mapping between display names and actual property names
const GENRE_MAPPING: { [key: string]: keyof Movie } = {
  'Action': 'action',
  'Adventure': 'adventure',
  'Anime Series': 'animeSeriesInternationalTVShows',
  'British TV Shows': 'britishTVShowsDocuseriesInternationalTVShows',
  'Children': 'children',
  'Comedies': 'comedies',
  'Comedies & Dramas': 'comediesDramasInternationalMovies',
  'International Comedies': 'comediesInternationalMovies',
  'Romantic Comedies': 'comediesRomanticMovies',
  'Crime TV Shows': 'crimeTVShowsDocuseries',
  'Documentaries': 'documentaries',
  'International Documentaries': 'documentariesInternationalMovies',
  'Docuseries': 'docuseries',
  'Dramas': 'dramas',
  'International Dramas': 'dramasInternationalMovies',
  'Romantic Dramas': 'dramasRomanticMovies',
  'Family Movies': 'familyMovies',
  'Fantasy': 'fantasy',
  'Horror Movies': 'horrorMovies',
  'International Thrillers': 'internationalMoviesThrillers',
  'International TV Shows': 'internationalTVShowsRomanticTVShowsTVDramas',
  'Kids TV': 'kidsTV',
  'Language TV Shows': 'languageTVShows',
  'Musicals': 'musicals',
  'Nature TV': 'natureTV',
  'Reality TV': 'realityTV',
  'Spirituality': 'spirituality',
  'TV Action': 'tVAction',
  'TV Comedies': 'tVComedies',
  'TV Dramas': 'tVDramas',
  'Talk Shows': 'talkShowsTVComedies',
  'Thrillers': 'thrillers'
};

const AVAILABLE_GENRES = Object.keys(GENRE_MAPPING);

const SearchResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [isGenreFilterOpen, setIsGenreFilterOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get('q');
    
    if (query) {
      setSearchQuery(query);
      fetchSearchResults(query, selectedGenres);
    } else {
      setLoading(false);
    }
  }, [location.search, selectedGenres]);

  const fetchSearchResults = async (query: string, displayGenres: string[]) => {
    setLoading(true);
    setError(null);
    
    try {
      // Convert display genres to actual genre property names
      const actualGenres = displayGenres.map(genre => GENRE_MAPPING[genre]);
      const response = await fetchMovies(100, 1, actualGenres, query, []);
      
      if (response && Array.isArray(response.movies)) {
        // Filter movies based on selected genres
        const filteredMovies = response.movies.filter(movie => {
          if (actualGenres.length === 0) return true;
          
          // Check if movie has any of the selected genres
          return actualGenres.some(genre => movie[genre] === 1);
        });

        // Filter out movies without poster URLs
        const moviesWithPosters = await Promise.all(
          filteredMovies.map(async (movie) => {
            if (!movie.posterUrl || 
                movie.posterUrl.trim() === '' || 
                movie.posterUrl === 'null' || 
                movie.posterUrl === 'undefined' ||
                movie.posterUrl.includes('placeholder')) {
              return null;
            }

            try {
              const img = new Image();
              await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = movie.posterUrl as string;
              });
              return movie;
            } catch (err) {
              return null;
            }
          })
        );

        const validMovies = moviesWithPosters.filter((movie): movie is Movie => movie !== null);
        setMovies(validMovies);
      } else {
        setMovies([]);
      }
    } catch (err) {
      console.error('Error fetching search results:', err);
      setError('Failed to load search results. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleMovieClick = (movie: Movie) => {
    navigate(`/movie/${movie.showId}`);
  };

  const handleBackClick = () => {
    navigate('/home');
  };

  const handleGenreSelect = (genre: string) => {
    setSelectedGenres((prev) => {
      const newGenres = prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre];
      return newGenres;
    });
  };

  const clearGenres = () => {
    setSelectedGenres([]);
  };

  const handleSearch = async (query: string) => {
    if (query.trim() === '') {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    try {
      const response = await fetchMovies(10, 1, [], query, []);
      if (response && Array.isArray(response.movies)) {
        const validMovies = await Promise.all(
          response.movies.map(async (movie) => {
            if (
              !movie.posterUrl ||
              movie.posterUrl.trim() === '' ||
              movie.posterUrl === 'null' ||
              movie.posterUrl === 'undefined' ||
              movie.posterUrl.includes('placeholder')
            ) {
              return null;
            }

            try {
              const img = new Image();
              await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = movie.posterUrl as string;
              });
              return movie;
            } catch (err) {
              return null;
            }
          })
        );

        const filteredMovies = validMovies.filter(
          (movie): movie is Movie => movie !== null
        );
        setSearchResults(filteredMovies);
        setShowDropdown(filteredMovies.length > 0);
      }
    } catch (err) {
      console.error('Error fetching search results:', err);
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(query);
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowDropdown(false);
    }
  };

  // Handle click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <div className="back-button-container">
        <button className="back-button" onClick={() => window.history.back()}>
          <span>&larr;</span>
        </button>
      </div>

      <div className="container mx-auto px-4 pt-24 pb-8">
        {/* Search and Filter Section */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
          {/* Search Bar */}
          <div className="w-full md:w-2/3">
            <div className="search-page-container">
              <div className="search-container" ref={searchContainerRef}>
                <SearchBar />
                {showDropdown && searchResults.length > 0 && (
                  <SearchDropdown
                    results={searchResults}
                    onClose={() => {
                      setShowDropdown(false);
                      setSearchQuery('');
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Genre Filter */}
          <div className="w-full md:w-1/3">
            <div className="relative">
              <button
                onClick={() => setIsGenreFilterOpen(!isGenreFilterOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-900/50 text-white rounded-lg border border-gray-700 hover:border-cineniche-orange transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <span className="text-gray-300">
                    {selectedGenres.length > 0 
                      ? `${selectedGenres.length} Genre${selectedGenres.length > 1 ? 's' : ''} Selected`
                      : 'Filter by Genre'}
                  </span>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 transform transition-transform duration-200 ${isGenreFilterOpen ? 'rotate-180' : ''} text-gray-400`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {isGenreFilterOpen && (
                <div className="absolute z-10 w-full mt-2 p-4 bg-gray-900/95 rounded-lg border border-gray-700 shadow-lg backdrop-blur-sm max-h-96 overflow-y-auto">
                  <div className="space-y-2">
                    {AVAILABLE_GENRES.map((genre) => (
                      <label
                        key={genre}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-800/50 transition-colors duration-200 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedGenres.includes(genre)}
                          onChange={() => handleGenreSelect(genre)}
                          className="form-checkbox h-4 w-4 text-cineniche-orange border-gray-600 rounded focus:ring-cineniche-orange"
                        />
                        <span className="text-gray-300">{genre}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {selectedGenres.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedGenres.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 bg-cineniche-orange/90 text-white text-sm rounded-full flex items-center gap-2 hover:bg-cineniche-orange transition-colors duration-200"
                  >
                    {genre}
                    <button
                      onClick={() => handleGenreSelect(genre)}
                      className="text-white hover:text-gray-200 transition-colors duration-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search Results */}
        <div className="mt-8">
          <h1 className="text-xl font-semibold text-white mb-6">
            Search Results for "{searchQuery}"
          </h1>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-xl text-white">Loading search results...</div>
            </div>
          ) : error ? (
            <div className="bg-red-900/50 text-white p-4 rounded-lg">
              {error}
            </div>
          ) : movies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-400">No movies found matching your search.</p>
              <p className="text-gray-500 mt-2">Try different keywords or browse our collection.</p>
            </div>
          ) : (
            <MovieRow
              genre="Search Results"
              movies={movies}
              onMovieClick={handleMovieClick}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage; 