import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import Header from './components/Header';
import AdminPage from './pages/AdminPage';
import NewUserForm from './components/userInfo/UserInfoForm';

function App() {
  return (
    <>
    <Header />
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register/userinfo" element={<NewUserForm/>} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />

        </Routes>
      </Router>
    </>
  );
}

export default App;
