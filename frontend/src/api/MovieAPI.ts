import { Movie as Movie } from '../types/Movie';

interface FetchMoviesResponse {
  movies: Movie[];
  totalNumMovies: number;
}

const API_URL = 'https://localhost:5000/Movie';

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
          .join('&');

      const searchParam = searchTerm ? `&searchTerm=${encodeURIComponent(searchTerm)}` : '';
      
      const genreParams = selectedGenres && selectedGenres.length > 0
          ? `&genres=${selectedGenres.map(genre => encodeURIComponent(genre)).join(',')}`
          : '';
      
      const url = `${API_URL}/AllMovies?pageSize=${pageSize}&pageNum=${pageNum}${selectedCategories.length ? `&${categoryParams}` : ''}${searchParam}${genreParams}`;
      console.log("Fetching from URL:", url);

      const response = await fetch(url, {
          credentials: 'include',
      });

      if (!response.ok) {
          console.error("API error response:", response.status, response.statusText);
          throw new Error(`Failed to fetch movies: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("API response data:", data);

      // The backend might return the data directly, not wrapped in a movies property
      if (Array.isArray(data)) {
          return {
              movies: data,
              totalNumMovies: data.length
          };
      }
      
      // Provide default values if the response structure is unexpected
      return {
          movies: Array.isArray(data.movies) ? data.movies : [],
          totalNumMovies: data.totalNumMovies || 0
      };
  } catch (error) {
      console.error("Error fetching movies:", error);
      // Return a valid empty response structure instead of throwing
      return {
          movies: [],
          totalNumMovies: 0
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
