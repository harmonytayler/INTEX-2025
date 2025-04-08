import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Movie } from '../types/Movie';
import { fetchMovies } from '../api/MovieAPI';
import Logout from '../components/security/Logout';
import AuthorizeView, { AuthorizedUser } from '../components/security/AuthorizeView';

const MovieDetailsPage: React.FC = () => {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMovieDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all movies and find the one with matching ID
        const response = await fetchMovies(100, 1, [], '', []);
        
        if (response && Array.isArray(response.movies)) {
          const foundMovie = response.movies.find(m => m.showId === movieId);
          
          if (foundMovie) {
            setMovie(foundMovie);
          } else {
            setError('Movie not found');
          }
        } else {
          setError('Failed to load movie data');
        }
      } catch (error) {
        console.error('Error loading movie details:', error);
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    if (movieId) {
      loadMovieDetails();
    }
  }, [movieId]);

  // Helper function to get all genres for this movie
  const getGenres = () => {
    if (!movie) return '';
    
    const genres: string[] = [];
    
    // Check each genre field and add to the list if it's 1
    if (movie.action === 1) genres.push('Action');
    if (movie.comedies === 1) genres.push('Comedy');
    if (movie.dramas === 1) genres.push('Drama');
    if (movie.horrorMovies === 1) genres.push('Horror');
    if (movie.documentaries === 1) genres.push('Documentary');
    if (movie.thrillers === 1) genres.push('Thriller');
    if (movie.familyMovies === 1) genres.push('Family');
    if (movie.comediesRomanticMovies === 1) genres.push('Romance');
    
    return genres.join(', ');
  };

  const handleBackClick = () => {
    navigate('/home');
  };

  return (
    <AuthorizeView>
      <div className="min-h-screen bg-black text-white">
        {/* Header with back button and user info */}
        <div className="bg-black/80 fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-center">
          <button 
            onClick={handleBackClick}
            className="flex items-center text-white hover:text-red-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </button>
          <div>
            <Logout>
              <span className="text-white">
                <AuthorizedUser value="email" />
              </span>
            </Logout>
          </div>
        </div>

        {/* Main content */}
        <div className="pt-20 px-4 md:px-8 pb-8">
          {loading && (
            <div className="text-center py-8">Loading movie details...</div>
          )}

          {error && (
            <div className="text-red-500 text-center py-8">
              Error: {error}
            </div>
          )}

          {!loading && !error && movie && (
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Poster Section */}
                <div className="w-full md:w-1/3">
                  <div className="poster-placeholder bg-gray-800 w-full aspect-[2/3] rounded-md flex items-center justify-center">
                    <span className="text-gray-400">Poster</span>
                  </div>
                </div>
                
                {/* Details Section */}
                <div className="w-full md:w-2/3">
                  <h1 className="text-3xl font-bold mb-4">{movie.title}</h1>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-300">Type</h3>
                      <p>{movie.type}</p>
                    </div>
                    
                    {movie.director && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-300">Director</h3>
                        <p>{movie.director}</p>
                      </div>
                    )}
                    
                    {movie.cast && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-300">Cast</h3>
                        <p>{movie.cast}</p>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-300">Genres</h3>
                      <p>{getGenres()}</p>
                    </div>
                    
                    {movie.releaseYear && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-300">Release Year</h3>
                        <p>{movie.releaseYear}</p>
                      </div>
                    )}
                    
                    {movie.rating && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-300">Rating</h3>
                        <p>{movie.rating}</p>
                      </div>
                    )}
                    
                    {movie.duration && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-300">Duration</h3>
                        <p>{movie.duration}</p>
                      </div>
                    )}
                    
                    {movie.country && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-300">Country</h3>
                        <p>{movie.country}</p>
                      </div>
                    )}
                    
                    {movie.description && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-300">Description</h3>
                        <p className="whitespace-pre-line">{movie.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthorizeView>
  );
};

export default MovieDetailsPage; 