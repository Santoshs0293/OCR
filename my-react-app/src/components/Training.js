import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Header from "./Header"; // Adjust the path accordingly
//import Footer from './Footer';
import "./Upload.css";
import './style.css';

const Training = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadedFileUrl, setUploadedFileUrl] = useState("");
  const [userToken, setUserToken] = useState(null);
  const [trainingProgress, setTrainingProgress] = useState(0);
 
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", selectedFile);
  
    try {
      const response = await axios.post(
        "http://localhost:5000/upload_csv",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
    
      if (response.data && response.data.file_url) { // Check for file_url in the response
        const fileUrl = response.data.file_url; // Retrieve file_url from the response
        setUploadedFileUrl(fileUrl);
        setUploadMessage("File uploaded and processed successfully");
        // Start fetching training progress after successful upload
        fetchTrainingProgress();
      } else {
        setUploadMessage("Error: No file URL found in the response");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadMessage("Error uploading file");
    }    
  };

  const fetchTrainingProgress = async () => {
    try {
      const response = await axios.get("http://localhost:5000/training-progress");
      if (response.data && response.data.progress) {
        setTrainingProgress(response.data.progress);
      }
    } catch (error) {
      console.error("Error fetching training progress:", error);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(fetchTrainingProgress, 5000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      <Header />
      <div className="sidebar">
        <a href="/">Home</a>
        <Link to="/upload">Upload</Link>
        <Link to="/dictionary">Dictionary</Link>
        <Link to="/lens">Advision Lens</Link>
        <Link to="/training" className="active">Model Training</Link>
        <a href="/logout">Logout</a>
        <a href="#about">About</a>
      </div>
      <div className="container-fluid text-center align-item-center mt-3">
        <h1>Welcome Advisions Model Training Tool</h1>
        <h6>CSV file formate: column_1 (index), column_2  (russian_text), column_3  (english_text)</h6>
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
        {uploadMessage && <p style={{ color: "green", marginBottom: "20px" }}>{uploadMessage}</p>}
        <p>Training Progress: {trainingProgress}%</p>
      </div>
    </div>
  );
};

export default Training;
