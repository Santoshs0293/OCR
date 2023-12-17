## print not as whole, but para by para
#working on image also
# working on folder
#multi processing, only issue is processing only some files not all 
#process folderwise translation
# process all file , text , folder with while loop

from PIL import Image, ImageOps, ImageFilter
from pdf2image import convert_from_path
from transformers import MarianMTModel, MarianTokenizer
import pytesseract
from fpdf import FPDF
import pyttsx3
#import objc
import os
import numpy as np
import cv2
#import easyocr
from concurrent.futures import ProcessPoolExecutor, as_completed
from docx import Document
import sys
import shutil

# Function to convert DOC to PDF using LibreOffice
def convert_doc_to_pdf(doc_path, pdf_path):
    subprocess.run(['libreoffice', '--convert-to', 'pdf', '--outdir', os.path.dirname(pdf_path), doc_path])

# Function to convert PDF to text
def convert_pdf_to_text(pdf_path):
    images = convert_from_path(pdf_path)
#    tessdata_dir = "/opt/homebrew/bin/tesseract"
    pdf_text = ""
    for image in images:
        pdf_text += pytesseract.image_to_string(image, lang='rus')
    return pdf_text

def apply_opencv(image_path):
    # Open the image using OpenCV
    img = cv2.imread(image_path)
    img = normalize_image(img)
    img = deskew(img)
    img = remove_noise(img)
    img = perform_thinning(img)
    # Convert the image to grayscale
    # gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    processed_text = pytesseract.image_to_string(Image.fromarray(img), lang='rus')

    return processed_text
def apply_image_opencv(image_path):
    # Open the image using OpenCV
    img = cv2.imread(image_path)
    img = normalize_image(img)
    img = deskew(img)
    img = remove_noise(img)
    img = perform_thinning(img)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    return gray

def perform_thinning(image):
    # Convert the image to grayscale if it's not already
    if len(image.shape) == 3 and image.shape[2] == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image

    print("Grayscale Image Shape:", gray.shape)

    # Apply binary thresholding
    _, binary_image = cv2.threshold(gray, 128, 255, cv2.THRESH_BINARY)
    print("Binary Image Shape:", binary_image.shape)

    # Ensure the image is single-channel
    if len(binary_image.shape) == 3:
        binary_image = cv2.cvtColor(binary_image, cv2.COLOR_BGR2GRAY)

    # Apply morphological operations for thinning
    kernel = np.ones((3, 3), np.uint8)
    thinning_image = cv2.morphologyEx(binary_image, cv2.MORPH_HITMISS, kernel)
    print("Thinning Image Shape:", thinning_image.shape)

    return thinning_image

def normalize_image(image):
    # Example normalization: transpose based on EXIF data
    img = cv2.normalize(image, None, 0, 255, cv2.NORM_MINMAX)
    return img
def remove_noise(image):
    # Convert the OpenCV image to PIL.Image
    pil_image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
    
    # Example remove_noise: apply smoothing filter
    pil_image = pil_image.filter(ImageFilter.SMOOTH)
    
    # Convert the PIL.Image back to OpenCV format
    image_with_noise_removed = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
    
    return image_with_noise_removed

def deskew(image):
    try:
        # Convert the image to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Convert the image to binary format using adaptive thresholding
        _, binary_image = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        # Find coordinates of non-zero pixels in the binary image
        co_ords = np.column_stack(np.where(binary_image > 0))

        # Calculate the angle using cv2.minAreaRect
        angle = cv2.minAreaRect(co_ords)[-1]

        if angle < -45:
            angle = -(90 + angle)
        else:
            angle = -angle

        # Rotate the image
        (h, w) = image.shape[:2]
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        rotated = cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

        return rotated
    except Exception as e:
        print(f"Error in deskew: {e}")
        return image

def apply_easyocr(image_path):
    # Create an EasyOCR reader for the Russian language
    reader = easyocr.Reader(['ru'])

    # Perform OCR using EasyOCR
    image= apply_image_opencv(image_path)
    result = reader.readtext(image_path)

    # Extract text from the result
    text = ' '.join([entry[1] for entry in result])

    return text

def text_to_speech_gtts(text, lang):
    tts = gTTS(text=text, lang=lang)
    tts.save("output.mp3")
    os.system("open output.mp3")  # This command is for macOS. You can adjust it based on your operating system.

def text_to_speech_ru(text, lang='ru'):
    # Initialize the text-to-speech engine
    engine = pyttsx3.init()

    # Set properties (optional)
    engine.setProperty('rate', 150)  # Speed of speech
    engine.setProperty('volume', 0.9)  # Volume level (0.0 to 1.0)

    # Get the list of available voices
    voices = engine.getProperty('voices')

    # Set the voice based on the provided language
    for voice in voices:
        if lang.lower() in voice.languages[0].lower():
            engine.setProperty('voice', voice.id)
            break

    # Speak the given text
    engine.say(text)

    # Wait for the speech to finish
    engine.runAndWait()

def text_to_speech_en(text, lang='en'):
    # Initialize the text-to-speech engine
    engine = pyttsx3.init(driverName='nsss')

    # Set properties (optional)
    engine.setProperty('rate', 170)  # Speed of speech
    engine.setProperty('volume', 1.0)  # Volume level (0.0 to 1.0)

    # Get the list of available voices
    voices = engine.getProperty('voices')

    # Set the voice based on the provided language
#    for voice in voices:
#        if lang.lower() in voice.languages[0].lower():
#            engine.setProperty('voice', voice.id)
#            break
    engine.setProperty('voice', voices[1].id)
    # Speak the given text
    engine.say(text)

    # Wait for the speech to finish
    engine.runAndWait()

# Function to perform OCR on an image
class EmptyOCRResultError(Exception):
    pass
def check_and_apply_easyocr(processed_text, image_path):
    # Check if processed_text is empty or contains very few words
    if not processed_text or len(processed_text.split()) < 5:
        # Check if a single word count is more than 20% of the total words
        word_count = {}
        for word in processed_text.split():
            word_count[word] = word_count.get(word, 0) + 1

        total_words = len(processed_text.split())
        max_word_count = max(word_count.values(), default=0)

        if max_word_count > 0.2 * total_words:
            print("A single word appears more than 20% of the total words. Using EasyOCR for further processing.")
            return apply_easyocr(image_path)
    else:
        print("Processing met the condition. Using the result.")
        return processed_text

def perform_ocr(image_path):
    try:
        # Attempt OCR using Tesseract
#        initial_text = pytesseract.image_to_string(Image.open(image_path), lang='rus')
        initial_text = apply_opencv(image_path)
        # Check if the initial OCR result is empty or contains very few words
        if not initial_text or len(initial_text.split()) < 5:
            print("Initial OCR result is empty or contains very few words. Using OpenCV for further processing.")
            processed_text = apply_easyocr(image_path)

            # Call the check_and_apply_easyocr function
            processed_text = check_and_apply_easyocr(processed_text, image_path)
        else:
            print("Tesseract successfully detected text.")
            processed_text = initial_text

        return processed_text
    except pytesseract.pytesseract.TesseractError as e:
        print(f"TesseractError: {e}")

        # Tesseract error occurred, use OpenCV or EasyOCR based on the error type
        if "Corrupt JPEG data" in str(e):
            print("Corrupt JPEG data error detected. Using OpenCV for further processing.")
            processed_text = apply_opencv(image_path)

            # Call the check_and_apply_easyocr function
            processed_text = check_and_apply_easyocr(processed_text, image_path)
        else:
            print("Other Tesseract error detected. Using EasyOCR for further processing.")
            processed_text = apply_easyocr(image_path)

        return processed_text

def translate_russian_to_english_long_text(long_text, max_length=512):
    model_name = "Helsinki-NLP/opus-mt-ru-en"
    model = MarianMTModel.from_pretrained(model_name)
    tokenizer = MarianTokenizer.from_pretrained(model_name)

    # Split the long text into paragraphs
    paragraphs = [paragraph.strip() for paragraph in long_text.split('.') if paragraph.strip()]

    # Translate each paragraph
    translated_paragraphs = []
    for i, paragraph in enumerate(paragraphs):
#        print(f"Original Russian Paragraph {i + 1}: {paragraph}")
        inputs = tokenizer(paragraph, return_tensors="pt", truncation=True)
        translation_ids = model.generate(**inputs, max_length=max_length)
        translation = tokenizer.decode(translation_ids[0], skip_special_tokens=True)
#        print(f"Translated English Paragraph {i + 1}: {translation}")
        translated_paragraphs.append(translation)

    # Combine translated paragraphs
    final_translation = ". ".join(translated_paragraphs)
    return final_translation

# Function to handle different input types (image, PDF, DOC)
def handle_input(input_path):
    if input_path.endswith(('.jpg', '.jpeg', '.png', '.gif')):
        # If it's an image, perform OCR
        return perform_ocr(input_path)
    elif input_path.endswith('.pdf'):
        # If it's a PDF, convert it to text
        return convert_pdf_to_text(input_path)
    elif input_path.endswith(('.doc', '.docx')):
        # If it's a DOC file, convert it to PDF and then to text
        temp_pdf_path = "temp.pdf"
        convert_doc_to_pdf(input_path, temp_pdf_path)
        text_from_doc = convert_pdf_to_text(temp_pdf_path)
        os.remove(temp_pdf_path)  # Remove temporary PDF file
        return text_from_doc
    else:
        raise ValueError("Unsupported file type")
def create_docx(translated_text, output_path):
    doc = Document()
    doc.add_paragraph(translated_text)

    # Save the DOCX to the specified output path
    doc.save(output_path)

def create_pdf(translated_text, output_path):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.multi_cell(0, 10, translated_text)

    # Save the PDF to the specified output path
    pdf.output(output_path)

from concurrent.futures import ProcessPoolExecutor, as_completed

def process_text(input_text):
    print("Processing text:")
    
    # Translate the input text from Russian to English
    translated_text = translate_russian_to_english_long_text(input_text)
    print(f"Translated Text:\n{translated_text}")
#    text_to_speech_ru(input_text)
    text_to_speech_en(translated_text)



# Function to create the output folder
def create_output_folder():
    output_folder = 'Download'
    if os.path.exists(output_folder):
        shutil.rmtree(output_folder)  # Remove the existing output folder and its contents
    os.makedirs(output_folder)  # Create a new output folder
    return output_folder



def process_file(input_path):
    print(f"Processing file: {input_path}")

    try:
        # Extract text using OCR
        ocr_text = handle_input(input_path)
        print(f"RUSSIAN Text:\n{ocr_text}")
        # Translate the extracted text from Russian to English
        translated_text = translate_russian_to_english_long_text(ocr_text)
        output_folder = create_output_folder()
        output_file_name = f"output_{os.path.basename(input_path)}.docx"
        # Create a PDF from the final translated text
        output_path = os.path.join(output_folder, output_file_name)
        create_docx(translated_text, output_path)
#        print(f"ENGLISH Text:\n{translated_text}")
        print(f"File processed: {input_path}")
        print(f"Output PDF: {output_path}")
#        text_to_speech_en(translated_text) 
        return True  # You can also return some relevant information if needed
    except Exception as e:
        print(f"Error processing file {input_path}: {e}")
        return False


def process_files(input_paths):
    results = []
    with ProcessPoolExecutor() as executor:
        futures = {executor.submit(process_file, input_path): input_path for input_path in input_paths}

        for future in as_completed(futures):
            input_path = futures[future]
            try:
                result = future.result()
                results.append(result)
            except Exception as e:
                print(f"Error processing file {input_path}: {e}")
                results.append((input_path, False))

    return results

if __name__ == "__main__":
    # Check if a file path is provided as a command-line argument
    if len(sys.argv) > 1:
        input_path = sys.argv[1]
        if os.path.isfile(input_path):
            process_file(input_path)  # Call the process_file function with the provided path
        else:
            print("Error: The provided path is not a valid file.")
