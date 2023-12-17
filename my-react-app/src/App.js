import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [translatedText, setTranslatedText] = useState('');

  useEffect(() => {
    fetchDocxFiles();
    fetchTranslatedText();
  }, []); // Fetch .docx files on component mount

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log(response.data);
      if (response.data && response.data.filename) {
        const fileUrl = `http://localhost:5000/uploads/${response.data.filename}`;
        setUploadedFileUrl(fileUrl);

        setUploadMessage(response.data.message);
        fetchTranslatedText();
      } else {
        setUploadMessage('Error: No file URL found in the response');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadMessage('Error uploading file');
    }
 
  };
const fetchDocxFiles = async () => {
    try {
        const response = await fetch('http://localhost:5000/list-docx-files'); // Update the URL to your Flask backend
        if (response.ok) {
            const data = await response.json();
            const docxFiles = data.docx_files;
            const downloadContainer = document.getElementById('downloadContainer');
            
            docxFiles.forEach(file => {
                const downloadLink = document.createElement('a');
                downloadLink.href = `http://localhost:5000/download/${file}`; // Update the URL to your Flask backend
                downloadLink.download = file;
                downloadLink.textContent = file;
                
		document.getElementById('downloadContainer').appendChild(downloadLink);
                document.getElementById('downloadContainer').appendChild(document.createElement('br'));
                
            });
        } else {
            console.error('Error fetching .docx files:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching .docx files:', error);
    }
};

        const fetchTranslatedText = async () => {
    try {
      const response = await axios.get('http://localhost:5000/translated-text');
      if (response && response.data && response.data.translated_text) {
        setTranslatedText(response.data.translated_text);
      }
    } catch (error) {
      console.error('Error fetching translated text:', error);
    }
  };

// Call the function to fetch and generate download links

  const renderFile = () => {
    if (uploadedFileUrl.endsWith('.jpg')) {
      return <img src={uploadedFileUrl} alt="Uploaded JPG" style={{ maxWidth: '100%', borderRadius: '5px' }} />;
    } else if (uploadedFileUrl.endsWith('.pdf')) {
      return <iframe src={uploadedFileUrl} title="Uploaded PDF" style={{ width: '100%', height: '500px', border: '1px solid #ccc' }} />;
    } else if (uploadedFileUrl.endsWith('.png')) {
      return <img src={uploadedFileUrl} alt="Uploaded PNG" style={{ maxWidth: '100%', borderRadius: '5px' }} />;
    } else {
      return <p>File type not supported for preview</p>;
    }
  };



  return (
<div className="App" style={{ textAlign: 'center', padding: '20px' }}>
  <h1 style={{ marginBottom: '20px', color: '#333' }}>Advisions Translation Tool</h1>
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <input type="file" onChange={handleFileChange} style={{ marginBottom: '20px' }} />
    <button
      onClick={handleUpload}
      style={{
        padding: '10px 20px',
        backgroundColor: '#61dafb',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
        outline: 'none',
        marginBottom: '20px',
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = '#4fa3d1';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = '#61dafb';
      }}
    >
      Upload
    </button>
    {uploadMessage && <p style={{ color: 'green', marginBottom: '20px' }}>{uploadMessage}</p>}
  </div>
  {uploadedFileUrl && (
    <div style={{ marginTop: '40px', textAlign: 'left' }}>
      <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>Uploaded File:</p>
      {renderFile()}
      {translatedText && (
        <div style={{ marginTop: '40px', textAlign: 'left' }}>
          <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>Translated Text:</p>
          <p>{translatedText}</p>
        </div>
      )}
      <div id="downloadContainer">
        <button
          onClick={fetchDocxFiles}
          style={{
            padding: '10px 20px',
            backgroundColor: '#61dafb',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
            outline: 'none',
            marginTop: '20px',
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#4fa3d1';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#61dafb';
          }}
        >
          Download Uploaded File
        </button>
      </div>
    </div>
  )}
</div>


  );
};
export default App;
