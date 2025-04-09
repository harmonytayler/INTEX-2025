import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  useEffect(() => {
    // Attach the env variables to a global variable for debugging
    window.env = import.meta.env;
    console.log("Window env set:", window.env);
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-[#0a1a0a] w-full">
          <Header />
          <main className="flex-grow pt-[150px] w-full">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/register/userinfo" element={<NewUserForm/>} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/movie/:movieId" element={<MovieDetailsPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/account" element={<AccountsPage />} />
              <Route path="/account/edit" element={<EditingPage />} />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
