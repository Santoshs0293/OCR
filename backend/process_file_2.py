from pdfplumber import open as open_pdf
import cv2
import pytesseract
from fpdf import FPDF
import subprocess
import os
from docx import Document
from concurrent.futures import ProcessPoolExecutor, as_completed
import sys
from pathlib import Path

# Set TESSDATA_PREFIX environment variable
os.environ['TESSDATA_PREFIX'] = '/home/santosh/Downloads/website/translator_app_bittoo/translate_all/backend/tessdata/tessdata-main'

# Function to convert DOC to PDF using LibreOffice
def convert_doc_to_pdf(doc_path, pdf_path):
    subprocess.run(['libreoffice', '--convert-to', 'pdf', '--outdir', os.path.dirname(pdf_path), doc_path])

# Function to extract text and bounding boxes from PDF using pdfplumber
def extract_text_and_bbox_from_pdf(pdf_path):
    texts_with_bbox = []
    with open_pdf(pdf_path) as pdf:
        for page in pdf.pages:
            for obj in page.extract_words():
                text = obj['text']
                bbox = obj['bbox']
                texts_with_bbox.append((text, bbox))
    return texts_with_bbox

# Function to extract text from image with OpenCV preprocessing
def extract_text_from_image(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    # Perform preprocessing if necessary
    # For example: gray = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]
    text = pytesseract.image_to_string(gray)
    return text

# Function to extract text from different file formats with automatic language detection
def extract_text_from_file(file_path):
    text = ""
    file_path_lower = file_path.lower()  # Use a lower case version of file_path to simplify checks

    if file_path_lower.endswith(('.jpg', '.png', '.jpeg', '.gif', '.bmp', '.tiff', '.tif')):
        try:
            image = cv2.imread(file_path)
            text = extract_text_from_image(image)
        except Exception as e:
            text = "Failed to process image: " + str(e)
            print(text)  # More detailed error printout

    elif file_path_lower.endswith('.pdf'):
        try:
            texts_with_bbox = extract_text_and_bbox_from_pdf(file_path)
            for text, _ in texts_with_bbox:
                text += text + "\n"  # Add a newline between pages
        except Exception as e:
            text = "Failed to process PDF: " + str(e)
            print(text)  # More detailed error printout

    else:
        text = "Unsupported file format."

    return text

# Function to preprocess image for better OCR results
def preprocess_image(image):
    """Placeholder function for image preprocessing."""
    return image

# Function to handle different input types (image, PDF)
def handle_input(input_path):
    if os.path.isfile(input_path):
        return extract_text_from_file(input_path)
    else:
        raise ValueError("Input path does not exist or is not a file.")

# Function to create a DOCX file from extracted text
def create_docx(text, output_path):
    doc = Document()
    doc.add_paragraph(text)
    doc.save(output_path)

# Function to clear all files in a folder
def clear_folder(folder_path):
    """Clears all files in the specified folder."""
    for filename in os.listdir(folder_path):
        file_path = os.path.join(folder_path, filename)
        if os.path.isfile(file_path):
            os.remove(file_path)

# Function to process a single file
def process_file(input_path):
    try:
        ocr_text = handle_input(input_path)
        output_folder = 'Download'
        if not os.path.exists(output_folder):
            os.makedirs(output_folder)
        else:
            clear_folder(output_folder)  # Clear existing files in the folder

        output_file_name = f"output_{os.path.basename(input_path)}.docx"
        output_path = os.path.join(output_folder, output_file_name)
        create_docx(ocr_text, output_path)
        print(f"File processed: {input_path}")
        print(f"Output DOCX: {output_path}")
    except Exception as e:
        print(f"Error processing file {input_path}: {e}")

# Function to process multiple files in parallel
def process_files(input_paths):
    with ProcessPoolExecutor() as executor:
        futures = [executor.submit(process_file, path) for path in input_paths]
        for future in as_completed(futures):
            if future.exception() is not None:
                print(f"Error processing file: {future.exception()}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        input_paths = sys.argv[1:]
        process_files(input_paths)
    else:
        print("No input files provided.")
