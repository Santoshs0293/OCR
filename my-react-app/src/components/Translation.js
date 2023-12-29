// Translation.js

import React from 'react';
import { Link } from 'react-router-dom';
import './Translation.css'; // Import the CSS file

const Translation = () => {
  return (
    <div className="container">
      <h2>Welcome to the Translation</h2>
      <p>This is a secure area for logged-in users.</p>

      <div className="link-container">
        
        <Link to="/upload">Upload</Link>
        <Link to="/logout">Logout</Link>
      </div>
    </div>
  );
};

export default Translation;
