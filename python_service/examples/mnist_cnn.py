import os
import sys
from pathlib import Path

# Add the python_service directory to the Python path
SCRIPT_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(SCRIPT_DIR))

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader
from torchvision import datasets, transforms

from neuroscope import visualize


class SimpleCNN(nn.Module):
    """A simple CNN for MNIST classification.
    
    Architecture:
    - Conv1: 1->32 channels, 3x3 kernel
    - ReLU
    - Conv2: 32->64 channels, 3x3 kernel
    - ReLU
    - MaxPool: 2x2
    - Dropout: 0.25
    - Fully Connected: 9216->128
    - ReLU
    - Dropout: 0.5
    - Fully Connected: 128->10
    - LogSoftmax
    """
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(1, 32, 3, 1)
        self.conv2 = nn.Conv2d(32, 64, 3, 1)
        self.dropout1 = nn.Dropout(0.25)
        self.dropout2 = nn.Dropout(0.5)
        self.fc1 = nn.Linear(9216, 128)
        self.fc2 = nn.Linear(128, 10)

    def forward(self, x):
        x = self.conv1(x)
        x = F.relu(x)
        x = self.conv2(x)
        x = F.relu(x)
        x = F.max_pool2d(x, 2)
        x = self.dropout1(x)
        x = torch.flatten(x, 1)
        x = self.fc1(x)
        x = F.relu(x)
        x = self.dropout2(x)
        x = self.fc2(x)
        return F.log_softmax(x, dim=1)

@visualize(save_path='neuroscope_training.json')
def train_model(model, train_loader, test_loader, epochs=5):
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = model.to(device)
    optimizer = torch.optim.Adam(model.parameters())
    
    print("\nStarting training with visualization...")
    print("Training data will be saved to 'neuroscope_training.json'")

    for epoch in range(epochs):
        model.train()
        total_loss = 0
        correct = 0
        total = 0

        for batch_idx, (data, target) in enumerate(train_loader):
            data, target = data.to(device), target.to(device)
            
            optimizer.zero_grad()
            output = model(data)
            loss = F.nll_loss(output, target)
            loss.backward()
            optimizer.step()

            total_loss += loss.item()
            pred = output.argmax(dim=1, keepdim=True)
            correct += pred.eq(target.view_as(pred)).sum().item()
            total += target.size(0)

        # Validation
        model.eval()
        test_loss = 0
        correct = 0
        with torch.no_grad():
            for data, target in test_loader:
                data, target = data.to(device), target.to(device)
                output = model(data)
                test_loss += F.nll_loss(output, target, reduction='sum').item()
                pred = output.argmax(dim=1, keepdim=True)
                correct += pred.eq(target.view_as(pred)).sum().item()

        test_loss /= len(test_loader.dataset)
        accuracy = correct / len(test_loader.dataset)

        print(f'Epoch {epoch+1}:')
        print(f'  Train Loss: {total_loss/len(train_loader):.4f}')
        print(f'  Test Loss: {test_loss:.4f}')
        print(f'  Test Accuracy: {accuracy:.4%}')

    return model

def create_model_info(model: SimpleCNN) -> dict:
    """Create model info in the format expected by the visualization."""
    return {
        'name': 'MNIST_CNN',
        'layers': [
            {
                'name': 'conv1',
                'type': 'Conv2d',
                'in_channels': 1,
                'out_channels': 32,
                'kernel_size': 3,
                'stride': 1
            },
            {
                'name': 'relu1',
                'type': 'ReLU'
            },
            {
                'name': 'conv2',
                'type': 'Conv2d',
                'in_channels': 32,
                'out_channels': 64,
                'kernel_size': 3,
                'stride': 1
            },
            {
                'name': 'relu2',
                'type': 'ReLU'
            },
            {
                'name': 'maxpool',
                'type': 'MaxPool2d',
                'kernel_size': 2
            },
            {
                'name': 'dropout1',
                'type': 'Dropout',
                'p': 0.25
            },
            {
                'name': 'fc1',
                'type': 'Linear',
                'in_features': 9216,
                'out_features': 128
            },
            {
                'name': 'relu3',
                'type': 'ReLU'
            },
            {
                'name': 'dropout2',
                'type': 'Dropout',
                'p': 0.5
            },
            {
                'name': 'fc2',
                'type': 'Linear',
                'in_features': 128,
                'out_features': 10
            },
            {
                'name': 'log_softmax',
                'type': 'LogSoftmax',
                'dim': 1
            }
        ]
    }

def main():
    # Ensure we're in the correct directory
    os.chdir(SCRIPT_DIR)
    
    # Create models directory if it doesn't exist
    os.makedirs('models', exist_ok=True)
    
    print("Loading MNIST dataset...")
    # Load MNIST dataset
    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize((0.1307,), (0.3081,))
    ])

    train_dataset = datasets.MNIST('data', train=True, download=True, transform=transform)
    test_dataset = datasets.MNIST('data', train=False, transform=transform)

    train_loader = DataLoader(train_dataset, batch_size=64, shuffle=True)
    test_loader = DataLoader(test_dataset, batch_size=1000)

    # Create and save initial model
    print("\nInitializing model...")
    model = SimpleCNN()
    
    # Save initial model files
    torch.save(model.state_dict(), 'models/mnist_initial_weights.pt')
    torch.save(create_model_info(model), 'models/mnist_initial_info.pt')
    print("Initial model saved to 'models/mnist_initial_weights.pt' and 'models/mnist_initial_info.pt'")
    
    # Train and save final model
    print("\nTraining model...")
    model = train_model(model, train_loader, test_loader)
    
    # Save trained model files
    torch.save(model.state_dict(), 'models/mnist_final_weights.pt')
    torch.save(create_model_info(model), 'models/mnist_final_info.pt')
    print("\nTrained model saved to 'models/mnist_final_weights.pt' and 'models/mnist_final_info.pt'")
    print("\nYou can now visualize the models:")
    print("1. Start the services:")
    print("   - Frontend: npm run dev")
    print("   - Backend: python -m uvicorn main:app --reload")
    print("2. Open http://localhost:3000")
    print("3. Drag and drop the weight and info files to compare initial vs trained models")

if __name__ == '__main__':
    main() 