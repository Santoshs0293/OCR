import torch
from torch.nn import CrossEntropyLoss
from transformers import MarianMTModel, MarianTokenizer
from transformers import MarianConfig
from torch.utils.data import Dataset, DataLoader
import pandas as pd
import os
import shutil  # Import shutil for file operations

# Define your dataset class
class CustomDatasetFromCSV(Dataset):
    def __init__(self, csv_file, tokenizer, max_length):
        self.data = pd.read_csv(csv_file)
        self.tokenizer = tokenizer
        self.max_length = max_length
        
    def __len__(self):
        return len(self.data)
    
    def __getitem__(self, idx):
        russian_text = str(self.data.iloc[idx, 0])  # Assuming Russian text is in the first column
        english_text = str(self.data.iloc[idx, 1])  # Assuming English text is in the second column
        labels = str(self.data.iloc[idx, 2])  # Assuming labels are in the third column
        
        # Tokenize and encode the texts
        encoding = self.tokenizer(russian_text, english_text, 
                                  max_length=self.max_length, 
                                  padding="max_length", 
                                  truncation=True, 
                                  return_tensors="pt")
        
        label_encoding = self.tokenizer(labels, 
                                        max_length=self.max_length, 
                                        padding="max_length", 
                                        truncation=True, 
                                        return_tensors="pt")
        
        return {
            "input_ids": encoding["input_ids"].flatten(),
            "attention_mask": encoding["attention_mask"].flatten(),
            "labels": label_encoding["input_ids"].flatten()  
        }

def train_model(csv_path, progress_callback=None):
    # Define paths and model parameters
    fine_tuning_data_csv = csv_path
    model_name = "Helsinki-NLP/opus-mt-ru-en"
    max_length = 512
    
    # Initialize tokenizer and model config
    tokenizer = MarianTokenizer.from_pretrained(model_name)
    config = MarianConfig.from_pretrained(model_name)
    config.max_length = max_length
    config.num_beams = 6
    config.bad_words_ids = [[tokenizer.pad_token_id]]
    config.forced_eos_token_id = tokenizer.pad_token_id
    
    # Initialize the model
    model = MarianMTModel.from_pretrained(model_name, config=config)
    
    # Create dataset from CSV
    train_dataset_from_csv = CustomDatasetFromCSV(fine_tuning_data_csv, tokenizer, max_length)
    
    # Training parameters
    batch_size = 4
    num_epochs = 3
    learning_rate = 5e-5
    optimizer = torch.optim.AdamW(model.parameters(), lr=learning_rate)
    criterion = CrossEntropyLoss(ignore_index=tokenizer.pad_token_id)
    total_steps = len(train_dataset_from_csv) * num_epochs
    
    # Temporary directory to save the model during training
    temp_output_dir = "./temp_fine_tuned_model"
    
    # Training loop
    try:
        for epoch in range(num_epochs):
            model.train()
            for step, batch in enumerate(DataLoader(train_dataset_from_csv, batch_size=batch_size, shuffle=True)):
                optimizer.zero_grad()
                input_ids = batch["input_ids"]
                attention_mask = batch["attention_mask"]
                labels = batch["labels"]
                outputs = model(input_ids=input_ids, attention_mask=attention_mask, decoder_input_ids=labels)
                logits = outputs.logits
                loss = criterion(logits.view(-1, logits.shape[-1]), labels.view(-1))
                loss.backward()
                optimizer.step()
                
                # Callback for training progress
                if progress_callback:
                    progress = int((step + epoch * len(train_dataset_from_csv)) / total_steps * 100)
                    progress_callback(progress)
        
        # Move the trained model to the provided folder if training is successful
        if os.path.exists(temp_output_dir):
            shutil.move(temp_output_dir, "./fine_tuned_model")
        
    except Exception as e:
        print("An error occurred during training:", e)
        # If there's an error, delete the temporary folder
        if os.path.exists(temp_output_dir):
            shutil.rmtree(temp_output_dir)

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        csv_path = sys.argv[1]
        train_model(csv_path)
    else:
        print("No input files provided.")
