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
): Promise<FetchMoviesResponse> => {
  try {
      const categoryParams = selectedCategories
          .map((cat) => `movieTypes=${encodeURIComponent(cat)}`)
          .join('&');

      const response = await fetch(
          `${API_URL}/AllMovies?pageSize=${pageSize}&pageNum=${pageNum}${selectedCategories.length ? `&${categoryParams}` : ''}`,
          {
              credentials: 'include',
          }
      );

      if (!response.ok) {
          throw new Error(`Failed to fetch projects`);
      }
      return await response.json();
  } catch (error) {
      console.error("Error fetching projects:", error);
      throw error;
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

export const updateMovie = async (show_id: number, updatedMovie: Movie): Promise<Movie> => {
  try {
      const response = await fetch(`${API_URL}/Update/${show_id}`, {
          method: "PUT",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedMovie),
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

export const deleteMovie = async (show_id: number): Promise<void> => {
  try {
      const response = await fetch(`${API_URL}/DeleteMovie/${show_id}`,
          {
              method: 'DELETE'
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