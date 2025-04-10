import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Movie } from '../types/Movie';
import { fetchMovies } from '../api/MovieAPI';

const SearchResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get('q');
    
    if (query) {
      setSearchQuery(query);
      fetchSearchResults(query);
    } else {
      setLoading(false);
    }
  }, [location.search]);

  const fetchSearchResults = async (query: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchMovies(100, 1, [], query, []);
      if (response && Array.isArray(response.movies)) {
        // Filter out movies without poster URLs and log the results
        const moviesWithPosters = await Promise.all(
          response.movies.map(async (movie) => {
            if (!movie.posterUrl || 
                movie.posterUrl.trim() === '' || 
                movie.posterUrl === 'null' || 
                movie.posterUrl === 'undefined' ||
                movie.posterUrl.includes('placeholder')) {
              console.log('Filtered out movie with invalid poster URL:', {
                title: movie.title,
                posterUrl: movie.posterUrl
              });
              return null;
            }

            try {
              // Create a new image to test if it loads
              const img = new Image();
              await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = movie.posterUrl as string;
              });
              
              console.log('Movie with valid poster:', {
                title: movie.title,
                posterUrl: movie.posterUrl
              });
              return movie;
            } catch (err) {
              console.log('Filtered out movie with non-existent poster:', {
                title: movie.title,
                posterUrl: movie.posterUrl
              });
              return null;
            }
          })
        );

        const validMovies = moviesWithPosters.filter((movie): movie is Movie => movie !== null);
        
        console.log('Total movies:', response.movies.length);
        console.log('Movies with valid posters:', validMovies.length);
        console.log('Filtered movies:', validMovies);
        
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
                              src={movie.posterUrl ?? undefined}
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