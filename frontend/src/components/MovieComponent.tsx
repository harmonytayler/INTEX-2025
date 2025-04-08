import { useEffect, useState } from 'react';
import { Movie } from '../types/Movie';
import { fetchMovies } from '../api/MovieAPI';
import Pagination from './admin/Pagination';

function MovieList({ selectedCategories }: { selectedCategories: string[] }) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [pageSize, setPageSize] = useState<number>(10);
  const [pageNum, setPageNum] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadMovies = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching movies...');
        const data = await fetchMovies(pageSize, pageNum, selectedCategories);
        console.log('Response data:', data);

        // Check if movies is an array before setting state
        if (data && Array.isArray(data.movies)) {
          setMovies(data.movies);
          setTotalPages(Math.ceil((data.totalNumMovies || 0) / pageSize));
        } else {
          console.warn('Unexpected data format:', data);
          setMovies([]);
          setTotalPages(0);
        }
      } catch (error) {
        console.error('Error loading movies:', error);
        setError((error as Error).message);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, [pageSize, pageNum, selectedCategories]);

  // Display loading state
  if (loading) return <p>Loading movies...</p>;

  // Display error if any
  if (error) return <p className="text-danger">Error: {error}</p>;

  // Display message if no movies found
  if (!movies || movies.length === 0) return <p>No movies found.</p>;

  // Simple rendering of just title and type to minimize potential errors
  return (
    <div className="movie-list">
      <h3>Movies Found: {movies.length}</h3>
      <div className="row">
        {movies.map((movie, index) => (
          <div key={movie.showId || `movie-${index}`} className="col-md-6 mb-3">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{movie.title || 'Unknown Title'}</h5>
                <p className="card-text">Type: {movie.type || 'Unknown'}</p>
                {/* Only include the most essential information */}
                {movie.director && (
                  <p className="card-text">Director: {movie.director}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Pagination
        currentPage={pageNum}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setPageNum}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPageNum(1);
        }}
      />
    </div>
  );
}

export default MovieList;
