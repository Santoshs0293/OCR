import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Header from './Header'; // Adjust the path accordingly
import Footer from './Footer';
import './Register.css'; // Import your CSS file

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    try {
      const response = await axios.post('http://localhost:5000/register', {
        username,
        password,
      });

      if (response.status === 201) {
        navigate('/login');
      }
    } catch (error) {
      setError('Username already exists or invalid data');
    }
  };

  return (

    <div>
      <Header />
    
    <div className="register-container">
      <h2>Register</h2>
      <div className="input-container">
        <label>Username:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="input-field"
        />
      </div>
      <div className="input-container">
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
        />
      </div>
      {error && <p className="error-message">{error}</p>}
      <button className="register-button" onClick={handleRegister}>
        Register
      </button>
      <p className="login-link">
        Already have an account? <Link to="/login">Login here</Link>.
      </p>
    </div>
    <Footer />
    </div>
  );
};

export default Register;
