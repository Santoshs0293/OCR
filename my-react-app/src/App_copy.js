import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');

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
      // Set the uploaded file URL based on file type
      if (response.data.fileType.startsWith('image/')) {
        setUploadedFileUrl(response.data.fileUrl); // For image files
      } else if (response.data.fileType === 'application/pdf') {
        setUploadedFileUrl(response.data.fileUrl); // For PDF files
      }

      // Do something with the response, e.g., display success message
      setUploadMessage('File uploaded successfully'); 
    } catch (error) {
      console.error('Error uploading file:', error);
      // Handle error, e.g., display error message
      setUploadMessage('Error uploading file'); 
    }
  };


const renderFile = () => {
    if (uploadedFileUrl.startsWith('data:image')) {
      return <img src={uploadedFileUrl} alt="Uploaded" style={{ maxWidth: '100%' }} />;
    } else if (uploadedFileUrl.endsWith('.pdf')) {
      return <iframe src={uploadedFileUrl} title="Uploaded PDF" width="100%" height="500px" />;
    } else {
      return <p>File type not supported for preview</p>;
    }
  };


  return (
    <div className="App">
      <h1>File Upload</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      {uploadMessage && <p>{uploadMessage}</p>}
      {uploadedFileUrl && (
        <div>
          <p>Uploaded File:</p>
          {renderFile()}
        </div>
      )}
    </div>
  );
}

export default App;
