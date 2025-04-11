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
  const [tempSelectedGenres, setTempSelectedGenres] = useState<string[]>([]);
  const [isGenreFilterOpen, setIsGenreFilterOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

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


  const handleGenreFilter = () => {
    setTempSelectedGenres(selectedGenres);
    setIsGenreFilterOpen(true);
  };

  const handleGenreSelect = (genre: string) => {
    setTempSelectedGenres((prev) => {
      const newGenres = prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre];
      return newGenres;
    });
  };

  const clearGenres = () => {
    setTempSelectedGenres([]);
  };

  const applyGenreFilters = () => {
    setSelectedGenres(tempSelectedGenres);
    setIsGenreFilterOpen(false);
    fetchSearchResults(searchQuery, tempSelectedGenres);
  };

  const cancelGenreFilters = () => {
    setTempSelectedGenres(selectedGenres);
    setIsGenreFilterOpen(false);
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
                <SearchBar onSearch={handleSearch} />
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
          <h1 className="text-xl font-semibold text-white mb-6">
            Search Results for "{searchQuery}"
          </h1>
          {/* Genre Filter */}
          <div className="w-full md:w-1/3">
            <button
              onClick={handleGenreFilter}
              className="w-full px-4 py-3 bg-gray-900/50 text-white rounded-lg border border-gray-700 hover:border-cineniche-orange transition-all duration-200"
            >
              Change Filter
            </button>
          </div>
        </div>

        {/* Search Results */}
        <div className="mt-8">
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

      {/* Genre Filter Modal */}
      {isGenreFilterOpen && (
        <div className="modal-overlay">
          <div className="modal-content genre-filter-modal">
            <div className="modal-header">
              <h2>Filter by Genres</h2>
              <button
                className="close-button"
                onClick={cancelGenreFilters}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="genre-grid">
                {AVAILABLE_GENRES.map((genre) => (
                  <label key={genre} className="genre-checkbox">
                    <input
                      type="checkbox"
                      checked={tempSelectedGenres.includes(genre)}
                      onChange={() => handleGenreSelect(genre)}
                    />
                    {genre}
                  </label>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="modal-button clear-button"
                onClick={clearGenres}
                disabled={tempSelectedGenres.length === 0}
              >
                Clear Filters
              </button>
              <button
                className="modal-button apply-button"
                onClick={applyGenreFilters}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage; 