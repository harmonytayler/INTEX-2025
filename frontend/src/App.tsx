import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import './style/movies.css';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import MovieDetailsPage from './pages/MovieDetailsPage';
import Header from './components/Header';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <>
      <Header />
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/movie/:movieId" element={<MovieDetailsPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
