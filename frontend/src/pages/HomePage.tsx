import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Movie } from '../types/Movie';
import { fetchMovies, fetchMoviesAZ, getAverageRatingsBatch } from '../api/MovieAPI';
import MovieRow from '../components/MovieRow';
import AuthorizeView from '../components/security/AuthorizeView';
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

// Helper function to calculate weighted rating using IMDb formula
const calculateWeightedRating = (averageRating: number, reviewCount: number, globalAverageRating: number, minReviews: number = 3): number => {
  return (reviewCount / (reviewCount + minReviews)) * averageRating + (minReviews / (reviewCount + minReviews)) * globalAverageRating;
};

function HomePage() {
  const [moviesByGenre, setMoviesByGenre] = useState<{ [key: string]: Movie[] }>({});
  const [allMoviesAZ, setAllMoviesAZ] = useState<Movie[]>([]);
  const [topMovies, setTopMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAZ, setLoadingAZ] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  // Cache for movie ratings to avoid duplicate API calls
  const ratingsCache = useRef<{ [key: string]: { averageRating: number; reviewCount: number } }>({});

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

          // Initialize genre movies object
          const genreMovies: { [key: string]: { movie: Movie; weightedRating: number }[] } = {};
          MAIN_GENRES.forEach(genre => {
            genreMovies[genre] = [];
          });

          // Get all showIds for batch rating request
          const showIds = allMovies.map(movie => movie.showId);
          
          // Fetch all ratings in one batch request
          const ratings = await getAverageRatingsBatch(showIds);
          
          // Process movies in batches to avoid overwhelming the browser
          const BATCH_SIZE = 20;
          for (let i = 0; i < allMovies.length; i += BATCH_SIZE) {
            const batch = allMovies.slice(i, i + BATCH_SIZE);
            
            // Process each movie in the batch
            const processedBatch = batch.map(movie => {
              const { averageRating = 0, reviewCount = 0 } = ratings[movie.showId] || {};
              return { movie, averageRating, reviewCount };
            });

            // Calculate global average rating for this batch
            const batchAverageRating = processedBatch.reduce((sum, { averageRating }) => sum + averageRating, 0) / processedBatch.length;

            // Process each movie in the batch
            processedBatch.forEach(({ movie, averageRating, reviewCount }) => {
              const weightedRating = calculateWeightedRating(averageRating, reviewCount, batchAverageRating);
              
              // Categorize movie into appropriate genres
              MAIN_GENRES.forEach(displayGenre => {
                const dbField = GENRE_MAPPING[displayGenre];
                if (dbField && movie[dbField as keyof Movie] === 1) {
                  genreMovies[displayGenre].push({ movie, weightedRating });
                }
              });
            });
          }

          // Sort movies within each genre by weighted rating and take top 10
          const sortedMoviesByGenre: { [key: string]: Movie[] } = {};
          MAIN_GENRES.forEach(genre => {
            sortedMoviesByGenre[genre] = genreMovies[genre]
              .sort((a, b) => b.weightedRating - a.weightedRating)
              .slice(0, 10)
              .map(item => item.movie);
          });

          setMoviesByGenre(sortedMoviesByGenre);

          // Get top 10 movies across all genres
          const allMoviesWithRatings = Object.values(genreMovies).flat();
          const topMovies = allMoviesWithRatings
            .sort((a, b) => b.weightedRating - a.weightedRating)
            .slice(0, 10)
            .map(item => item.movie);
          
          setTopMovies(topMovies);
        } else {
          console.warn('Unexpected data format:', response);
          setMoviesByGenre({});
        }
      } catch (error) {
        console.error('Error loading movies by genre:', error);
        setError((error as Error).message);
      } finally {
        setLoading(false);
        // Start loading A-Z movies after genre movies are loaded
        loadAllMoviesAZ();
      }
    };

    loadMoviesByGenre();
  }, []);

  // Fetch movies A-Z (All Movies A-Z)
  const loadAllMoviesAZ = async () => {
    try {
      setLoadingAZ(true);
      setError(null);

      // Fetch the first page of movies A-Z
      const response = await fetchMoviesAZ(100, 1);
      if (response && Array.isArray(response.movies)) {
        const showIds = response.movies.map(movie => movie.showId);
        
        // Fetch all ratings in one batch request
        const ratings = await getAverageRatingsBatch(showIds);
        
        // Cache the ratings
        Object.entries(ratings).forEach(([showId, rating]) => {
          ratingsCache.current[showId] = rating;
        });

        setAllMoviesAZ(response.movies);
        setCurrentPage(1);
      } else {
        console.warn('Unexpected data format:', response);
      }
    } catch (error) {
      console.error('Error loading A-Z movies:', error);
      setError((error as Error).message);
    } finally {
      setLoadingAZ(false);
    }
  };

  // Load more movies A-Z when the user scrolls near the bottom
  const loadMoreMoviesAZ = useCallback(async () => {
    if (loadingMore || loadingAZ) {
      return;
    }
  
    setLoadingMore(true);
  
    try {
      const nextPage = currentPage + 1;
      const response = await fetchMoviesAZ(100, nextPage);
  
      if (response && Array.isArray(response.movies)) {
        const newMovies = response.movies;
  
        if (newMovies.length > 0) {
          const showIds = newMovies.map(movie => movie.showId);
          
          // Fetch all ratings in one batch request
          const ratings = await getAverageRatingsBatch(showIds);
          
          // Cache the ratings
          Object.entries(ratings).forEach(([showId, rating]) => {
            ratingsCache.current[showId] = rating;
          });

          setAllMoviesAZ((prevMovies) => [...prevMovies, ...newMovies]);
          setCurrentPage(nextPage);
  
          if (newMovies.length < 100) {
            setHasMore(false);
          }
        } else {
          setHasMore(false);
        }
      } else {
        console.warn('Error: No movies returned for next page');
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more A-Z movies:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [currentPage, loadingMore, loadingAZ, hasMore]);
  
  
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
      <div className="min-h-screen bg-black">
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
              {/* Top 10 Movies Section */}
              {topMovies.length > 0 && (
                <MovieRow
                  genre="Top 10 Trending Movies"
                  movies={topMovies}
                  onMovieClick={handleMovieClick}
                  isTopTen={true}
                />
              )}

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
