import os
import sys
from pathlib import Path

# Add the python_service directory to the Python path
SCRIPT_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(SCRIPT_DIR))

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader, Dataset
from transformers import BertTokenizer

from neuroscope import visualize

from ..training_hook import NeuroscopeTrainingHook


class SentimentAttention(nn.Module):
    def __init__(self, hidden_size):
        super().__init__()
        self.attention = nn.Linear(hidden_size, 1)
        self.output = None  # Store attention weights
    
    def forward(self, x):
        # x shape: (batch, seq_len, hidden_size)
        attention_weights = F.softmax(self.attention(x), dim=1)
        self.output = attention_weights  # Save for visualization
        attended = torch.bmm(attention_weights.transpose(1, 2), x)
        return attended.squeeze(1), attention_weights.squeeze(-1)

class SentimentAnalysisModel(nn.Module):
    def __init__(self, vocab_size=30522, embed_size=128, hidden_size=256, num_classes=2):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_size)
        self.lstm = nn.LSTM(embed_size, hidden_size, batch_first=True, bidirectional=True)
        self.attention = SentimentAttention(hidden_size * 2)
        self.classifier = nn.Linear(hidden_size * 2, num_classes)
        
    def forward(self, x, lengths):
        embedded = self.embedding(x)
        
        # Pack for LSTM
        packed = nn.utils.rnn.pack_padded_sequence(
            embedded, lengths.cpu(), batch_first=True, enforce_sorted=False
        )
        
        # LSTM
        lstm_out, _ = self.lstm(packed)
        lstm_out, _ = nn.utils.rnn.pad_packed_sequence(lstm_out, batch_first=True)
        
        # Attention
        attended, attention_weights = self.attention(lstm_out)
        
        # Classification
        logits = self.classifier(attended)
        
        return logits, attention_weights

class TweetDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_len=128):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_len = max_len
        
    def __len__(self):
        return len(self.texts)
    
    def __getitem__(self, idx):
        text = self.texts[idx]
        label = self.labels[idx]
        
        encoding = self.tokenizer(
            text,
            max_length=self.max_len,
            padding='max_length',
            truncation=True,
            return_tensors='pt'
        )
        
        return {
            'input_ids': encoding['input_ids'].squeeze(),
            'attention_mask': encoding['attention_mask'].squeeze(),
            'label': torch.tensor(label, dtype=torch.long)
        }

def train_model(model, train_loader, val_loader, num_epochs=5):
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = model.to(device)
    
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters())
    
    # Initialize Neuroscope visualization hook
    vis_hook = NeuroscopeTrainingHook(update_interval=10)
    
    for epoch in range(num_epochs):
        model.train()
        total_loss = 0
        correct = 0
        total = 0
        
        for batch in train_loader:
            input_ids = batch['input_ids'].to(device)
            attention_mask = batch['attention_mask'].to(device)
            labels = batch['label'].to(device)
            lengths = attention_mask.sum(dim=1)
            
            optimizer.zero_grad()
            logits, attention_weights = model(input_ids, lengths)
            loss = criterion(logits, labels)
            
            loss.backward()
            optimizer.step()
            
            total_loss += loss.item()
            
            # Calculate accuracy
            _, predicted = torch.max(logits, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()
            
            # Get attention patterns for visualization
            attention_pattern = attention_weights.detach().cpu().numpy().mean(0)
            
            # Update visualization
            vis_hook(
                model,
                loss.item(),
                epoch,
                accuracy=correct/total,
                custom_metrics={
                    'attention_entropy': float(-np.sum(
                        attention_pattern * np.log(attention_pattern + 1e-10)
                    ))
                }
            )
        
        # Validation
        model.eval()
        val_loss = 0
        val_correct = 0
        val_total = 0
        
        with torch.no_grad():
            for batch in val_loader:
                input_ids = batch['input_ids'].to(device)
                attention_mask = batch['attention_mask'].to(device)
                labels = batch['label'].to(device)
                lengths = attention_mask.sum(dim=1)
                
                logits, _ = model(input_ids, lengths)
                loss = criterion(logits, labels)
                
                val_loss += loss.item()
                
                _, predicted = torch.max(logits, 1)
                val_total += labels.size(0)
                val_correct += (predicted == labels).sum().item()
        
        print(f'Epoch {epoch+1}:')
        print(f'  Train Loss: {total_loss/len(train_loader):.4f}')
        print(f'  Train Accuracy: {100*correct/total:.2f}%')
        print(f'  Val Loss: {val_loss/len(val_loader):.4f}')
        print(f'  Val Accuracy: {100*val_correct/val_total:.2f}%')

def main():
    # Initialize tokenizer
    tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
    
    # Example data (replace with real dataset)
    texts = [
        "This movie was amazing! I loved every minute of it.",
        "Terrible waste of time. Don't watch this movie.",
        # ... more examples ...
    ]
    labels = [1, 0]  # 1 for positive, 0 for negative
    
    # Create datasets
    dataset = TweetDataset(texts, labels, tokenizer)
    train_size = int(0.8 * len(dataset))
    val_size = len(dataset) - train_size
    train_dataset, val_dataset = torch.utils.data.random_split(dataset, [train_size, val_size])
    
    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=32)
    
    # Initialize model
    model = SentimentAnalysisModel()
    
    # Train model
    train_model(model, train_loader, val_loader)

if __name__ == '__main__':
    main() 