from PIL import Image, ImageEnhance, ImageFilter
from pdf2image import convert_from_path
import pytesseract
from fpdf import FPDF
import subprocess
import os
from docx import Document
from concurrent.futures import ProcessPoolExecutor, as_completed
import sys
from pathlib import Path

# Set TESSDATA_PREFIX environment variable
os.environ['TESSDATA_PREFIX'] = '/home/santosh/Downloads/website/translator_app_bittoo/ocr_all/backend/tessdata/tessdata-main'

# Function to convert DOC to PDF using LibreOffice
def convert_doc_to_pdf(doc_path, pdf_path):
    subprocess.run(['libreoffice', '--convert-to', 'pdf', '--outdir', os.path.dirname(pdf_path), doc_path])

# Function to convert PDF to images
def convert_pdf_to_images(pdf_path):
    images = convert_from_path(pdf_path)
    return images

# Function to extract text from image with automatic language detection
def extract_text_from_image(image):
    text = pytesseract.image_to_string(image)
    return text

# Function to extract text from different file formats with automatic language detection
def extract_text_from_file(file_path):
    text = ""
    file_path_lower = file_path.lower()  # Use a lower case version of file_path to simplify checks

    if file_path_lower.endswith(('.jpg', '.png', '.jpeg', '.gif', '.bmp', '.tiff', '.tif', '.pdf')):
        try:
            if file_path_lower.endswith('.pdf'):
                images = convert_pdf_to_images(file_path)
                for img in images:
                    img_text = extract_text_from_image(img)
                    text += img_text + "\n"  # Add a newline between pages
            else:
                image = Image.open(file_path)
                text = extract_text_from_image(image)
        except Exception as e:
            text = "Failed to process file: " + str(e)
            print(text)  # More detailed error printout
    else:
        text = "Unsupported file format."

    return text

# Function to preprocess image for better OCR results
def preprocess_image(image):
    """Enhance image for better OCR results."""
    image = image.convert('L')  # Convert to grayscale
    image = image.filter(ImageFilter.MedianFilter(size=3))  # Apply a median filter
    enhancer = ImageEnhance.Contrast(image)
    image = enhancer.enhance(2)  # Increase contrast
    enhancer = ImageEnhance.Sharpness(image)
    image = enhancer.enhance(2)  # Increase sharpness
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

# Function to clean string for XML compatibility
def valid_xml_char_ordinal(c):
    codepoint = ord(c)
    # conditions ordered by presumed frequency
    return (
        0x20 <= codepoint <= 0xD7FF or
        codepoint in (0x9, 0xA, 0xD) or
        0xE000 <= codepoint <= 0xFFFD or
        0x10000 <= codepoint <= 0x10FFFF
    )

def clean_string_for_xml(input_string):
    return ''.join(c for c in input_string if valid_xml_char_ordinal(c))

# Function to process a single file
def process_file(input_path):
    try:
        ocr_text = handle_input(input_path)
        cleaned_ocr_text = clean_string_for_xml(ocr_text)
        output_folder = 'Download'
        if not os.path.exists(output_folder):
            os.makedirs(output_folder)
        else:
            clear_folder(output_folder)  # Clear existing files in the folder

        output_file_name = f"output_{os.path.basename(input_path)}.docx"
        output_path = os.path.join(output_folder, output_file_name)
        create_docx(cleaned_ocr_text, output_path)
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
