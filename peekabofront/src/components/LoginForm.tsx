import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './LoginForm.css';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Logging in with:', username, password);
  };

  return (
    <div className="login-form">
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <div className="input-group">
          <label htmlFor="username">Username</label>
          <div className="modern-input-container">
            <input
              type="text"
              id="username"
              required
              placeholder="Enter your username"
              className="modern-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <div className="modern-input-container">
            <input
              type="password"
              id="password"
              required
              placeholder="Enter your password"
              className="modern-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        <button type="submit" className="modern-button">
          <span className="btn-text">Connexion</span>
        </button>
        <p className="signup-link">
          Vous n'avez pas de compte ?{' '}
          <Link to="/signup" className="modern-link">
            S'inscrire
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginForm;
