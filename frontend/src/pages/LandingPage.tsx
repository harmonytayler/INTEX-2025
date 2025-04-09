import { Link } from 'react-router-dom';
import '../style/identity.css';
import '@fortawesome/fontawesome-free/css/all.css';

export default function LandingPage() {
  return (
    <div
      style={{
        backgroundColor: "black",
        color: "white",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 2rem",
          borderBottom: "1px solid white",
        }}
      >
        <h1 style={{ margin: 0 }}>CineNiche</h1>
        <nav>
          <Link to="/FAQ" style={{ color: "white", textDecoration: "none" }}>
            FAQ
          </Link>
        </nav>
      </header>

      {/* MAIN */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <div style={{ marginBottom: "3rem", textAlign: "center" }}>
          <Link to="/login">
            <button
              style={{
                backgroundColor: "white",
                color: "black",
                padding: "1rem 2.5rem",
                fontSize: "1.25rem",
                border: "none",
                cursor: "pointer",
                margin: "1rem",
              }}
            >
              Log In
            </button>
          </Link>

          <Link to="/register">
            <button
              style={{
                backgroundColor: "white",
                color: "black",
                padding: "1rem 2.5rem",
                fontSize: "1.25rem",
                border: "none",
                cursor: "pointer",
                margin: "1rem",
              }}
            >
              Register
            </button>
          </Link>
        </div>
      </main>

      {/* FOOTER */}
      <footer
        style={{
          textAlign: "center",
          padding: "1rem",
          borderTop: "1px solid white",
          marginTop: "auto",
        }}
      >
        <Link to="/privacy" style={{ color: "white", textDecoration: "underline" }}>
          Privacy Policy
        </Link>
      </footer>
    </div>
  );
}
