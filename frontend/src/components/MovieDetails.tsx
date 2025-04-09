import React, { useState } from 'react';
import { Movie } from '../types/Movie';

interface MovieDetailsProps {
  movie: Movie;
  onClose: () => void;
}

const MovieDetails: React.FC<MovieDetailsProps> = ({ movie, onClose }) => {
  // Helper function to get all genres for this movie
  const [isImageError, setIsImageError] = useState(false); // State to track if the image has failed to load
  const imageUrl = movie.posterUrl; // Extract the URL from the JSON object

  const handleImageError = () => {
    setIsImageError(true);
  };

  const getGenres = () => {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col md:flex-row">
          {/* Poster Section */}
          <div className="w-full md:w-1/3 p-4">
          <div className="poster-placeholder">
        {!isImageError && imageUrl ? (
          <img 
            src={imageUrl} 
            alt={movie.title} 
            className="movie-poster-image"
            onError={handleImageError} // Trigger the error handler if the image fails to load
          />
        ) : (
          <div className="default-poster-message">
            <span>This one doesn't have a poster yet! :(</span>
          </div>
        )}
      </div>
          </div>
          
          {/* Details Section */}
          <div className="w-full md:w-2/3 p-4 text-white">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">{movie.title}</h2>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
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
    </div>
  );
};

export default MovieDetails; 