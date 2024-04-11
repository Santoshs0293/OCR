import React, { useState } from 'react';
import axios from 'axios';
import Header from './Header'; // Adjust the path accordingly
import Footer from './Footer';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook

const Logout = () => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigate = useNavigate(); // Use useNavigate hook to navigate

  const handleLogout = async () => {
    try {
      await axios.get('http://localhost:5000/logout');
      // Redirect to the login page
      navigate('/login'); // Use navigate function to redirect
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleConfirmation = () => {
    setShowConfirmation((prev) => !prev);
  };

  return (
    <div>
      <Header />
      <div>
        <h2>Logout</h2>
        <button onClick={toggleConfirmation}>Logout</button>
        {showConfirmation && (
          <div className="confirmation-dialog">
            <p>Are you sure you want to logout?</p>
            <button onClick={handleLogout}>Yes</button>
            <button onClick={toggleConfirmation}>Cancel</button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Logout;
