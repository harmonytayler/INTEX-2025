import { Movie as Movie } from '../types/Movie';

interface FetchMoviesResponse {
  movies: Movie[];
  totalNumMovies: number;
}

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:5001';
const API_URL = `${baseUrl}/Movie`;
const ADMIN_API_URL = `${baseUrl}/AdminMovie`;

// Helper function to get headers with credentials
const getHeaders = () => {
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

    // Fetch poster URLs and average ratings in parallel
    const enrichedMovies = await Promise.all(
      movies.map(async (movie) => {
        try {
          // Fetch poster URL
          const posterRes = await fetch(`${API_URL}/PosterUrl/${movie.showId}`, {
            credentials: "include",
          });
          if (posterRes.ok) {
            movie.posterUrl = await posterRes.text();
          }

          // Fetch average rating using the correct endpoint
          const ratingRes = await fetch(`${API_URL}/AverageRating/${movie.showId}`, {
            credentials: "include",
          });
          if (ratingRes.ok) {
            const ratingData = await ratingRes.json();
            movie.averageStarRating = ratingData.averageRating;
          } else if (ratingRes.status === 404) {
            movie.averageStarRating = 0;
          }
        } catch (err) {
          console.warn(`Failed to fetch additional data for ${movie.title}`);
          movie.averageStarRating = 0;
        }
        return movie;
      })
    );

    // Sort movies by average rating
    enrichedMovies.sort((a, b) => (b.averageStarRating || 0) - (a.averageStarRating || 0));

    return {
      movies: enrichedMovies,
      total: data.totalNumMovies || enrichedMovies.length
    };
  } catch (error) {
    console.error('Error fetching movies:', error);
    throw error;
  }
};

export const addMovie = async (movie: Movie): Promise<Movie> => {
  const response = await fetch(`${ADMIN_API_URL}/AddMovie`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(movie),
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to add movie');
  }

  return response.json();
};

export const updateMovie = async (id: string, movie: Movie): Promise<Movie> => {
  const response = await fetch(`${ADMIN_API_URL}/Update/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(movie),
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update movie');
  }

  return response.json();
};

export const deleteMovie = async (id: string): Promise<void> => {
  const response = await fetch(`${ADMIN_API_URL}/DeleteMovie/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete movie');
  }
};

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

    if (!response.ok) {
      if (response.status === 404) {
        return { averageRating: 0, reviewCount: 0 };
      }
      throw new Error('Failed to get average rating');
    }

    const data = await response.json();
    return { 
      averageRating: data.averageRating, 
      reviewCount: data.reviewCount 
    };
  } catch (error) {
    return { averageRating: 0, reviewCount: 0 };
  }
};
