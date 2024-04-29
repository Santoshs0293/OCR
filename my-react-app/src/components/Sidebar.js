// Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h3>Sidebar Content</h3>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/upload">Upload</Link></li>
        
        <li><Link to="/logout">Logout</Link></li>
        {/* Add more sidebar links as needed */}
      </ul>
    </div>
  );
};

export default Sidebar;
