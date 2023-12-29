import React, { useState } from 'react';
import axios from 'axios';

const Logout = ({ history }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.get('http://localhost:5000/logout');
      // Redirect to the login page
      history.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleConfirmation = () => {
    setShowConfirmation((prev) => !prev);
  };

  return (
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
  );
};

export default Logout;
