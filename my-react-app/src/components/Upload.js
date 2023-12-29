import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Upload.css';

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [userToken, setUserToken] = useState(null);


  useEffect(() => {
    if (userToken) {
      fetchDocxFiles();
    }
  }, [userToken]); // Fetch .docx files when userToken changes

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.data && response.data.filename) {
        const fileUrl = `http://localhost:5000/uploads/${response.data.filename}`;
        setUploadedFileUrl(fileUrl);
        setUploadMessage(response.data.message);
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
      const response = await fetch('http://localhost:5000/list-docx-files', {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const docxFiles = data.docx_files;
        const downloadContainer = document.getElementById('downloadContainer');

        docxFiles.forEach((file) => {
          const downloadLink = document.createElement('a');
          downloadLink.href = `http://localhost:5000/download/${file}`;
          downloadLink.download = file;
          downloadLink.textContent = file;

          downloadContainer.appendChild(downloadLink);
          downloadContainer.appendChild(document.createElement('br'));
        });
      } else {
        console.error('Error fetching .docx files:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching .docx files:', error);
    }
  };

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
    
      <div>
        <h1>Welcome Advision Translation Tool</h1>
        <input type="file" onChange={handleFileChange} style={{ marginBottom: '20px' }} />
        <button onClick={handleUpload}>Upload</button>
        {uploadMessage && <p style={{ color: 'green', marginBottom: '20px' }}>{uploadMessage}</p>}
  
        {uploadedFileUrl && (
          <div style={{ marginTop: '40px', textAlign: 'left' }}>
            <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>Uploaded File:</p>
            {renderFile()}
  
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
export default Upload;