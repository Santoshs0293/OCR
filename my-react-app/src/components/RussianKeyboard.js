import React from 'react';

const RussianKeyboard = ({ onCharacterClick }) => {
  // Array of Russian characters and keyboard buttons
  const keyboardLayout = [
    ['ё', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
    ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ъ'],
    ['ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э', 'Enter'],
    ['Shift', 'я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю', '.', 'Shift'],
    ['Ctrl', 'Win', 'Alt', 'Space', 'Alt', 'Win', 'Ctrl']
  ];

  // Function to handle character click on virtual keyboard
  const handleCharacterClick = (key) => {
    if (key === 'Shift') {
      // Toggle shift state
      keyboardLayout.forEach(row => {
        row.forEach((char, index) => {
          if (index !== 0 && index !== row.length - 1) {
            row[index] = char === char.toLowerCase() ? char.toUpperCase() : char.toLowerCase();
          }
        });
      });
    } else {
      onCharacterClick(key);
    }
  };

  // Styles for the keyboard and buttons
  const keyboardStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '20px'
  };

  const rowStyle = {
    display: 'flex',
    justifyContent: 'center'
  };

  const buttonStyle = {
    padding: '10px 15px',
    margin: '5px',
    backgroundColor: '#4A90E2', // A nice blue
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  };

  const specialKeyStyle = {
    ...buttonStyle,
    backgroundColor: '#F5A623' // A different color for special keys like Shift, Ctrl, etc.
  };

  return (
    <div style={keyboardStyle} className="keyboard">
      {keyboardLayout.map((row, rowIndex) => (
        <div key={rowIndex} style={rowStyle} className="keyboard-row">
          {row.map((key, keyIndex) => (
            <button
              key={keyIndex}
              style={key === 'Shift' || key === 'Ctrl' || key === 'Alt' || key === 'Space' || key === 'Enter' ? specialKeyStyle : buttonStyle}
              onClick={() => handleCharacterClick(key)}
            >
              {key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

export default RussianKeyboard;
