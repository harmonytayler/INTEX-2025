import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Movie } from '../types/Movie';
import { fetchMovies } from '../api/MovieAPI';
import MovieRow from '../components/MovieRow';
import Logout from '../components/security/Logout';
import AuthorizeView, { AuthorizedUser } from '../components/security/AuthorizeView';

// Define main genres for the rows
const MAIN_GENRES = [
  'Action',
  'Comedy',
  'Drama',
  'Horror',
  'Documentary',
  'Thriller',
  'Family',
  'Romance'
];

// Map display genres to database field names
const GENRE_MAPPING: Record<string, string> = {
  'Action': 'action',
  'Comedy': 'comedies',
  'Drama': 'dramas',
  'Horror': 'horrorMovies',
  'Documentary': 'documentaries',
  'Thriller': 'thrillers',
  'Family': 'familyMovies',
  'Romance': 'comediesRomanticMovies'
};

function HomePage() {
  const [moviesByGenre, setMoviesByGenre] = useState<{ [key: string]: Movie[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadMoviesByGenre = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all movies first
        const response = await fetchMovies(100, 1, [], '', []);
        
        if (response && Array.isArray(response.movies)) {
          const allMovies = response.movies;
          
          // Categorize movies by genre
          const genreMovies: { [key: string]: Movie[] } = {};
          
          // Initialize empty arrays for each genre
          MAIN_GENRES.forEach(genre => {
            genreMovies[genre] = [];
          });
          
          // Categorize each movie into appropriate genres
          allMovies.forEach(movie => {
            MAIN_GENRES.forEach(displayGenre => {
              const dbField = GENRE_MAPPING[displayGenre];
              if (dbField && movie[dbField as keyof Movie] === 1) {
                genreMovies[displayGenre].push(movie);
              }
            });
          });
          
          setMoviesByGenre(genreMovies);
        } else {
          console.warn("Unexpected data format:", response);
          setMoviesByGenre({});
        }
      } catch (error) {
        console.error('Error loading movies:', error);
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    loadMoviesByGenre();
  }, []);

  const handleMovieClick = (movie: Movie) => {
    navigate(`/movie/${movie.showId}`);
  };

  return (
    <AuthorizeView>
      <div className="min-h-screen bg-black">
        {/* Main content */}
        <div className="px-4 md:px-8 pb-8">
          {loading && (
            <div className="text-white text-center py-8">Loading movies...</div>
          )}

          {error && (
            <div className="text-red-500 text-center py-8">
              Error: {error}
            </div>
          )}

          {!loading && !error && (
            <div className="movie-rows-container space-y-12">
              {MAIN_GENRES.map((genre) => (
                moviesByGenre[genre] && moviesByGenre[genre].length > 0 && (
                  <MovieRow
                    key={genre}
                    genre={genre}
                    movies={moviesByGenre[genre]}
                    onMovieClick={handleMovieClick}
                  />
                )
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthorizeView>
  );
}

export default HomePage;
