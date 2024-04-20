import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Header from "./Header"; // Adjust the path accordingly
//import Footer from './Footer';
import "./Upload.css";
import './style.css';

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadedFileUrl, setUploadedFileUrl] = useState("");
  const [russianText, setRussianText] = useState(""); // New state to store Russian text
  const [translatedText, setTranslatedText] = useState(""); // New state to store translated English text
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
    formData.append("file", selectedFile);

    try {
      const response = await axios.post(
        "http://localhost:5000/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (response.data && response.data.filename) {
        const fileUrl = `http://localhost:5000/uploads/${response.data.filename}`;
        setUploadedFileUrl(fileUrl);
        setRussianText(response.data.russian_text); // Update Russian text state
        setTranslatedText(response.data.translated_text); // Update translated English text state
        //setUploadMessage(response.data.message);

        // Display the extracted Russian text
        //console.log('Russian Text:', response.data.russian_text);
      } else {
        setUploadMessage("Error: No file URL found in the response");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadMessage("Error uploading file");
    }
  };

  const fetchDocxFiles = async () => {
    try {
      const response = await fetch("http://localhost:5000/list-docx-files", {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const docxFiles = data.docx_files;
        const downloadContainer = document.getElementById("downloadContainer");

        docxFiles.forEach((file) => {
          const downloadLink = document.createElement("a");
          downloadLink.href = `http://localhost:5000/download/${file}`;
          downloadLink.download = file;
          downloadLink.textContent = file;

          downloadContainer.appendChild(downloadLink);
          downloadContainer.appendChild(document.createElement("br"));
        });
      } else {
        console.error("Error fetching .docx files:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching .docx files:", error);
    }
  };

  const renderFile = () => {
    if (typeof uploadedFileUrl !== 'string') {
      return <p>Invalid file URL</p>;
    }
  
    const lowerCaseUrl = uploadedFileUrl.toLowerCase();
  
    if (lowerCaseUrl.endsWith('.jpg') || lowerCaseUrl.endsWith('.jpeg') || lowerCaseUrl.endsWith('.gif') || lowerCaseUrl.endsWith('.bmp') || lowerCaseUrl.endsWith('.tiff') || lowerCaseUrl.endsWith('.raw') || lowerCaseUrl.endsWith('.tif')) {
      return (
        <img
          src={uploadedFileUrl}
          alt="Uploaded Image"
          style={{ maxWidth: "100%", borderRadius: "5px" }}
        />
      );
    } else if (lowerCaseUrl.endsWith(".pdf")) {
      return (
        <iframe
          src={uploadedFileUrl}
          title="Uploaded PDF"
          style={{ width: "100%", height: "500px", border: "1px solid #ccc" }}
        />
      );
    } else if (lowerCaseUrl.endsWith(".png")) {
      return (
        <img
          src={uploadedFileUrl}
          alt="Uploaded PNG"
          style={{ maxWidth: "100%", borderRadius: "5px" }}
        />
      );
    } else {
      return <p>File type not supported for preview</p>;
    }
  };

  return (
    <div>
      <Header />

      <div className="sidebar">
        <a href="/">Home</a>
        <Link to="/upload" className="active">Upload</Link>
        <Link to="/dictionary">Dictionary</Link>
        <Link to="/lens">Advision Lens</Link>
        <Link to="/training">Model Training</Link>
        <a href="/logout">Logout</a>
        
        <a href="#about">About</a>
      </div>

      <div className="containder-fluid text-center align-item-center mt-3">
        <h1>Welcome Advisions Translation Tool</h1>
        <div className="input-group custom-file-button">
          <input
            type="file"
            onChange={handleFileChange}
            className="form-control text-center align-item-center"
            id="inputGroupFile"
            style={{ marginBottom: "20px" }}
          />
        </div>
        <button onClick={handleUpload}>Upload</button>
        {uploadMessage && (
          <p style={{ color: "green", marginBottom: "20px" }}>
            {uploadMessage}
          </p>
        )}

        {uploadedFileUrl && (
          <div className="containder-fluid text-center align-item-center">
          <p style={{ marginTop: "40px", textAlign: "left" }}></p>
            <p style={{ marginBottom: "10px", fontWeight: "bold" }}>
              Uploaded File:
            </p>
            {renderFile()}

            <div style={{ marginTop: "20px", display: "flex", flexDirection: "column" }}>
              <div>
                <p style={{ fontWeight: "bold" }}>Russian Text:</p>
                <p>{russianText}</p>
              </div>
              <div>
                <p style={{ fontWeight: "bold" }}>Translated Text:</p>
                <p>{translatedText}</p>
              </div>
            </div>

            <div id="downloadContainer">
              <button
                onClick={fetchDocxFiles}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#61dafb",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  transition: "background-color 0.3s ease",
                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                  outline: "none",
                  marginTop: "20px",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#4fa3d1";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#61dafb";
                }}
              >
                Download Translated File
              </button>
            </div>
          </div>
        )}
      </div>
      {/* <Footer /> */}
    </div>
  );
};
export default Upload;
