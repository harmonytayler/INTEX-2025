import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Movie } from '../types/Movie';
import { fetchMovies, fetchMoviesAZ, getAverageRating, getBulkAverageRatings } from '../api/MovieAPI';
import MovieRow from '../components/MovieRow';
import AuthorizeView from '../components/security/AuthorizeView';
import MovieCard from '../components/MovieCard';

// Define main genres for the rows
const MAIN_GENRES = [
  'Action',
  'Comedy',
  'Drama',
  'Thrillers',
  'Documentary',
  'Thriller',
  'Family',
  'Musicals'
];

// Map display genres to database field names
const GENRE_MAPPING: Record<string, string> = {
  'Action': 'action',
  'Comedy': 'comedies',
  'Drama': 'dramas',
  'Thrillers': 'thrillers',
  'Documentary': 'documentaries',
  'Thriller': 'thrillers',
  'Family': 'familyMovies',
  'Musicals': 'musicals'
};

// Helper function to calculate weighted rating using IMDb formula
const calculateWeightedRating = (averageRating: number, reviewCount: number, globalAverageRating: number): number => {
  // If there are no reviews, use a very low weight to push these movies to the end
  if (reviewCount === 0) return 0;
  // For movies with reviews, use their actual average rating
  return averageRating;
};

// Helper function to shuffle array (Fisher-Yates algorithm)
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Helper function to fetch ratings in batches
const fetchRatingsInBatches = async (movieIds: string[], batchSize: number = 20) => {
  const ratings: { [key: string]: { averageRating: number; reviewCount: number } } = {};
  
  for (let i = 0; i < movieIds.length; i += batchSize) {
    const batch = movieIds.slice(i, i + batchSize);
    const batchRatings = await getBulkAverageRatings(batch);
    Object.assign(ratings, batchRatings);
  }
  
  return ratings;
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
          
          // Fetch all ratings in batches
          const movieIds = allMovies.map(movie => movie.showId);
          const ratings = await fetchRatingsInBatches(movieIds);
          
          // Update the cache
          ratingsCache.current = { ...ratingsCache.current, ...ratings };

          // Calculate global average rating
          const globalAverageRating = Object.values(ratings).reduce(
            (sum, { averageRating }) => sum + averageRating, 
            0
          ) / Object.keys(ratings).length;

          // Calculate weighted ratings for all movies
          const moviesWithRatings = allMovies.map(movie => {
            const { averageRating, reviewCount } = ratings[movie.showId] || { averageRating: 0, reviewCount: 0 };
            const weightedRating = calculateWeightedRating(averageRating, reviewCount, globalAverageRating);
            return { movie, weightedRating, reviewCount };
          });

          // Sort movies by weighted rating and review count
          const sortedAllMovies = moviesWithRatings
            .sort((a, b) => {
              // First sort by review count (movies with reviews come first)
              if (a.reviewCount === 0 && b.reviewCount > 0) return 1;
              if (a.reviewCount > 0 && b.reviewCount === 0) return -1;
              // Then sort by weighted rating
              return b.weightedRating - a.weightedRating;
            })
            .map(item => item.movie);

          // Split movies into reviewed and unreviewed
          const reviewedMovies = sortedAllMovies.filter(movie => 
            ratings[movie.showId]?.reviewCount > 0
          );
          const unreviewedMovies = sortedAllMovies.filter(movie => 
            !ratings[movie.showId]?.reviewCount
          );

          // Shuffle unreviewed movies
          const shuffledUnreviewedMovies = shuffleArray(unreviewedMovies);

          // Combine reviewed and shuffled unreviewed movies
          const finalMovieList = [...reviewedMovies, ...shuffledUnreviewedMovies];

          setTopMovies(finalMovieList.slice(0, 10));

          // Categorize movies by genre and calculate weighted ratings
          const genreMovies: { [key: string]: { movie: Movie; weightedRating: number }[] } = {};

          // Initialize empty arrays for each genre
          MAIN_GENRES.forEach(genre => {
            genreMovies[genre] = [];
          });

          // Categorize each movie into appropriate genres and calculate weighted ratings
          moviesWithRatings.forEach(({ movie, weightedRating }) => {
            MAIN_GENRES.forEach(displayGenre => {
              const dbField = GENRE_MAPPING[displayGenre];
              if (dbField && movie[dbField as keyof Movie] === 1) {
                genreMovies[displayGenre].push({ movie, weightedRating });
              }
            });
          });

          // Sort movies within each genre by weighted rating
          const sortedMoviesByGenre: { [key: string]: Movie[] } = {};
          MAIN_GENRES.forEach(genre => {
            sortedMoviesByGenre[genre] = genreMovies[genre]
              .sort((a, b) => b.weightedRating - a.weightedRating)
              .map(item => item.movie);
          });

          setMoviesByGenre(sortedMoviesByGenre);
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
        // Fetch ratings for the batch in parallel
        const movieIds = response.movies.map(movie => movie.showId);
        const ratings = await fetchRatingsInBatches(movieIds);
        
        // Update the cache
        ratingsCache.current = { ...ratingsCache.current, ...ratings };

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
          // Fetch ratings for the new batch in parallel
          const movieIds = newMovies.map(movie => movie.showId);
          const ratings = await fetchRatingsInBatches(movieIds);
          
          // Update the cache
          ratingsCache.current = { ...ratingsCache.current, ...ratings };

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
