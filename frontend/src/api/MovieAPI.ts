import { Movie as Movie } from '../types/Movie';

interface FetchMoviesResponse {
  movies: Movie[];
  totalNumMovies: number;
}

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:5001';
const API_URL = `${baseUrl}/Movie`;

export const fetchMovies = async (
  pageSize: number,
  pageNum: number,
  selectedCategories: string[],
  searchTerm?: string,
  selectedGenres?: string[]
): Promise<FetchMoviesResponse> => {
  try {
    const categoryParams = selectedCategories
      .map((cat) => `movieTypes=${encodeURIComponent(cat)}`)
      .join("&");

    const searchParam = searchTerm
      ? `&searchTerm=${encodeURIComponent(searchTerm)}`
      : "";

    const genreParams =
      selectedGenres && selectedGenres.length > 0
        ? `&genres=${selectedGenres.map((genre) => encodeURIComponent(genre)).join(",")}`
        : "";

    const url = `${API_URL}/AllMovies?pageSize=${pageSize}&pageNum=${pageNum}${
      selectedCategories.length ? `&${categoryParams}` : ""
    }${searchParam}${genreParams}`;

    const response = await fetch(url, { credentials: "include" });
    if (!response.ok) throw new Error(`Failed to fetch movies`);

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
    console.error("Error fetching movies:", error);
    return {
      movies: [],
      totalNumMovies: 0,
    };
  }
};

export const addMovie = async (newMovie: Movie): Promise<Movie> => {
  try {
      const response = await fetch(`${API_URL}/AddMovie`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
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
          headers: {
              "Content-Type": "application/json",
          },
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
