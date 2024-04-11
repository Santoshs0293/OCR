import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Header from "./Header"; // Adjust the path accordingly
import Footer from './Footer';
import "./Upload.css";
import './style.css';

const Lens = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadedFileUrl, setUploadedFileUrl] = useState("");
  //const [russianText, setRussianText] = useState(""); // New state to store Russian text
  //const [translatedText, setTranslatedText] = useState(""); // New state to store translated English text
  const [outputImageUrl, setOutputImageUrl] = useState("");
  
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    if (userToken) {
      fetchJpgFile();
    }
  }, [userToken]); // Fetch .jpg file when userToken changes

  useEffect(() => {
    if (uploadedFileUrl) {
      fetchJpgFile(); // Automatically fetch the JPG files when the uploadedFileUrl changes
    }
  }, [uploadedFileUrl]); // Fetch .jpg file when uploadedFileUrl changes

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post(
        "http://localhost:5000/upload1",
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
        setOutputImageUrl(response.data.outputImageUrl);
        setUploadMessage(response.data.message);
        
      } else {
        setUploadMessage("Error: No file URL found in the response");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadMessage("Error uploading file");
    }
  };

  
  
  const fetchJpgFile = async () => {
    try {
      const response = await fetch("http://localhost:5000/list-jpg-file", {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const jpgFile = data.jpg_file;
        const downloadContainer = document.getElementById("downloadContainer");
        const imageContainer = document.getElementById("imageContainer");

        jpgFile.forEach((file) => {
          const img = document.createElement("img");
          img.src = `http://localhost:5000/download/${file}`;
          img.alt = file;
          img.style.maxWidth = "100%";
          img.style.borderRadius = "5px";

          imageContainer.appendChild(img);
          imageContainer.appendChild(document.createElement("br"));

          const downloadLink = document.createElement("a");
          downloadLink.href = `http://localhost:5000/download/${file}`;
          downloadLink.download = file;
          downloadLink.textContent = file;

          downloadContainer.appendChild(downloadLink);
          downloadContainer.appendChild(document.createElement("br"));
          
          
        });
      } else {
        console.error("Error fetching .jpg file:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching .jpg file:", error);
    }
  };


  const renderFile = () => {
    if (uploadedFileUrl.endsWith(".jpg")) {
      return (
        <img
          src={uploadedFileUrl}
          alt="Uploaded JPG"
          style={{ maxWidth: "100%", borderRadius: "5px" }}
        />
      );
    } else if (uploadedFileUrl.endsWith(".pdf")) {
      return (
        <iframe
          src={uploadedFileUrl}
          title="Uploaded PDF"
          style={{ width: "100%", height: "500px", border: "1px solid #ccc" }}
        />
      );
    } else if (uploadedFileUrl.endsWith(".png")) {
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
        <a href="/upload">Upload</a>
        <a href="/dictionary">Dictionary</a>
        <a href="/lens" className="active">Advision Lens</a> 
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
          {/* <p style={{ marginTop: "40px", textAlign: "left" }}></p> */}
            
          <div className="container1">

            <div className="row">
              <div className="col">
              <p>Uploaded File</p>
              <div className="container1">
                
                  {renderFile()}
              </div>
              </div>
              
              <div className="col">
              <p>Processed image</p>
              <div className="container1">
              
              <div id="imageContainer"></div>
            </div>
            </div>
          </div>
              
            </div>
            <div id="downloadContainer">
            
           
              <button
                onClick={fetchJpgFile}
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
export default Lens;
