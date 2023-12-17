from flask import Flask, request, jsonify, send_from_directory, session
from flask_cors import CORS
import os
import sys  # Import subprocess to call the processing script
import subprocess
import secrets
import requests

from flask import Flask, render_template, redirect, url_for, session, flash
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired, Email, ValidationError
import bcrypt
import mysql.connector

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Replace with a secure secret key

# MySQL Configuration
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'Root@123'
app.config['MYSQL_DB'] = 'translation'

# Initialize MySQL connector
mysql = mysql.connector.connect(
    host=app.config['MYSQL_HOST'],
    user=app.config['MYSQL_USER'],
    password=app.config['MYSQL_PASSWORD'],
    database=app.config['MYSQL_DB']
)


class RegisterForm(FlaskForm):
    name = StringField("Name", validators=[DataRequired()])
    email = StringField("Email", validators=[DataRequired(), Email()])
    password = PasswordField("Password", validators=[DataRequired()])
    submit = SubmitField("Register")

    def validate_email(self, field):
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT * FROM users WHERE email=%s", (field.data,))
        user = cursor.fetchone()
        cursor.close()
        if user:
            raise ValidationError('Email Already Taken')

class LoginForm(FlaskForm):
    email = StringField("Email", validators=[DataRequired(), Email()])
    password = PasswordField("Password", validators=[DataRequired()])
    submit = SubmitField("Login")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    form = RegisterForm()
    if form.validate_on_submit():
        name = form.name.data
        email = form.email.data
        password = form.password.data

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        # store data into the database
        cursor = mysql.connection.cursor()
        cursor.execute("INSERT INTO users (name, email, password) VALUES (%s, %s, %s)", (name, email, hashed_password))
        mysql.connection.commit()
        cursor.close()

        return redirect(url_for('login'))

    return render_template('register.html', form=form)

@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        email = form.email.data
        password = form.password.data

        cursor = mysql.connection.cursor()
        cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
        user = cursor.fetchone()
        cursor.close()
        if user and bcrypt.checkpw(password.encode('utf-8'), user[3].encode('utf-8')):
            session['user_id'] = user[0]
            return redirect(url_for('dashboard'))
        else:
            flash("Login failed. Please check your email and password")
            return redirect(url_for('login'))

    return render_template('login.html', form=form)

@app.route('/dashboard')
def dashboard():
    if 'user_id' in session:
        user_id = session['user_id']

        cursor = mysql.connection.cursor()
        cursor.execute("SELECT * FROM users WHERE id=%s", (user_id,))
        user = cursor.fetchone()
        cursor.close()

        if user:
            return render_template('dashboard.html', user=user)

    return redirect(url_for('login'))

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    flash("You have been logged out successfully.")
    return redirect(url_for('login'))


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

