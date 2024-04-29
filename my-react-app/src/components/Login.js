import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Header from './Header'; // Adjust the path accordingly
import Footer from './Footer'; 
import './Login.css';

const apiUrl = process.env.REACT_APP_API_URL;


const Login = ({onLogin}) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${apiUrl}login`, {
        username,
        password,
      });

      if (response.status === 200) {
        onLogin();
        navigate('/Translation');
        
      }
    } catch (error) {
      setError('Invalid credentials');
    }
  };

  return (
    <div>
      <Header />
    
    <div className="login-container">
      <h2>Login</h2>
      <div className="input-container">
        <label className="input-label">Username:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="input-field"
        />
      </div>
      <div className="input-container">
        <label className="input-label">Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
        />
      </div>
      {error && <p className="error-message">{error}</p>}
      <button className="login-button" onClick={handleLogin}>
        Login
      </button>
      <p className="register-link">
        Don't have an account? <Link to="/register">Register here</Link>.
      </p>
    </div>
    <Footer />
    </div>
  );
};

export default Login;
