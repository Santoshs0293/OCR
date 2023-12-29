
import React from 'react';
import { Link } from 'react-router-dom';
import './Translation.css'; // Import the CSS file

const Homepage = () => {
  return (
    <div className="container">
      <h2>Welcome to the Advision Research </h2>
      <p>This is a secure area for logged-in users.</p>

      <div className="link-container">
        <Link to="/register">Register</Link>
        <Link to="/login">Login</Link>
        <Link to="/logout">Logout</Link>
      </div>
    </div>
  );
};

export default Homepage;