import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Movie } from '../types/Movie';
import { fetchMovies } from '../api/MovieAPI';

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

  const handleMovieClick = (showId: string) => {
    navigate(`/movie/${showId}`);
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

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="container mx-auto px-4 py-8 flex flex-col items-center">
        <div className="flex items-center mb-8 w-full max-w-4xl">
          <button
            onClick={handleBackClick}
            className="flex items-center text-green-700 hover:text-green-500 transition-colors mr-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Home
          </button>
          <h1 className="text-2xl font-bold">
            Search Results for "{searchQuery}"
          </h1>
        </div>

        {/* Genre Filter */}
        <div className="mb-6 w-full max-w-4xl">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsGenreFilterOpen(!isGenreFilterOpen)}
              className="flex items-center text-green-700 hover:text-green-500 transition-colors"
            >
              <span className="mr-2">Filter by Genre</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 transform transition-transform ${isGenreFilterOpen ? 'rotate-180' : ''}`}
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
            {selectedGenres.length > 0 && (
              <button
                onClick={clearGenres}
                className="text-sm text-gray-400 hover:text-gray-300"
              >
                Clear Filters
              </button>
            )}
          </div>

          {isGenreFilterOpen && (
            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {AVAILABLE_GENRES.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => handleGenreSelect(genre)}
                    className={`px-3 py-2 rounded text-sm ${
                      selectedGenres.includes(genre)
                        ? 'bg-green-700 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedGenres.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedGenres.map((genre) => (
                <span
                  key={genre}
                  className="px-2 py-1 bg-green-700 text-white text-sm rounded-full flex items-center"
                >
                  {genre}
                  <button
                    onClick={() => handleGenreSelect(genre)}
                    className="ml-2 text-white hover:text-gray-300"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-xl">Loading search results...</div>
          </div>
        ) : error ? (
          <div className="bg-red-900/50 text-white p-4 rounded-lg mb-6 w-full max-w-4xl">
            {error}
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-12 w-full max-w-4xl">
            <p className="text-xl text-gray-400">No movies found matching your search.</p>
            <p className="text-gray-500 mt-2">Try different keywords or browse our collection.</p>
          </div>
        ) : (
          <div className="w-full max-w-4xl">
            <div className="overflow-x-auto" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <table className="w-full divide-y divide-gray-700" style={{ maxWidth: '896px' }}>
                <thead className="bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Poster
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Year
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Rating
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-700">
                  {movies.map((movie) => (
                    <tr 
                      key={movie.showId}
                      className="hover:bg-gray-800 cursor-pointer transition-colors"
                      onClick={() => handleMovieClick(movie.showId)}
                    >
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="flex justify-center">
                          <div style={{ width: '48px', height: '72px' }}>
                            <img
                              src={movie.posterUrl || ''}
                              alt={movie.title}
                              style={{ width: '48px', height: '72px', objectFit: 'contain' }}
                              className="rounded"
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-medium text-white">{movie.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-300">{movie.releaseYear}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center">
                          <span className="text-yellow-500 mr-1">★</span>
                          <span className="text-sm text-gray-300">{movie.rating || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-300">{movie.type}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage; 