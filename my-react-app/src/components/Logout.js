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
      <div className="text-center mt-5">
        <h2>Logout</h2>
        <button onClick={toggleConfirmation}>Logout</button>
        {showConfirmation && (
          <div className="confirmation-dialog mt-3">
            <p>Are you sure you want to logout?</p>
            <div>
              <button onClick={handleLogout} className="mr-3">Yes</button>
              <button onClick={toggleConfirmation} className="ml-3">Cancel</button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
  
  
};

export default Logout;
