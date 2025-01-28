import torch
import torch.nn as nn
import torch.nn.functional as F


class TestNetwork(nn.Module):
    def __init__(self):
        super().__init__()
        # Feature extraction layers
        self.conv1 = nn.Conv2d(3, 16, kernel_size=3, stride=1, padding=1)
        self.conv2 = nn.Conv2d(16, 32, kernel_size=3, stride=2, padding=1)
        self.bn1 = nn.BatchNorm2d(32)
        
        # Activation and pooling
        self.relu = nn.ReLU(inplace=True)
        self.maxpool = nn.MaxPool2d(kernel_size=2)
        self.dropout = nn.Dropout(0.25)
        
        # Fully connected layers
        self.fc1 = nn.Linear(32 * 8 * 8, 128)
        self.fc2 = nn.Linear(128, 64)
        self.fc3 = nn.Linear(64, 10)

    def forward(self, x):
        x = self.relu(self.conv1(x))
        x = self.maxpool(x)
        x = self.relu(self.conv2(x))
        x = self.bn1(x)
        x = self.dropout(x)
        x = x.view(x.size(0), -1)
        x = self.relu(self.fc1(x))
        x = self.relu(self.fc2(x))
        x = self.fc3(x)
        return x

if __name__ == "__main__":
    # Create model
    model = TestNetwork()
    
    # Create model structure info
    model_info = {
        'name': 'TestNetwork',
        'layers': [
            {'name': 'conv1', 'type': 'Conv2d', 'in_channels': 3, 'out_channels': 16},
            {'name': 'conv2', 'type': 'Conv2d', 'in_channels': 16, 'out_channels': 32},
            {'name': 'bn1', 'type': 'BatchNorm2d', 'num_features': 32},
            {'name': 'relu', 'type': 'ReLU'},
            {'name': 'maxpool', 'type': 'MaxPool2d'},
            {'name': 'dropout', 'type': 'Dropout'},
            {'name': 'fc1', 'type': 'Linear', 'in_features': 2048, 'out_features': 128},
            {'name': 'fc2', 'type': 'Linear', 'in_features': 128, 'out_features': 64},
            {'name': 'fc3', 'type': 'Linear', 'in_features': 64, 'out_features': 10}
        ]
    }
    
    # Save weights and structure separately
    weights_file = "test_model_weights.pt"
    info_file = "test_model_info.pt"
    
    # Save weights
    torch.save(model.state_dict(), weights_file)
    
    # Save structure info
    torch.save(model_info, info_file)
    
    print(f"Model weights saved as '{weights_file}'")
    print(f"Model structure saved as '{info_file}'") 