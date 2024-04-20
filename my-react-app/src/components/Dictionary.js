import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import RussianKeyboard from './RussianKeyboard'; // Adjust the path accordingly
import Header from './Header'; // Adjust the path accordingly
//import Footer from './Footer'; // Remember to import Footer as well
import './style.css'; // Assuming this is the correct path for your CSS

const Dictionary = () => {
  const [russianText, setRussianText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const translateText = async () => {
    try {
      const response = await axios.post('http://localhost:5000/translate', {
        russian_text: russianText
      });
      setTranslatedText(response.data.translated_text);
    } catch (error) {
      console.error('Error translating text:', error);
    }
  };

  const handleRussianTextChange = (event) => {
    setRussianText(event.target.value);
  };

  const handleCharacterClick = (character) => {
    setRussianText(russianText + character);
  };

  const handleKeyboardButtonClick = () => {
    setKeyboardVisible(!keyboardVisible);
  };

  return (
    <div className="dictionary-page">
      <Header />
      <div className="sidebar col-md-3 col-12">
        
        <a to="/home">Home</a>
        <Link to="/upload">Upload</Link>
        <Link to="/dictionary" className="active">Dictionary</Link> {/* Marked as active to indicate current page */}
        <Link to="/lens">Advision Lens</Link>
        <Link to="/training">Model Training</Link>
        <Link to="/logout">Logout</Link>
        <Link to="#about">About</Link>
      </div>

      <div className="content">
        <div className="container-fluid align-item-center mt-3">
          <div className='row'>
            <div className='col-md-12 align-item-center'>
              <h2>Dictionary Translation</h2>
              <p>Use this tool to translate text from Russian to English.</p> 
            </div>
            <div className="translation-section row align-item-center">
              <div className="text-area left col-lg-6">
                <textarea
                  className="textarea-input"
                  value={russianText}
                  onChange={handleRussianTextChange}
                  placeholder="Enter Russian text"
                />
                {keyboardVisible && <RussianKeyboard onCharacterClick={handleCharacterClick} />}
                <button className="keyboard-toggle-btn" onClick={handleKeyboardButtonClick}>
                  {keyboardVisible ? 'Hide Keyboard' : 'Show Keyboard'}
                </button>
              </div>
              <div className="text-area right col-lg-6">
                <textarea
                  className="textarea-output"
                  value={translatedText}
                  readOnly
                  placeholder="Translated English text"
                />
                <button className="translate-btn" onClick={translateText}>Translate</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default Dictionary;
