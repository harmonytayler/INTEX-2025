import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import './style/movies.css';
import LoginPage from './pages/publicpages/LoginPage';
import RegisterPage from './pages/publicpages/RegisterPage';
import HomePage from './pages/userpages/HomePage';
import MovieDetailsPage from './pages/userpages/MovieDetailsPage';
import Header from './components/Header';
import AdminPage from './pages/adminpages/AdminPage';
import NewUserForm from './components/userInfo/UserInfoForm';
import AccountsPage from './pages/userpages/AccountsPage';
import EditingPage from './pages/adminpages/EditingPage';
import SearchResultsPage from './pages/userpages/SearchResultsPage';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/publicpages/LandingPage';
import PrivacyPage from './pages/publicpages/PrivacyPage';

function App() {
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
              <Route path="/register/userinfo" element={<NewUserForm />} />
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
