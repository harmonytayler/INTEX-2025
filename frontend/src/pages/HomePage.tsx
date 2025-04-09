import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Movie } from '../types/Movie';
import { fetchMovies, fetchMoviesAZ } from '../api/MovieAPI';
import MovieRow from '../components/MovieRow';
import Logout from '../components/security/Logout';
import AuthorizeView, { AuthorizedUser } from '../components/security/AuthorizeView';
import MovieCard from '../components/MovieCard';

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
  const [allMoviesAZ, setAllMoviesAZ] = useState<Movie[]>([]); // State for A-Z sorted movies
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true); // To track if there's more to load in A-Z section
  const [loadingMore, setLoadingMore] = useState(false); // To prevent multiple load triggers in A-Z section
  const [currentPage, setCurrentPage] = useState(1); // Track the current page in A-Z section
  const navigate = useNavigate();

  // Fetch movies by genre
  useEffect(() => {
    const loadMoviesByGenre = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch first page of all movies (page 1) for genre categorization
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
          console.warn('Unexpected data format:', response);
          setMoviesByGenre({});
        }
      } catch (error) {
        console.error('Error loading movies by genre:', error);
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    loadMoviesByGenre();
  }, []);

  // Fetch movies A-Z (All Movies A-Z)
  useEffect(() => {
    const loadAllMoviesAZ = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch the first page of movies A-Z
        const response = await fetchMoviesAZ(100, 1);
        if (response && Array.isArray(response.movies)) {
          setAllMoviesAZ(response.movies);
          setCurrentPage(1);
        } else {
          console.warn('Unexpected data format:', response);
        }
      } catch (error) {
        console.error('Error loading A-Z movies:', error);
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    loadAllMoviesAZ();
  }, []);

  // Load more movies A-Z when the user scrolls near the bottom
  const loadMoreMoviesAZ = useCallback(async () => {
    if (loadingMore) {
      return;
    }
  
    setLoadingMore(true);
  
    try {
      // Fetch more movies A-Z by adding offset (use currentPage to determine next page)
      const nextPage = currentPage + 1;
      const response = await fetchMoviesAZ(100, nextPage);
  
      console.log("API response for page " + nextPage, response);
        // Log the response
  
      if (response && Array.isArray(response.movies)) {
        const newMovies = response.movies;
  
        if (newMovies.length > 0) {
          // Append new movies to the existing list
          setAllMoviesAZ((prevMovies) => [...prevMovies, ...newMovies]);
  
          // Only increment the page if new movies are loaded
          setCurrentPage(nextPage);
  
          // If fewer than 100 movies were returned, there are no more pages
          if (newMovies.length < 100) {
            setHasMore(false); // No more movies to load
          }
        } else {
          // In case no movies are returned, ensure hasMore is set to false
          setHasMore(false);
        }
      } else {
        console.warn('Error: No movies returned for next page');
        setHasMore(false); // If no valid data is returned, set hasMore to false
      }
    } catch (error) {
      console.error('Error loading more A-Z movies:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [currentPage, loadingMore, hasMore]);
  
  
  // Scroll event listener for infinite scroll (A-Z)
  useEffect(() => {
    const handleScroll = () => {
      const bottom = window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 50;
      if (bottom && hasMore) {
        loadMoreMoviesAZ();
      }
    };
  
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [loadMoreMoviesAZ, hasMore]); // Ensure the listener depends on both loadMoreMoviesAZ and hasMore
  

  const handleMovieClick = (movie: Movie) => {
    navigate(`/movie/${movie.showId}`);
  };

  return (
    <AuthorizeView>
      <div className="min-h-screen">
        {/* Main content */}
        <div className="px-4 md:px-8 pb-8 pt-2">
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

              {/* Divider before All Movies A-Z */}
              <div className="border-t border-white/20 my-8"></div>

              {/* All Movies A-Z */}
              <h2 className="movie-row-header">All Movies A-Z</h2>
              <div className="movie-list-container">
                {allMoviesAZ.map((movie) => (
                  <MovieCard
                    key={movie.showId}
                    movie={movie}
                    onClick={() => handleMovieClick(movie)}
                  />
                ))}
              </div>

              {/* Loading more movies */}
              {loadingMore && (
                <div className="text-white text-center py-4">Loading more movies...</div>
              )}
              {!hasMore && (
                <div className="text-white text-center py-4">No more movies to load</div>
              )}
            </div>
          )}
        </div>
      </div>
    </AuthorizeView>
  );
}

export default HomePage;
