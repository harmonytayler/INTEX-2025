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
import LandingPage from './pages/LandingPage';
import PrivacyPage from './pages/PrivacyPage';

function App() {
  return (
    <Router>
      {/* Header outside Routes so it appears on every page */}
      <Header />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/userinfo" element={<NewUserForm />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/movie/:movieId" element={<MovieDetailsPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
      </Routes>
    </Router>
  );
}

export default App;
