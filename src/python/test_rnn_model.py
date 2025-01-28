import torch
import torch.nn as nn


class TestRNNNetwork(nn.Module):
    def __init__(self):
        super().__init__()
        # Feature extraction
        self.conv1d = nn.Conv1d(in_channels=1, out_channels=16, kernel_size=3)
        self.bn1 = nn.BatchNorm1d(16)
        self.relu = nn.ReLU(inplace=True)
        self.maxpool = nn.MaxPool1d(kernel_size=2)
        
        # Recurrent layers
        self.lstm = nn.LSTM(input_size=16, hidden_size=32, num_layers=2, bidirectional=True)
        self.gru = nn.GRU(input_size=64, hidden_size=32, num_layers=1)
        
        # Output layers
        self.dropout = nn.Dropout(0.5)
        self.fc1 = nn.Linear(32, 64)
        self.leaky_relu = nn.LeakyReLU(negative_slope=0.1)
        self.fc2 = nn.Linear(64, 10)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        # Feature extraction
        x = self.conv1d(x)
        x = self.bn1(x)
        x = self.relu(x)
        x = self.maxpool(x)
        
        # Recurrent processing
        x = x.permute(2, 0, 1)  # (seq_len, batch, features)
        x, _ = self.lstm(x)
        x, _ = self.gru(x)
        x = x[-1]  # Take last output
        
        # Classification
        x = self.dropout(x)
        x = self.fc1(x)
        x = self.leaky_relu(x)
        x = self.fc2(x)
        x = self.sigmoid(x)
        return x

if __name__ == "__main__":
    # Create model
    model = TestRNNNetwork()
    
    # Create model structure info
    model_info = {
        'name': 'TestRNNNetwork',
        'layers': [
            {'name': 'conv1d', 'type': 'Conv1d', 'in_channels': 1, 'out_channels': 16, 'kernel_size': 3},
            {'name': 'bn1', 'type': 'BatchNorm1d', 'num_features': 16},
            {'name': 'relu', 'type': 'ReLU'},
            {'name': 'maxpool', 'type': 'MaxPool1d', 'kernel_size': 2},
            {'name': 'lstm', 'type': 'LSTM', 'input_size': 16, 'hidden_size': 32, 'num_layers': 2, 'bidirectional': True},
            {'name': 'gru', 'type': 'GRU', 'input_size': 64, 'hidden_size': 32, 'num_layers': 1},
            {'name': 'dropout', 'type': 'Dropout'},
            {'name': 'fc1', 'type': 'Linear', 'in_features': 32, 'out_features': 64},
            {'name': 'leaky_relu', 'type': 'LeakyReLU', 'negative_slope': 0.1},
            {'name': 'fc2', 'type': 'Linear', 'in_features': 64, 'out_features': 10},
            {'name': 'sigmoid', 'type': 'Sigmoid'}
        ]
    }
    
    # Save weights and structure separately
    weights_file = "test_rnn_weights.pt"
    info_file = "test_rnn_info.pt"
    
    # Save weights
    torch.save(model.state_dict(), weights_file)
    
    # Save structure info
    torch.save(model_info, info_file)
    
    print(f"Model weights saved as '{weights_file}'")
    print(f"Model structure saved as '{info_file}'") 