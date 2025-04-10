import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Movie } from '../types/Movie';
import {
  fetchMovies,
  fetchMoviesAZ,
  getAverageRating,
  getBulkAverageRatings,
  fetchMovieById,
  getWatchedMovies,
  getUserRating,
} from '../api/MovieAPI';
import { getMovieUserByEmail } from '../api/MovieUserAPI';
import MovieRow from '../components/MovieRow';
import AuthorizeView from '../components/security/AuthorizeView';
import MovieCard from '../components/MovieCard';
import UserRatedRecommendations from '../components/movieview/UserRatedRecommendations';
import { useAuth } from '../contexts/AuthContext';

// Define main genres for the rows
const MAIN_GENRES = [
  'Action',
  'Comedy',
  'Drama',
  'Thrillers',
  'Documentary',
  'Thriller',
  'Family',
  'Musicals',
];

// Map display genres to database field names
const GENRE_MAPPING: Record<string, string> = {
  Action: 'action',
  Comedy: 'comedies',
  Drama: 'dramas',
  Thrillers: 'thrillers',
  Documentary: 'documentaries',
  Thriller: 'thrillers',
  Family: 'familyMovies',
  Musicals: 'musicals',
};

// Helper function to calculate weighted rating using IMDb formula
const calculateWeightedRating = (
  averageRating: number,
  reviewCount: number,
  globalAverageRating: number
): number => {
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
const fetchRatingsInBatches = async (
  movieIds: string[],
  batchSize: number = 20
) => {
  const ratings: {
    [key: string]: { averageRating: number; reviewCount: number };
  } = {};

  for (let i = 0; i < movieIds.length; i += batchSize) {
    const batch = movieIds.slice(i, i + batchSize);
    const batchRatings = await getBulkAverageRatings(batch);
    Object.assign(ratings, batchRatings);
  }

  return ratings;
};

function HomePage() {
  const [moviesByGenre, setMoviesByGenre] = useState<{
    [key: string]: Movie[];
  }>({});
  const [allMoviesAZ, setAllMoviesAZ] = useState<Movie[]>([]);
  const [topMovies, setTopMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAZ, setLoadingAZ] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [bookmarkedMovies, setBookmarkedMovies] = useState<Movie[]>([]);
  const [watchedMovies, setWatchedMovies] = useState<Movie[]>([]);
  const [ratedMovies, setRatedMovies] = useState<Movie[]>([]);
  const [selectedRatedMovie, setSelectedRatedMovie] = useState<Movie | null>(null);
  const [movieUserId, setMovieUserId] = useState<number | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Cache for movie ratings to avoid duplicate API calls
  const ratingsCache = useRef<{
    [key: string]: { averageRating: number; reviewCount: number };
  }>({});

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
          const movieIds = allMovies.map((movie) => movie.showId);
          const ratings = await fetchRatingsInBatches(movieIds);

          // Update the cache
          ratingsCache.current = { ...ratingsCache.current, ...ratings };

          // Calculate global average rating
          const globalAverageRating =
            Object.values(ratings).reduce(
              (sum, { averageRating }) => sum + averageRating,
              0
            ) / Object.keys(ratings).length;

          // Calculate weighted ratings for all movies
          const moviesWithRatings = allMovies.map((movie) => {
            const { averageRating, reviewCount } = ratings[movie.showId] || {
              averageRating: 0,
              reviewCount: 0,
            };
            const weightedRating = calculateWeightedRating(
              averageRating,
              reviewCount,
              globalAverageRating
            );
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
            .map((item) => item.movie);

          // Split movies into reviewed and unreviewed
          const reviewedMovies = sortedAllMovies.filter(
            (movie) => ratings[movie.showId]?.reviewCount > 0
          );
          const unreviewedMovies = sortedAllMovies.filter(
            (movie) => !ratings[movie.showId]?.reviewCount
          );

          // Shuffle unreviewed movies
          const shuffledUnreviewedMovies = shuffleArray(unreviewedMovies);

          // Combine reviewed and shuffled unreviewed movies
          const finalMovieList = [
            ...reviewedMovies,
            ...shuffledUnreviewedMovies,
          ];

          setTopMovies(finalMovieList.slice(0, 10));

          // Categorize movies by genre and calculate weighted ratings
          const genreMovies: {
            [key: string]: { movie: Movie; weightedRating: number }[];
          } = {};

          // Initialize empty arrays for each genre
          MAIN_GENRES.forEach((genre) => {
            genreMovies[genre] = [];
          });

          // Categorize each movie into appropriate genres and calculate weighted ratings
          moviesWithRatings.forEach(({ movie, weightedRating }) => {
            MAIN_GENRES.forEach((displayGenre) => {
              const dbField = GENRE_MAPPING[displayGenre];
              if (dbField && movie[dbField as keyof Movie] === 1) {
                genreMovies[displayGenre].push({ movie, weightedRating });
              }
            });
          });

          // Sort movies within each genre by weighted rating
          const sortedMoviesByGenre: { [key: string]: Movie[] } = {};
          MAIN_GENRES.forEach((genre) => {
            sortedMoviesByGenre[genre] = genreMovies[genre]
              .sort((a, b) => b.weightedRating - a.weightedRating)
              .map((item) => item.movie);
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
        const movieIds = response.movies.map((movie) => movie.showId);
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
          const movieIds = newMovies.map((movie) => movie.showId);
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
      const bottom =
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 50;
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

  useEffect(() => {
    const loadBookmarkedMovies = async () => {
      try {
        const cookies = document.cookie.split(';');
        const bookmarkCookie = cookies.find((cookie) =>
          cookie.trim().startsWith('bookmarked_movies=')
        );

        if (bookmarkCookie) {
          const movieIds = JSON.parse(
            decodeURIComponent(bookmarkCookie.split('=')[1])
          );

          const movies = await Promise.all(
            movieIds.map(async (id: string) => {
              try {
                return await fetchMovieById(id);
              } catch (error) {
                console.error(`Error fetching movie ${id}:`, error);
                return null;
              }
            })
          );

          setBookmarkedMovies(
            movies.filter((movie): movie is Movie => movie !== null)
          );
        }
      } catch (error) {
        console.error('Error loading bookmarked movies:', error);
      }
    };

    const loadWatchedMovies = async () => {
      try {
        const watchedIds = getWatchedMovies();
        if (watchedIds.length > 0) {
          const movies = await Promise.all(
            watchedIds.map(async (id: string) => {
              try {
                return await fetchMovieById(id);
              } catch (error) {
                console.error(`Error fetching movie ${id}:`, error);
                return null;
              }
            })
          );

          setWatchedMovies(
            movies.filter((movie): movie is Movie => movie !== null)
          );
        }
      } catch (error) {
        console.error('Error loading watched movies:', error);
      }
    };

    loadBookmarkedMovies();
    loadWatchedMovies();
  }, []);

  // Get the user's movie user ID
  useEffect(() => {
    const loadMovieUserId = async () => {
      if (!user?.email) {
        console.log('No user email found');
        return;
      }
      
      try {
        console.log('Fetching movie user for email:', user.email);
        const movieUser = await getMovieUserByEmail(user.email);
        console.log('Movie user found:', movieUser);
        // Use the correct property from the movie user object
        if (movieUser && movieUser.userId) {
          console.log('Setting movie user ID:', movieUser.userId);
          setMovieUserId(movieUser.userId);
        } else {
          console.log('No valid movie user ID found in response');
        }
      } catch (err) {
        console.error('Error loading movie user ID:', err);
      }
    };

    loadMovieUserId();
  }, [user]);

  // Fetch user's rated movies
  useEffect(() => {
    const loadRatedMovies = async () => {
      if (!movieUserId) {
        console.log('No movie user ID found');
        return;
      }
      
      try {
        console.log('Fetching rated movies for user ID:', movieUserId);
        // Get all movies first
        const response = await fetchMovies(100, 1, [], '', []);
        if (response && Array.isArray(response.movies)) {
          const allMovies = response.movies;
          console.log('Total movies found:', allMovies.length);
          
          // Check each movie for user's rating
          const ratedMoviesPromises = allMovies.map(async (movie) => {
            try {
              const rating = await getUserRating(movie.showId, movieUserId);
              if (rating > 0) {
                console.log('Found rated movie:', movie.title, 'with rating:', rating);
                return movie;
              }
              return null;
            } catch (err) {
              console.error('Error getting rating for movie:', movie.title, err);
              return null;
            }
          });
          
          const ratedMoviesResults = await Promise.all(ratedMoviesPromises);
          const validRatedMovies = ratedMoviesResults.filter((movie): movie is Movie => movie !== null);
          
          console.log('Total rated movies found:', validRatedMovies.length);
          setRatedMovies(validRatedMovies);
          
          // Select a random rated movie for recommendations
          if (validRatedMovies.length > 0) {
            const randomIndex = Math.floor(Math.random() * validRatedMovies.length);
            const selectedMovie = validRatedMovies[randomIndex];
            console.log('Selected movie for recommendations:', selectedMovie.title, 'with ID:', selectedMovie.showId);
            setSelectedRatedMovie(selectedMovie);
          } else {
            console.log('No rated movies found to select from');
            setSelectedRatedMovie(null);
          }
        }
      } catch (err) {
        console.error('Error loading rated movies:', err);
        setSelectedRatedMovie(null);
      }
    };

    if (movieUserId) {
      loadRatedMovies();
    }
  }, [movieUserId]);

  return (
    <AuthorizeView>
      <div className="min-h-screen bg-black">
        {/* Main content */}
        <div className="px-4 md:px-8 pb-8 pt-2">
          {loading && (
            <div className="text-white text-center py-8">Loading movies...</div>
          )}

          {error && (
            <div className="text-red-500 text-center py-8">Error: {error}</div>
          )}

          {!loading && !error && (
            <div className="movie-rows-container space-y-12">
              {/* Top 10 Movies Section */}
              {watchedMovies.length > 0 && (
                <MovieRow
                  genre="Continue Watching"
                  movies={watchedMovies}
                  onMovieClick={handleMovieClick}
                />
              )}
              {bookmarkedMovies.length > 0 && (
                <MovieRow
                  genre="Your Bookmarks"
                  movies={bookmarkedMovies}
                  onMovieClick={handleMovieClick}
                />
              )}

              {/* Content-based recommendations based on a rated movie */}
              {selectedRatedMovie && (
                <div>
                  <UserRatedRecommendations 
                    showId={selectedRatedMovie.showId}
                    movieTitle={selectedRatedMovie.title}
                  />
                </div>
              )}

              {topMovies.length > 0 && (
                <MovieRow
                  genre="Trending Movies"
                  movies={topMovies}
                  onMovieClick={handleMovieClick}
                  isTopTen={true}
                />
              )}

              {MAIN_GENRES.map(
                (genre) =>
                  moviesByGenre[genre] &&
                  moviesByGenre[genre].length > 0 && (
                    <MovieRow
                      key={genre}
                      genre={genre}
                      movies={moviesByGenre[genre]}
                      onMovieClick={handleMovieClick}
                    />
                  )
              )}

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
                <div className="text-white text-center py-4">
                  Loading more movies...
                </div>
              )}
              {!hasMore && (
                <div className="text-white text-center py-4">
                  No more movies to load
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AuthorizeView>
  );
}

export default HomePage;
