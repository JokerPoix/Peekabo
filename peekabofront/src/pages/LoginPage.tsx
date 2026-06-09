import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import pexelsBg from '../assets/img/pexels-couleur-2317904.jpg';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Logging in with:', username, password);
  };

  return (
    <div
      className="page-container"
      style={{
        backgroundImage: `url(${pexelsBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        color: 'white',
        textShadow: '0 0 5px #000',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div className="form-container">
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="username">Identifiant</label>
            <input
              type="text"
              id="username"
              placeholder="Entrez votre identifiant"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              placeholder="Entrez votre mot de passe"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="login-actions">
            <Link to="/signup" className="login-link">
              Pas encore inscrit ? Inscription
            </Link>
            <button type="submit" className="signup-button">
              Connexion
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
