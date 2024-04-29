// Homepage.js
import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header'; // Adjust the path accordingly
import Footer from './Footer'; // Adjust the path accordingly

import './Translation.css'; // Import the CSS file

const Homepage = () => {
  return (
    <div>
      <Header />
      
       
      <div className="container">
        <h2>Welcome to the Advisions Research </h2>
        <p>This is a secure area for logged-in users.</p>

        <div className="link-container">
          <Link to="/register" className="custom-link">Register</Link>
          <Link to="/login" className="custom-link">Login</Link>
          
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Homepage;
