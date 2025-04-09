import { Link } from 'react-router-dom';
import '../style/identity.css';
import '@fortawesome/fontawesome-free/css/all.css';
import CookieConsent from "react-cookie-consent";
import '../style/header.css';
import '../style/LandingPage.css';

export default function LandingPage() {
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
            <Link to="/FAQ" className="footer-link">
              FAQ
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
