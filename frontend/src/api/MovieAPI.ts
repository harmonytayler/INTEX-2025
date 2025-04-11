import { Movie as Movie } from '../types/Movie';

interface FetchMoviesResponse {
  movies: Movie[];
  totalNumMovies: number;
}

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://intex-backend.azurewebsites.net';
const API_URL = `${baseUrl}/Movie`;

export const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
};

export const fetchMovies = async (
  limit: number = 10,
  page: number = 1,
  genres: string[] = [],
  searchTerm: string = '',
  filters: string[] = []
): Promise<{ movies: Movie[]; total: number }> => {
  try {
    const categoryParams = genres
      .map((genre) => `movieTypes=${encodeURIComponent(genre)}`)
      .join('&');

    const searchParam = searchTerm
      ? `&searchTerm=${encodeURIComponent(searchTerm)}`
      : '';

    const filterParams =
      filters.length > 0
        ? `&filters=${filters.map((filter) => encodeURIComponent(filter)).join(',')}`
        : '';

    const url = `${API_URL}/AllMovies?pageSize=${limit}&pageNum=${page}${
      genres.length ? `&${categoryParams}` : ''
    }${searchParam}${filterParams}`;

    const response = await fetch(url, { credentials: 'include' });
    if (!response.ok) {
      throw new Error('Failed to fetch movies');
    }

    const data = await response.json();
    const movies: Movie[] = Array.isArray(data.movies) ? data.movies : data;

    // Get all movie IDs for batch processing
    const movieIds = movies.map((movie) => movie.showId);

    // Fetch all ratings in bulk
    const ratings = await getBulkAverageRatings(movieIds);

    // Fetch all poster URLs in parallel
    const posterPromises = movieIds.map(async (showId) => {
      try {
        const posterRes = await fetch(`${API_URL}/PosterUrl/${showId}`, {
          credentials: 'include',
        });
        if (posterRes.ok) {
          return { showId, posterUrl: await posterRes.text() };
        }
        return { showId, posterUrl: null };
      } catch (err) {
        return { showId, posterUrl: null };
      }
    });

    const posterResults = await Promise.all(posterPromises);
    const posterUrls = Object.fromEntries(
      posterResults.map((result) => [result.showId, result.posterUrl])
    );

    // Enrich movies with ratings and poster URLs
    const enrichedMovies = movies.map((movie) => ({
      ...movie,
      averageStarRating: ratings[movie.showId]?.averageRating || 0,
      posterUrl: posterUrls[movie.showId] || null,
    }));

    return {
      movies: enrichedMovies,
      total: data.totalNumMovies || enrichedMovies.length,
    };
  } catch (error) {
    console.error('Error fetching movies:', error);
    throw error;
  }
};

export const addMovie = async (newMovie: Movie): Promise<Movie> => {
  try {
    const response = await fetch(`${API_URL}/AddMovie`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(newMovie),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to add movie');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding movie:', error);
    throw error;
  }
};

export const updateMovie = async (
  showId: string,
  updatedMovie: Movie
): Promise<Movie> => {
  try {
    const response = await fetch(`${API_URL}/Update/${showId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updatedMovie),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to update movie: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating movie:', error);
    throw error;
  }
};

export const deleteMovie = async (showId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/DeleteMovie/${showId}`, {
      method: 'DELETE',
      headers: getHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to delete movie');
    }
  } catch (error) {
    console.error('Error deleting movie:', error);
    throw error;
  }
};

export const fetchMoviesAZ = async (
  pageSize: number,
  pageNum: number
): Promise<FetchMoviesResponse> => {
  try {
    const url = `${API_URL}/AllMoviesAZ?pageSize=${pageSize}&pageNum=${pageNum}`;

    const response = await fetch(url, { credentials: 'include' });
    if (!response.ok) throw new Error(`Failed to fetch movies alphabetically`);

    const data = await response.json();
    const movies: Movie[] = Array.isArray(data.movies) ? data.movies : data;

    // Fetch poster URLs in parallel
    const enrichedMovies = await Promise.all(
      movies.map(async (movie) => {
        try {
          const posterRes = await fetch(
            `${API_URL}/PosterUrl/${movie.showId}`,
            {
              credentials: 'include',
            }
          );
          if (posterRes.ok) {
            movie.posterUrl = await posterRes.text();
          }
        } catch (err) {
          console.warn(`Failed to fetch poster for ${movie.title}`);
        }
        return movie;
      })
    );

    return {
      movies: enrichedMovies,
      totalNumMovies: data.totalNumMovies || enrichedMovies.length,
    };
  } catch (error) {
    console.error('Error fetching movies alphabetically:', error);
    return {
      movies: [],
      totalNumMovies: 0,
    };
  }
};

export const submitRating = async (
  showId: string,
  userId: number,
  rating: number
): Promise<void> => {
  try {
    console.log('Submitting rating:', { showId, userId, rating });

    // Ensure rating is a number between 1 and 5
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      throw new Error('Rating must be a number between 1 and 5');
    }

    // Ensure userId is a number
    if (typeof userId !== 'number') {
      throw new Error('User ID must be a number');
    }

    const response = await fetch(`${API_URL}/SubmitRating`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        showId,
        userId: Number(userId), // Explicitly convert to number
        rating: Number(rating), // Explicitly convert to number
      }),
    });

    console.log('Rating submission response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Rating submission error response:', errorText);
      throw new Error(
        `Failed to submit rating: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const responseData = await response.json();
    console.log('Rating submission success:', responseData);
  } catch (error) {
    console.error('Error in submitRating:', error);
    throw error;
  }
};

export const getUserRating = async (
  showId: string,
  userId: number
): Promise<number> => {
  try {
    const response = await fetch(`${API_URL}/UserRating/${showId}/${userId}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to get user rating');
    }

    const data = await response.json();
    return data.rating;
  } catch (error) {
    console.error('Error getting user rating:', error);
    return 0;
  }
};

export const getAverageRating = async (
  showId: string
): Promise<{ averageRating: number; reviewCount: number }> => {
  try {
    const response = await fetch(`${API_URL}/AverageRating/${showId}`, {
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      return {
        averageRating: data.averageRating,
        reviewCount: data.reviewCount,
      };
    } else if (response.status === 404) {
      return { averageRating: 0, reviewCount: 0 };
    }
    throw new Error('Failed to get average rating');
  } catch (error) {
    return { averageRating: 0, reviewCount: 0 };
  }
};

export const getBulkAverageRatings = async (
  showIds: string[]
): Promise<{
  [key: string]: { averageRating: number; reviewCount: number };
}> => {
  try {
    const response = await fetch(
      `${API_URL}/BulkAverageRatings?${showIds.map((id) => `showIds=${encodeURIComponent(id)}`).join('&')}`,
      {
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get bulk average ratings');
    }

    const data = await response.json();
    const ratings: {
      [key: string]: { averageRating: number; reviewCount: number };
    } = {};

    data.forEach((item: any) => {
      ratings[item.showId] = {
        averageRating: item.averageRating,
        reviewCount: item.reviewCount,
      };
    });

    return ratings;
  } catch (error) {
    console.error('Error fetching bulk ratings:', error);
    return {};
  }
};

export const getContentBasedRecommendations = async (
  showId: string
): Promise<Movie[]> => {
  try {
    const response = await fetch(
      `${API_URL}/ContentRecommendations/${showId}`,
      {
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch content-based recommendations');
    }

    const data = await response.json();

    // The backend returns an array of recommendation objects
    // Each object has Recommendation1, Recommendation2, etc. properties
    const recommendationIds = Object.values(data[0] || {}).filter(
      (value): value is string =>
        typeof value === 'string' && value.startsWith('s') && value !== showId
    );

    // Fetch movie details for each recommendation
    const movies = await Promise.all(
      recommendationIds.map(async (id) => {
        try {
          return await fetchMovieById(id);
        } catch (err) {
          console.warn(`Failed to fetch movie with ID ${id}`);
          return null;
        }
      })
    );

    // Filter out any failed fetches
    return movies.filter((movie) => movie !== null) as Movie[];
  } catch (error) {
    console.error('Error fetching content-based recommendations:', error);
    throw error;
  }
};

export const getCollaborativeRecommendations = async (
  showId: string
): Promise<Movie[]> => {
  try {
    // First try to get collaborative recommendations
    const response = await fetch(
      `${API_URL}/CollaborativeRecommendations/${showId}`,
      {
        credentials: 'include',
      }
    );

    // If we get collaborative recommendations, use them
    if (response.ok) {
      const data = await response.json();

      // The backend returns an object with Rec1, Rec2, etc. properties
      const recommendationIds = [
        data.Rec1,
        data.Rec2,
        data.Rec3,
        data.Rec4,
        data.Rec5,
        data.Rec6,
        data.Rec7,
        data.Rec8,
        data.Rec9,
        data.Rec10,
      ].filter(
        (id): id is string =>
          typeof id === 'string' && id.startsWith('s') && id !== showId
      );

      // If we have valid recommendation IDs, fetch the movie details
      if (recommendationIds.length > 0) {
        // Fetch movie details for each recommendation
        const movies = await Promise.all(
          recommendationIds.map(async (id) => {
            try {
              return await fetchMovieById(id);
            } catch (err) {
              console.warn(`Failed to fetch movie with ID ${id}`);
              return null;
            }
          })
        );

        // Filter out any failed fetches
        const validMovies = movies.filter((movie) => movie !== null) as Movie[];

        // If we have valid movies, return them
        if (validMovies.length > 0) {
          return validMovies;
        }
      }
    }

    // If we don't have collaborative recommendations or they're invalid,
    // fall back to genre-based recommendations

    // First, get the current movie to extract its genres
    const currentMovie = await fetchMovieById(showId);

    if (currentMovie) {
      // Extract genres from the current movie (properties with value 1)
      const currentMovieGenres = Object.entries(currentMovie)
        .filter(
          ([key, value]) =>
            typeof value === 'number' &&
            value === 1 &&
            !['showId', 'releaseYear', 'averageStarRating'].includes(key)
        )
        .map(([key]) => key);

      // If the current movie has no genres, fall back to top-rated movies
      if (currentMovieGenres.length === 0) {
        const topRatedResponse = await fetchMovies(10, 1);
        return topRatedResponse.movies
          .filter((movie) => movie.showId !== showId)
          .slice(0, 10);
      }

      // Fetch a larger pool of movies to filter from
      const allMoviesResponse = await fetchMovies(100, 1);
      const allMovies = allMoviesResponse.movies.filter(
        (movie) => movie.showId !== showId
      );

      // Calculate genre match scores for each movie
      const moviesWithScores = allMovies.map((movie) => {
        // Count how many genres match the current movie
        const matchingGenres = currentMovieGenres.filter(
          (genre) => movie[genre as keyof Movie] === 1
        ).length;

        // Calculate a score based on matching genres and rating
        // Higher weight for matching genres (0.7) and lower weight for rating (0.3)
        const genreScore = matchingGenres / currentMovieGenres.length;
        const ratingScore = (movie.averageStarRating || 0) / 5; // Normalize to 0-1
        const totalScore = 0.7 * genreScore + 0.3 * ratingScore;

        return { movie, score: totalScore };
      });

      // Sort by score (highest first) and take top 10
      return moviesWithScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map((item) => item.movie);
    }

    // If all else fails, return top-rated movies
    const topRatedResponse = await fetchMovies(10, 1);
    return topRatedResponse.movies
      .filter((movie) => movie.showId !== showId)
      .slice(0, 10);
  } catch (error) {
    console.error('Error fetching collaborative recommendations:', error);
    throw error;
  }
};

export const fetchMovieById = async (showId: string): Promise<Movie> => {
  try {
    const response = await fetch(`${API_URL}/GetMovie/${showId}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch movie with ID ${showId}`);
    }

    const data = await response.json();
    const movie: Movie = data.movie; // Extract movie from the response data
    movie.posterUrl = data.posterUrl; // Set the poster URL from the response

    // Fetch average rating
    try {
      const ratingRes = await fetch(
        `${API_URL}/AverageRating/${movie.showId}`,
        {
          credentials: 'include',
        }
      );
      if (ratingRes.ok) {
        const ratingData = await ratingRes.json();
        movie.averageStarRating = ratingData.averageRating;
      } else if (ratingRes.status === 404) {
        movie.averageStarRating = 0;
      }
    } catch (err) {
      console.warn(`Failed to fetch rating for ${movie.title}`);
      movie.averageStarRating = 0;
    }

    return movie;
  } catch (error) {
    console.error('Error fetching movie by ID:', error);
    throw error;
  }
};

export const getMovieUserId = async (): Promise<number> => {
  try {
    console.log('Fetching movie user ID from API...');
    const response = await fetch(`${baseUrl}/MovieUser/GetUserByEmail`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response from GetUserByEmail:', errorText);
      throw new Error('Failed to get movie user ID');
    }

    const data = await response.json();
    console.log('Movie User ID API Response:', data);
    return data.userId;
  } catch (error) {
    console.error('Error getting movie user ID:', error);
    throw error;
  }
};

export const saveWatchedMovie = (movieId: string) => {
  try {
    const cookies = document.cookie.split(';');
    const watchedCookie = cookies.find((cookie) =>
      cookie.trim().startsWith('watched_movies=')
    );

    let watchedMovies: string[] = [];
    if (watchedCookie) {
      watchedMovies = JSON.parse(
        decodeURIComponent(watchedCookie.split('=')[1])
      );
    }

    // Remove the movie if it already exists (to avoid duplicates)
    watchedMovies = watchedMovies.filter((id) => id !== movieId);

    // Add the movie to the beginning of the array (most recent)
    watchedMovies.unshift(movieId);

    // Keep only the last 20 watched movies
    if (watchedMovies.length > 20) {
      watchedMovies = watchedMovies.slice(0, 20);
    }

    document.cookie = `watched_movies=${encodeURIComponent(
      JSON.stringify(watchedMovies)
    )}; path=/; max-age=31536000`; // 1 year expiration
  } catch (error) {
    console.error('Error saving watched movie:', error);
  }
};

export const getWatchedMovies = (): string[] => {
  try {
    const cookies = document.cookie.split(';');
    const watchedCookie = cookies.find((cookie) =>
      cookie.trim().startsWith('watched_movies=')
    );

    if (watchedCookie) {
      return JSON.parse(decodeURIComponent(watchedCookie.split('=')[1]));
    }
  } catch (error) {
    console.error('Error getting watched movies:', error);
  }
  return [];
};

export const areCookiesEnabled = (): boolean => {
  try {
    // Try to set a test cookie
    document.cookie = 'test_cookie=test; path=/';
    const cookiesEnabled = document.cookie.indexOf('test_cookie=') !== -1;
    // Clean up the test cookie
    document.cookie =
      'test_cookie=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    return cookiesEnabled;
  } catch (e) {
    return false;
  }
};
