from flask import Flask, request, jsonify, send_from_directory, session
from flask_cors import CORS
import os
import sys  # Import subprocess to call the processing script
import subprocess
import secrets
import requests


app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

secret_key = secrets.token_hex(16)
app.secret_key = secret_key

UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
DOWNLOAD_FOLDER = 'Download'  # Path to your download folder
app.config['DOWNLOAD_FOLDER'] = DOWNLOAD_FOLDER

# Create 'uploads' directory if it doesn't exist
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

print("UPLOAD_FOLDER path:", app.config['UPLOAD_FOLDER'])
def process_uploaded_file(file_name):
    try:
        script_path = os.path.join(os.getcwd(), 'process_file.py')
        # Call your processing script here with the uploaded file path
        subprocess.run(["/usr/bin/python3",  script_path, os.path.join(app.config['UPLOAD_FOLDER'], file_name)], check=True)
        
        print(f"ENGLISH Text:\n{translated_text}")
               
        
# Add any further processing or handling of the result if needed
    except subprocess.CalledProcessError as e:
        print(f"Error processing file: {e}")


@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'})

    if file:
        filename = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filename)
        print(f"File '{file.filename}' uploaded successfully")
        
               
        file_url = f"http://localhost:5000/uploads/{file.filename}" 
        process_uploaded_file(file.filename)
        session['uploaded_file'] = file.filename
        return jsonify({'message': 'File uploaded successfully', 'filename': file.filename})



@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/list-docx-files', methods=['GET'])
def list_docx_files():
    docx_files = [f for f in os.listdir(app.config['DOWNLOAD_FOLDER']) if f.endswith('.docx')]
    return jsonify({'docx_files': docx_files})


@app.route('/download/<path:filename>', methods=['GET'])
def download(filename):
    try:
        return send_from_directory(app.config['DOWNLOAD_FOLDER'], filename, as_attachment=True)
    except FileNotFoundError:
        return jsonify({'error': 'File not found'}), 404


if __name__ == '__main__':
    app.run(debug=True)

