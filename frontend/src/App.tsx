import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import './style/movies.css';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import MovieDetailsPage from './pages/MovieDetailsPage';
import Header from './components/Header';
import AdminPage from './pages/AdminPage';
import NewUserForm from './components/userInfo/UserInfoForm';
import AccountsPage from './pages/AccountsPage';
import EditingPage from './pages/EditingPage';
import SearchResultsPage from './pages/SearchResultsPage';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import PrivacyPage from './pages/PrivacyPage';
import ProtectedRoute from './components/ProtectedRoute';
import BookmarkedMoviesPage from './pages/BookmarkedMoviesPage';
import CookieConsent from "react-cookie-consent";
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-[#0a1a0a] w-full">
          <Header />
          <main className="flex-grow pt-[150px] w-full">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/register/userinfo" element={<NewUserForm />} />
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/movie/:movieId"
                element={
                  <ProtectedRoute>
                    <MovieDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="Administrator">
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/account"
                element={
                  <ProtectedRoute>
                    <AccountsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/account/edit"
                element={
                  <ProtectedRoute>
                    <EditingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/search"
                element={
                  <ProtectedRoute>
                    <SearchResultsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/privacy"
                element={<PrivacyPage />}
              />
              <Route
                path="/bookmarks"
                element={
                  <ProtectedRoute>
                    <BookmarkedMoviesPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
        <CookieConsent
          location="bottom"
          buttonText="I Accept"
          declineButtonText="I Decline"
          enableDeclineButton
          cookieName="cineNicheConsent"
          style={{ background: "#2B373B" }}
          buttonStyle={{ color: "#fff", backgroundColor: "#4CAF50", fontSize: "14px", border: "none", padding: "0.5rem 1rem" }}
          declineButtonStyle={{ background: "#ccc", color: "#000", fontSize: "14px", padding: "0.5rem 1rem", marginLeft: "1rem" }}
          expires={150}
        >
          This website uses cookies to create the user experience. Without accepting, you cannot effectively use the site.{" "}
          <Link to="/privacy" className="text-yellow-400 underline">
            Learn more
          </Link>
        </CookieConsent>
      </AuthProvider>
    </Router>
  );
}

export default App;
