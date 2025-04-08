import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieRow from '../components/MovieRow';
import SearchDropdown from '../components/SearchDropdown';
import { Movie } from '../types/Movie';
import { fetchMovies } from '../api/MovieAPI';
import Logout from '../components/security/Logout';
import AuthorizeView, { AuthorizedUser } from '../components/security/AuthorizeView';

// Define the main genres we want to display
const MAIN_GENRES = [
  'Action',
  'Comedy',
  'Drama',
  'Horror',
  'Romance',
  'Sci-Fi',
  'Thriller',
  'Documentary',
  'Animation',
  'Family'
];

// Map display genres to database field names
const GENRE_MAPPING: Record<string, keyof Movie> = {
  'Action': 'action',
  'Comedy': 'comedies',
  'Drama': 'dramas',
  'Horror': 'horrorMovies',
  'Romance': 'comediesRomanticMovies',
  'Sci-Fi': 'fantasy', // Using fantasy as a proxy for Sci-Fi
  'Thriller': 'thrillers',
  'Documentary': 'documentaries',
  'Animation': 'animeSeriesInternationalTVShows', // Using anime as a proxy for Animation
  'Family': 'familyMovies'
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  useEffect(() => {
    const loadMovies = async () => {
      try {
        setLoading(true);
        // Fetch all movies with a large page size to get everything at once
        const response = await fetchMovies(100, 1, [], '', []);
        setMovies(response.movies);
        setError(null);
      } catch (err) {
        setError('Failed to load movies. Please try again later.');
        console.error('Error loading movies:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, []);

  // Categorize movies by genre
  const moviesByGenre = MAIN_GENRES.reduce((acc, genre) => {
    const dbField = GENRE_MAPPING[genre];
    if (!dbField) return acc;

    const genreMovies = movies.filter(movie => movie[dbField] === 1);
    if (genreMovies.length > 0) {
      acc[genre] = genreMovies;
    }
    return acc;
  }, {} as Record<string, Movie[]>);

  const handleMovieClick = (movie: Movie) => {
    navigate(`/movie/${movie.showId}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowSearchDropdown(true);
  };

  const handleSearchMovieSelect = (movie: Movie) => {
    handleMovieClick(movie);
    setSearchTerm('');
    setShowSearchDropdown(false);
  };

  const handleSearchClose = () => {
    setShowSearchDropdown(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-600 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <AuthorizeView>
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Movie Streaming</h1>
          
          {/* Search Bar */}
          <div className="relative mb-8">
            <input
              type="text"
              placeholder="Search for movies, directors, or actors..."
              className="w-full p-3 bg-gray-800 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-600"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            
            {/* Search Dropdown */}
            {showSearchDropdown && (
              <SearchDropdown
                searchTerm={searchTerm}
                movies={movies}
                onMovieSelect={handleSearchMovieSelect}
                onClose={handleSearchClose}
              />
            )}
          </div>
          
          {/* Movie Rows */}
          {Object.entries(moviesByGenre).map(([genre, genreMovies]) => (
            <MovieRow
              key={genre}
              genre={genre}
              movies={genreMovies}
              onMovieClick={handleMovieClick}
            />
          ))}
        </div>
      </div>
    </AuthorizeView>
  );
};

export default HomePage;
