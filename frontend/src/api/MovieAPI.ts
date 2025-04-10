import { Movie as Movie } from '../types/Movie';

interface FetchMoviesResponse {
  movies: Movie[];
  totalNumMovies: number;
}

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:5001';
const API_URL = `${baseUrl}/Movie`;

export const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
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
      .join("&");

    const searchParam = searchTerm
      ? `&searchTerm=${encodeURIComponent(searchTerm)}`
      : "";

    const filterParams = filters.length > 0
      ? `&filters=${filters.map(filter => encodeURIComponent(filter)).join(",")}`
      : "";

    const url = `${API_URL}/AllMovies?pageSize=${limit}&pageNum=${page}${
      genres.length ? `&${categoryParams}` : ""
    }${searchParam}${filterParams}`;

    const response = await fetch(url, { credentials: "include" });
    if (!response.ok) {
      throw new Error('Failed to fetch movies');
    }

    const data = await response.json();
    const movies: Movie[] = Array.isArray(data.movies) ? data.movies : data;

    // Get all movie IDs for batch processing
    const movieIds = movies.map(movie => movie.showId);

    // Fetch all ratings in bulk
    const ratings = await getBulkAverageRatings(movieIds);

    // Fetch all poster URLs in parallel
    const posterPromises = movieIds.map(async (showId) => {
      try {
        const posterRes = await fetch(`${API_URL}/PosterUrl/${showId}`, {
          credentials: "include",
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
      posterResults.map(result => [result.showId, result.posterUrl])
    );

    // Enrich movies with ratings and poster URLs
    const enrichedMovies = movies.map(movie => ({
      ...movie,
      averageStarRating: ratings[movie.showId]?.averageRating || 0,
      posterUrl: posterUrls[movie.showId] || null
    }));

    return {
      movies: enrichedMovies,
      total: data.totalNumMovies || enrichedMovies.length
    };
  } catch (error) {
    console.error('Error fetching movies:', error);
    throw error;
  }
};

export const addMovie = async (newMovie: Movie): Promise<Movie> => {
  try {
      const response = await fetch(`${API_URL}/AddMovie`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(newMovie),
          credentials: 'include',
          });

      if (!response.ok) {
          throw new Error("Failed to add movie");
      }

      return await response.json();
  } catch (error) {
      console.error("Error adding movie:", error);
      throw error;
  }
};

export const updateMovie = async (showId: string, updatedMovie: Movie): Promise<Movie> => {
  try {
      const response = await fetch(`${API_URL}/Update/${showId}`, {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(updatedMovie),
          credentials: 'include',
      });

      if (!response.ok) {
          throw new Error(`Failed to update movie: ${response.statusText}`);
      }

      return await response.json();
  } catch (error) {
      console.error("Error updating movie:", error);
      throw error;
  }
}

export const deleteMovie = async (showId: string): Promise<void> => {
  try {
      const response = await fetch(`${API_URL}/DeleteMovie/${showId}`,
          {
              method: 'DELETE',
              headers: getHeaders(),
              credentials: 'include'
          }
      );

      if (!response.ok) {
          throw new Error('Failed to delete movie');
      }
  } catch (error) {
      console.error('Error deleting movie:', error);
      throw error;
  }
}

export const fetchMoviesAZ = async (
  pageSize: number,
  pageNum: number
): Promise<FetchMoviesResponse> => {
  try {
    const url = `${API_URL}/AllMoviesAZ?pageSize=${pageSize}&pageNum=${pageNum}`;

    const response = await fetch(url, { credentials: "include" });
    if (!response.ok) throw new Error(`Failed to fetch movies alphabetically`);

    const data = await response.json();
    const movies: Movie[] = Array.isArray(data.movies) ? data.movies : data;

    // Fetch poster URLs in parallel
    const enrichedMovies = await Promise.all(
      movies.map(async (movie) => {
        try {
          const posterRes = await fetch(`${API_URL}/PosterUrl/${movie.showId}`, {
            credentials: "include",
          });
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
    console.error("Error fetching movies alphabetically:", error);
    return {
      movies: [],
      totalNumMovies: 0,
    };
  }
};

export const submitRating = async (showId: string, userId: number, rating: number): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/SubmitRating`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        showId,
        userId,
        rating,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit rating');
    }
  } catch (error) {
    throw error;
  }
};

export const getUserRating = async (showId: string, userId: number): Promise<number> => {
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

export const getAverageRating = async (showId: string): Promise<{ averageRating: number; reviewCount: number }> => {
  try {
    const response = await fetch(`${API_URL}/AverageRating/${showId}`, {
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      return { 
        averageRating: data.averageRating, 
        reviewCount: data.reviewCount 
      };
    } else if (response.status === 404) {
      return { averageRating: 0, reviewCount: 0 };
    }
    throw new Error('Failed to get average rating');
  } catch (error) {
    return { averageRating: 0, reviewCount: 0 };
  }
};

export const getBulkAverageRatings = async (showIds: string[]): Promise<{ [key: string]: { averageRating: number; reviewCount: number } }> => {
  try {
    const response = await fetch(`${API_URL}/BulkAverageRatings?${showIds.map(id => `showIds=${encodeURIComponent(id)}`).join('&')}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to get bulk average ratings');
    }

    const data = await response.json();
    const ratings: { [key: string]: { averageRating: number; reviewCount: number } } = {};
    
    data.forEach((item: any) => {
      ratings[item.showId] = {
        averageRating: item.averageRating,
        reviewCount: item.reviewCount
      };
    });

    return ratings;
  } catch (error) {
    console.error('Error fetching bulk ratings:', error);
    return {};
  }
};

export const getContentBasedRecommendations = async (showId: string): Promise<Movie[]> => {
  try {
    const response = await fetch(`${API_URL}/ContentBasedRecommendations/${showId}`, {
      headers: getHeaders(),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch content-based recommendations');
    }

    const data = await response.json();
    return data.movies || [];
  } catch (error) {
    console.error('Error fetching content-based recommendations:', error);
    throw error;
  }
};

export const getCollaborativeRecommendations = async (showId: string): Promise<Movie[]> => {
  try {
    const response = await fetch(`${API_URL}/CollaborativeRecommendations/${showId}`, {
      headers: getHeaders(),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch collaborative recommendations');
    }

    const data = await response.json();
    return data.movies || [];
  } catch (error) {
    console.error('Error fetching collaborative recommendations:', error);
    throw error;
  }
};
