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
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register/userinfo" element={<NewUserForm/>} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/movie/:movieId" element={<MovieDetailsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/account" element={<AccountsPage />} />
          <Route path="/account/edit" element={<EditingPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
