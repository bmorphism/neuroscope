# Neuroscope Examples

This directory contains example models that demonstrate Neuroscope's visualization capabilities.

## MNIST CNN Example

A simple but effective Convolutional Neural Network (CNN) for digit classification on MNIST.

### Quick Start

1. Install dependencies:
```bash
cd python_service  # Make sure you're in the python_service directory
pip install -r requirements.txt
```

2. Run the example:
```bash
# From the python_service directory:
python examples/mnist_cnn.py
```

This will:
- Download the MNIST dataset automatically
- Create a `models` directory
- Save two model files:
  - `models/mnist_initial.pt`: The untrained model architecture
  - `models/mnist_final.pt`: The trained model after 5 epochs
- Save training visualization data to `neuroscope_training.json`

### Visualizing the Model

1. Start the Next.js frontend (from project root):
```bash
# Terminal 1 (from project root)
npm install  # Only needed first time
npm run dev
```

2. Start the Python service (from python_service directory):
```bash
# Terminal 2 (from python_service directory)
python -m uvicorn main:app --reload
```

3. Open http://localhost:3000 in your browser

4. Drag and drop either:
   - `models/mnist_initial.pt` to see the initial architecture
   - `models/mnist_final.pt` to see the trained model
   - `neuroscope_training.json` to see training dynamics

### Model Architecture

```
Input (28x28 grayscale image)
│
├─ Conv2d(1→32, 3x3)
├─ ReLU
│
├─ Conv2d(32→64, 3x3)
├─ ReLU
├─ MaxPool2d(2x2)
├─ Dropout(0.25)
│
├─ Flatten
├─ Linear(9216→128)
├─ ReLU
├─ Dropout(0.5)
│
└─ Linear(128→10)
   └─ LogSoftmax
```

### Expected Performance

After 5 epochs:
- Training Loss: ~0.1-0.2
- Test Accuracy: ~98%

### Customizing the Example

You can modify:
- Number of epochs: Change `epochs=5` in the `main()` function
- Batch size: Change `batch_size=64` in the DataLoader
- Model architecture: Modify the `SimpleCNN` class
- Optimizer settings: Modify the `optimizer` in `train_model()`

### Troubleshooting

1. If you get CUDA out of memory errors:
   - Set `device = torch.device('cpu')` in `train_model()`
   - Or reduce batch size

2. If the model file is too large:
   - Reduce model size in `SimpleCNN`
   - Or use CPU-only tensors before saving

3. If visualization is slow:
   - Ensure you're running both frontend and backend services
   - Try a smaller number of epochs
   - Use smaller batch sizes to reduce memory usage

4. If you get import errors:
   - Make sure you're running from the correct directories:
     - Example script: Run from `python_service` directory
     - FastAPI service: Run from `python_service` directory using `python -m uvicorn`
     - Frontend: Run from project root
   - Check that all dependencies are installed
   - Try running with the full path: `python examples/mnist_cnn.py` 