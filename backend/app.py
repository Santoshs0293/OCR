from flask import Flask, request, jsonify, send_from_directory, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from argon2 import PasswordHasher
import secrets
import os
import subprocess
import sys
from process_file1 import translate_russian_to_english

import time


app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
# Enable CORS for all routes

# Replace 'your_database_uri' with your PostgreSQL database URI
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://test:test@localhost/register'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

secret_key = secrets.token_hex(16)
app.secret_key = secret_key
  
db = SQLAlchemy(app)
ph = PasswordHasher()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

    def set_password(self, password):
        self.password_hash = ph.hash(password)

    def check_password(self, password):
        try:
            return ph.verify(self.password_hash, password)
        except Exception:
            return False


UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
DOWNLOAD_FOLDER = 'Download'  # Path to your download folder
app.config['DOWNLOAD_FOLDER'] = DOWNLOAD_FOLDER

# Create 'uploads' directory if it doesn't exist
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
def clear_uploads_folder():
    """Clears all files in the uploads folder."""
    folder_path = app.config['UPLOAD_FOLDER']
    for filename in os.listdir(folder_path):
        file_path = os.path.join(folder_path, filename)
        if os.path.isfile(file_path):
            os.remove(file_path)



@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400

    new_user = User(username=username)
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if user and user.check_password(password):
        # Store user id in the session
        session['user_id'] = user.id
        return jsonify({'message': 'Login successful'}), 200
    else:
        return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/logout', methods=['GET'])
def logout():
    # Clear the entire session
    session.clear()
    return jsonify({'message': 'Logout successful'}), 200


print("UPLOAD_FOLDER path:", app.config['UPLOAD_FOLDER'])
def process_uploaded_file(file_name):
    try:
        script_path = os.path.join(os.getcwd(), 'process_file.py')
        # Call your processing script here with the uploaded file path
        #subprocess.run(["/usr/bin/python3",  script_path, os.path.join(app.config['UPLOAD_FOLDER'], file_name)], check=True)
        result = subprocess.run(["/usr/bin/python3", script_path, os.path.join(app.config['UPLOAD_FOLDER'], file_name)], capture_output=True, text=True, check=True)
        russian_text = result.stdout.strip()

        return russian_text
               
        
    # Add any further processing or handling of the result if needed
    except subprocess.CalledProcessError as e:
        print(f"Error processing file: {e}")


@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'})

    if file:
        clear_uploads_folder()  # Clear old files
        filename = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filename)

        russian_text = process_uploaded_file(file.filename)

        if russian_text is not None:
            # Translate Russian text to English
            english_text = translate_russian_to_english(russian_text)

            # Return both texts to the frontend
            return jsonify({
                'message': 'File uploaded and processed successfully',
                'filename': file.filename,
                'russian_text': russian_text,
                'english_text': english_text
            })
        else:
            return jsonify({'error': 'Error processing file'})



@app.route('/api/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


@app.route('/api/list-docx-files', methods=['GET'])
def list_docx_files():
    docx_files = [f for f in os.listdir(app.config['DOWNLOAD_FOLDER']) if f.endswith('.docx')]
    return jsonify({'docx_files': docx_files})

@app.route('/api/list-jpg-file', methods=['GET'])
def list_jgp_file():
    jpg_file = [f for f in os.listdir(app.config['DOWNLOAD_FOLDER']) if f.endswith('.jpg')]
    return jsonify({'jpg_file': jpg_file})


@app.route('/api/download/<path:filename>', methods=['GET'])
def download(filename):
    try:
        return send_from_directory(app.config['DOWNLOAD_FOLDER'], filename, as_attachment=True)
    except FileNotFoundError:
        return jsonify({'error': 'File not found'}), 404


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5005) 