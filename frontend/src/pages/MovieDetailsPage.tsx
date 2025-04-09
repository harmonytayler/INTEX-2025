import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Movie } from '../types/Movie';
import { getMovieById } from '../api/MovieAPI'; // Import the new function
import Logout from '../components/security/Logout';
import AuthorizeView, { AuthorizedUser } from '../components/security/AuthorizeView';
import SearchBar from '../components/SearchBar';

const MovieDetailsPage: React.FC = () => {
  const { showId } = useParams<{ showId: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isImageError, setIsImageError] = useState(false); // State to track if the image has failed to load
  const imageUrl = movie ? movie.posterUrl : ''; // Extract the URL from the JSON object

  // Handle image loading error
  const handleImageError = () => {
    setIsImageError(true);
  };

  useEffect(() => {
    console.log('showId:', showId);
    const loadMovieDetails = async () => {
      try {
        setLoading(true);
        setError(null);
  
        if (showId) {
          const movieData = await getMovieById(showId);
          console.log('Fetched movie data:', movieData); // Debugging line
          setMovie(movieData);
        }
      } catch (error: any) {
        console.error('Error loading movie details:', error);
        setError(error.message || 'An error occurred while loading the movie. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
  
    if (showId) {
      loadMovieDetails();
    }
  }, [showId]);
  

  // Helper function to get all genres for this movie
  const getGenres = () => {
    if (!movie) return '';

    const genres: string[] = [];

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
        <div className="bg-black/80 fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-center">
          <div className="flex items-center">
            <button 
              onClick={handleBackClick}
              className="flex items-center text-white hover:text-red-500 transition-colors mr-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Home
            </button>
            <div className="w-64">
              <SearchBar placeholder="Search movies..." />
            </div>
          </div>
          <div>
            <Logout>
              <span className="text-white">
                <AuthorizedUser value="email" />
              </span>
            </Logout>
          </div>
        </div>

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
                <div className="w-full md:w-1/3">
                  <div className="poster-placeholder">
                    {!isImageError && imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={movie.title} 
                        className="movie-poster-image"
                        onError={handleImageError}
                      />
                    ) : (
                      <div className="default-poster-message">
                        <span>This one doesn't have a poster yet! :(</span>
                      </div>
                    )}
                  </div>
                </div>

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
