import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Movie } from '../types/Movie';
import { fetchMovieById } from '../api/MovieAPI';
import AuthorizeView from '../components/security/AuthorizeView';
import { FaBookmark, FaCookieBite } from 'react-icons/fa';
import Cookies from 'js-cookie';
import MovieRow from '../components/MovieRow';
import '../style/BookmarkedMoviesPage.css';

const BookmarkedMoviesPage: React.FC = () => {
  const [bookmarkedMovies, setBookmarkedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cookiesEnabled, setCookiesEnabled] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if cookies are enabled
    const cookiesEnabled = navigator.cookieEnabled;
    setCookiesEnabled(cookiesEnabled);

    if (cookiesEnabled) {
      loadBookmarkedMovies();
    } else {
      setLoading(false);
    }
  }, []);

  const loadBookmarkedMovies = async () => {
    try {
      setLoading(true);
      const bookmarkedMoviesCookie = Cookies.get('bookmarkedMovies');

      if (!bookmarkedMoviesCookie) {
        setBookmarkedMovies([]);
        setLoading(false);
        return;
      }

      const bookmarkedIds = JSON.parse(bookmarkedMoviesCookie);

      if (bookmarkedIds.length === 0) {
        setBookmarkedMovies([]);
        setLoading(false);
        return;
      }

      // Fetch movie details for each bookmarked ID
      const moviePromises = bookmarkedIds.map((id: string) =>
        fetchMovieById(id)
      );
      const movies = await Promise.all(moviePromises);

      // Filter out any null values (movies that couldn't be fetched)
      const validMovies = movies.filter(
        (movie): movie is Movie => movie !== null
      );

      setBookmarkedMovies(validMovies);
    } catch (err) {
      console.error('Error loading bookmarked movies:', err);
      setError('Failed to load bookmarked movies. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = (movieId: string) => {
    try {
      const bookmarkedMoviesCookie = Cookies.get('bookmarkedMovies');

      if (!bookmarkedMoviesCookie) return;

      const bookmarkedIds = JSON.parse(bookmarkedMoviesCookie);
      const updatedIds = bookmarkedIds.filter((id: string) => id !== movieId);

      Cookies.set('bookmarkedMovies', JSON.stringify(updatedIds), {
        expires: 365,
      });

      // Update the state to remove the movie
      setBookmarkedMovies((prevMovies) =>
        prevMovies.filter((movie) => movie.showId !== movieId)
      );
    } catch (err) {
      console.error('Error removing bookmark:', err);
    }
  };

  const checkCookiesEnabled = () => {
    const cookiesEnabled = navigator.cookieEnabled;
    setCookiesEnabled(cookiesEnabled);

    if (cookiesEnabled) {
      loadBookmarkedMovies();
    }
  };

  const handleMovieClick = (movie: Movie) => {
    navigate(`/movie/${movie.showId}`);
  };

  if (!cookiesEnabled) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-[#1f2937] rounded-lg p-8 max-w-md w-full text-center">
          <FaCookieBite className="text-5xl text-[#c35d24] mx-auto mb-4 opacity-70" />
          <h2 className="text-2xl font-bold text-white mb-4">
            Cookies Disabled
          </h2>
          <p className="text-gray-300 mb-6">
            Please enable cookies in your browser to use the bookmark feature.
          </p>
          <button
            className="bg-[#c35d24] text-white px-6 py-3 rounded font-semibold hover:bg-[#d86a2e] transition-transform hover:scale-105 mb-4"
            onClick={checkCookiesEnabled}
          >
            Check Again
          </button>
          <p className="text-sm text-gray-400">
            To enable cookies, please check your browser settings or privacy
            settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthorizeView>
      <div className="min-h-screen bg-black">
        <div className="px-4 md:px-8 pb-8 pt-2">
          <br />
          <br />
          <h1 className="account-header">Bookmarks</h1>

          {loading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="w-12 h-12 border-4 border-t-[#c35d24] border-gray-200 rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="bg-red-900/10 border border-red-900/20 rounded-lg p-6 text-center my-8">
              <p className="text-white">{error}</p>
            </div>
          ) : bookmarkedMovies.length === 0 ? (
            <div className="empty-bookmarks-container">
              <div className="bookmark-icon-container">
                <FaBookmark className="bookmark-icon" />
              </div>
              <h2 className="empty-bookmarks-title">No Bookmarked Movies</h2>
              <p className="empty-bookmarks-text">
                You haven't bookmarked any movies yet. Start exploring and save
                your favorites!
              </p>
              <Link to="/home" className="browse-button">
                Browse Movies
              </Link>
            </div>
          ) : (
            <div className="movie-rows-container space-y-12">
              <MovieRow
                genre="My Bookmarked Movies"
                movies={bookmarkedMovies}
                onMovieClick={handleMovieClick}
              />
            </div>
          )}
        </div>
      </div>
    </AuthorizeView>
  );
};

export default BookmarkedMoviesPage;
