import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Movie } from '../types/Movie';
import MovieRow from '../components/MovieRow';
import { fetchMovieById, areCookiesEnabled } from '../api/MovieAPI';
import '../style/BookmarkedMoviesPage.css';

const BookmarkedMoviesPage: React.FC = () => {
  const [bookmarkedMovies, setBookmarkedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadBookmarkedMovies = async () => {
      if (!areCookiesEnabled()) {
        setLoading(false);
        return;
      }

      try {
        const cookies = document.cookie.split(';');
        const bookmarkCookie = cookies.find((cookie) =>
          cookie.trim().startsWith('bookmarked_movies=')
        );

        if (bookmarkCookie) {
          const movieIds = JSON.parse(
            decodeURIComponent(bookmarkCookie.split('=')[1])
          );

          const movies = await Promise.all(
            movieIds.map(async (id: string) => {
              try {
                return await fetchMovieById(id);
              } catch (error) {
                console.error(`Error fetching movie ${id}:`, error);
                return null;
              }
            })
          );

          setBookmarkedMovies(
            movies.filter((movie): movie is Movie => movie !== null)
          );
        }
      } catch (error) {
        console.error('Error loading bookmarked movies:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBookmarkedMovies();
  }, []);

  const handleBackClick = () => {
    navigate('/browse');
  };

  const handleMovieClick = (movie: Movie) => {
    navigate(`/movie/${movie.showId}`);
  };

  if (!areCookiesEnabled()) {
    return (
      <div className="bookmarked-movies-container">
        <div className="movie-details-header">
          <div className="header-left">
            <button className="back-button" onClick={handleBackClick}>
              <span className="back-arrow">←</span>
            </button>
            <h1 className="account-header">Bookmarks</h1>
          </div>
        </div>
        <div className="cookies-disabled-message">
          <h2>Cookies Disabled</h2>
          <p>
            Please enable cookies in your browser settings to use the bookmarks
            feature.
          </p>
          <p>To enable cookies:</p>
          <ol>
            <li>Open your browser settings</li>
            <li>Find the Privacy or Security section</li>
            <li>Enable cookies for this website</li>
            <li>Refresh the page</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="bookmarked-movies-container">
      <div className="back-button-container">
        <button className="back-button" onClick={handleBackClick}>
          <div className="back-button-circle">
            <span>&larr;</span>
          </div>
        </button>
      </div>
      <div className="account-header">
        <br />
        <h1>Bookmarks</h1>
      </div>
      <div className="bookmarked-movies-content">
        {loading ? (
          <div className="loading">Loading bookmarks...</div>
        ) : bookmarkedMovies.length > 0 ? (
          <MovieRow
            genre="Bookmarked Movies"
            movies={bookmarkedMovies}
            onMovieClick={handleMovieClick}
          />
        ) : (
          <div className="no-bookmarks-message">
            <h2>No Bookmarks Yet</h2>
            <p>
              Bookmarks are a great way to keep track of movies you want to
              watch later!
            </p>
            <p>
              When you find a movie you're interested in, just click the
              bookmark button on its details page to save it here.
            </p>
            <button className="browse-button" onClick={() => navigate('/home')}>
              Browse Movies
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarkedMoviesPage;
