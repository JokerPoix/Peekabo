import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './auth/AuthContext';
import './i18n';

import HomePage from './pages/HomePage';
import BirdListPage from './pages/BirdListPage';
import BirdLocationPage from './pages/BirdLocationPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CameraClassificationPage from './pages/CameraClassificationPage';
import ChatPage from './pages/ChatPage';

import peekabooIcon from './assets/img/image_peekaboo.png';
import './pages.css';
import './App.css';

const queryClient = new QueryClient();

const AppContent: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <header>
        <nav className="navbar">
          <div className="nav-container">
            <img
              src={peekabooIcon}
              alt="Peekaboo Icon"
              className="chatbot-icon"
              width="auto"
            />
            <div className="nav-buttons">
              <button type="button" className="modern-btn" onClick={() => navigate('/')}>
                <span className="btn-icon">🏠</span>
                <span className="btn-text">Acceuil</span>
              </button>
              <button type="button" className="modern-btn" onClick={() => navigate('/birdlist')}>
                <span className="btn-icon">🦜</span>
                <span className="btn-text">Liste des Oiseaux</span>
              </button>
              <button type="button" className="modern-btn" onClick={() => navigate('/birdlocation')}>
                <span className="btn-icon">📍</span>
                <span className="btn-text">Localisation d&apos;un Oiseau</span>
              </button>
              <button type="button" className="modern-btn" onClick={() => navigate('/gen_login')}>
                <span className="btn-icon">👤</span>
                <span className="btn-text">Gen Login</span>
              </button>
              <button type="button" className="modern-btn" onClick={() => navigate('/sign_up')}>
                <span className="btn-icon">📝</span>
                <span className="btn-text">Gen Login Page</span>
              </button>
              <button type="button" className="modern-btn" onClick={() => navigate('/camera_class')}>
                <span className="btn-icon">📷</span>
                <span className="btn-text">Détection d&apos; Oiseaux</span>
              </button>
            </div>
          </div>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/birdlist" element={<BirdListPage />} />
          <Route path="/birdlocation" element={<BirdLocationPage />} />
          <Route path="/sign_up" element={<SignupPage />} />
          <Route path="/gen_login" element={<LoginPage />} />
          <Route path="/camera_class" element={<CameraClassificationPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </main>
      <footer>
        <p>&copy; 2025 Peekaboo. All rights reserved.</p>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
