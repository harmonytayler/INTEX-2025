import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Movie } from '../types/Movie';
import { fetchMovies } from '../api/MovieAPI';
import '../style/identity.css';
import '@fortawesome/fontawesome-free/css/all.css';
import CookieConsent from "react-cookie-consent";
import '../style/header.css';
import '../style/LandingPage.css';
import MovieCard from '../components/MovieCard';

export default function LandingPage() {
  const [topMovies, setTopMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTopMovies = async () => {
      try {
        const { movies } = await fetchMovies(16, 1, [], '', ['topRated']);
        setTopMovies(movies);
        setError(null);
      } catch (err) {
        setError('Failed to load trending movies');
        console.error('Error loading top movies:', err);
      } finally {
        setLoading(false);
      }
    };

    loadTopMovies();
  }, []);

  return (
    <div className="landing-page">
      {/* HEADER */}
      <header>
        <div className="container">
          <div className="logo-container">
            <Link to="/" className="logo">
              <img src="/CineNiche_Logo.png" alt="CineNiche Logo" className="logo-image" />
            </Link>
            <Link to="/" className="site-title">CineNiche</Link>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="landing-main">
        <div className="landing-content">
          <h1 className="landing-title">
            CineNiche
          </h1>
          
          <div className="landing-buttons">
            <Link to="/login">
              <button className="landing-button">
                Log In
              </button>
            </Link>

            <Link to="/register">
              <button className="landing-button">
                Register
              </button>
            </Link>
          </div>
        </div>

        <br/><br/><br/><br/><br/><br/><br/><br/><br/>

        <div className="trending-now">
          <h2>Trending Now</h2>
          {loading ? (
            <div className="loading-message">Loading trending movies...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            <div className="movie-list-container">
              {topMovies.map((movie) => (
                  <MovieCard
                  key={movie.showId}
                  movie={movie} />
              ))}
            </div>
          )}
        </div>

        <div className="div-faq">
          <h2>Frequently Asked Questions</h2>
          <p>
            <b>1. What is CineNiche?</b>
            <br/>
            CineNiche is a curated streaming service focused on independent films, international cinema, and hidden gems you won't find on mainstream platforms.
          </p>

          <p>
            <b>2. How much does CineNiche cost?</b>
            <br/>
            CineNiche offers a monthly subscription for $7.99 or an annual plan for $79.99. Both plans include unlimited access to our entire catalog and are 100% ad-free.
          </p>

          <p>
            <b>3. Can I try CineNiche before subscribing?</b>
            <br/>
            Yes! We offer a 7-day free trial so you can explore our collection risk-free.
          </p>

          <p>
            <b>4. What devices can I use to watch CineNiche?</b>
            <br/>
            You can stream CineNiche on web browsers, iOS and Android apps, smart TVs, and popular streaming devices like Roku, Apple TV, and Chromecast.
          </p>

          <p>
            <b>5. Does CineNiche offer offline viewing?</b>
            <br/>
            Yes. Our mobile apps allow you to download titles and watch them offline at your convenience.
          </p>

          <p>
            <b>6. How often is new content added?</b>
            <br/>
            New titles are added weekly. We're always updating our library with rare finds, festival favorites, and critically acclaimed films from around the world.
          </p>

          <p>
            <b>7. Is CineNiche family-friendly?</b>
            <br/>
            While CineNiche primarily features content for adults, we also offer a wide selection of family-friendly and youth-oriented films. Parental controls are available in your account settings.
          </p>

          <p>
            <b>8. How do I cancel my subscription?</b>
            <br/>
            You can cancel anytime through your account dashboard. Your access will remain active until the end of your billing cycle.
          </p>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-content">
          <p className="footer-copyright">
            © {new Date().getFullYear()} CineNiche. All rights reserved.
          </p>
          <div className="footer-links">
            <Link to="/privacy" className="footer-link">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>

      {/* COOKIE CONSENT */}
      <CookieConsent
        location="bottom"
        buttonText="I understand"
        cookieName="cineNicheConsent"
        style={{ background: "#2B373B" }}
        buttonStyle={{ color: "#ffffff", backgroundColor: "#4CAF50", fontSize: "14px", border: "none", padding: "0.5rem 1rem" }}
        expires={150}
      >
        This website uses cookies to enhance the user experience. By continuing, you consent to the use of cookies.{" "}
        <Link to="/privacy" className="text-yellow-400 underline">
          Learn more
        </Link>
      </CookieConsent>
    </div>
  );
}
