// Translation.js

import React from 'react';
import { Link } from 'react-router-dom';
import Header from './Header'; // Adjust the path accordingly
import Footer from './Footer';
import './style.css'; // Import the CSS file
import './Translation.css';

const Translation = () => {
  return (

    <div>

      <Header />

      <div className="sidebar">
        <a className="active" href="/">Home</a>
        <Link to="/upload">Upload</Link>
        <a href="/logout">Logout</a>
        <a href="#about">About</a>
      </div>

      <div className="content">
 
      <div className="container">
        <h2>Welcome to the Advisions Research </h2>
        <p>This is a secure area for logged-in users.</p>

        
      </div>

      </div>
      <Footer />
    </div>
  );
};

export default Translation;
