import { Movie as Movie } from '../types/Movie';

const API_URL = 'https://localhost:5000/Test';

export const fetchMovies = async (): Promise<Movie[]> => {
  try {
    const response = await fetch(`${API_URL}/AllTestItems`, {
      credentials: 'include', // Include cookies in the request for authentication (security)
    });

    if (!response.ok) {
      throw new Error('Failed to fetch movies');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching movies:', error);
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

export const deleteProject = async (show_id: number): Promise<void> => {
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