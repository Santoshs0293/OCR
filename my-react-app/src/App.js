import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Logout from './components/Logout';
import Homepage from './components/Homepage';
import Translation from './components/Translation';
import Upload from './components/Upload';
import Dictionary from './components/Dictionary'; // Import Dictionary component
import Lens from './components/Lens'; // Import Dictionary component
import Training from './components/Training'

const App = () => {
  const [isLoggedIn, setLoggedIn] = useState(false);

  // Function to set the user as logged in
  const handleLogin = () => {
    setLoggedIn(true);
  };

  // Function to set the user as logged out
  const handleLogout = () => {
    setLoggedIn(false);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />

        {/* Use Route with element prop for conditional rendering */}
        <Route
          path="/translation"
          element={isLoggedIn ? <Translation /> : <Navigate to="/" />}
        />
        <Route
          path="/upload"
          element={isLoggedIn ? <Upload /> : <Navigate to="/" />}
        />

        {/* Add route for the dictionary */}
        <Route
          path="/dictionary"
          element={isLoggedIn ? <Dictionary /> : <Navigate to="/" />}
        />

        <Route
          path="/lens"
          element={isLoggedIn ? <Lens /> : <Navigate to="/" />}
        />

        <Route
          path="/training"
          element={isLoggedIn ? <Training /> : <Navigate to="/" />}
        />

        <Route
          path="/logout"
          element={<Logout onLogout={handleLogout} />}
        />

        {/* Public routes accessible regardless of authentication state */}
        <Route
          path="/login"
          element={<Login onLogin={handleLogin} />}
        />
        <Route
          path="/register"
          element={<Register />}
        />
      </Routes>
    </Router>
  );
};

export default App;
