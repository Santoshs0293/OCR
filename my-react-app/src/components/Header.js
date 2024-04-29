// Header.js

import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
// import logo from './your-logo.png'; // Import your logo image

const Header = () => {
  return (


    <header className='sticky-top' style={headerStyle}>
      <img alt="OCR" style={headingStyle} />
      <h1 style={headingStyle}>Advisions Research</h1>
    </header>
  );
};

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between', // Add space between logo and heading
  padding: '1rem',
  backgroundColor: '#3498db', // Change the background color to a more attractive one
  color: '#fff', // Set text color to white
};

const logoStyle = {
  width: '80px', // Increase the logo size
  marginRight: '10px',
};

const headingStyle = {
  margin: 0,
  fontSize: '1.5rem', // Increase the heading font size
};

export default Header;
