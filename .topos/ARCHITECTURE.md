# Neuroscope Architecture

## Component Overview

```ascii
+------------------------+        +-------------------------+
|    Next.js Frontend    |        |     Python Backend      |
|------------------------|        |-------------------------|
| - src/                |        | - python_service/       |
|   ├── app/            |<------>|   ├── main.py          |
|   ├── components/     |  API   |   ├── models.py        |
|   └── lib/            |        |   └── neuroscope.py    |
+------------------------+        +-------------------------+
           |                              |
           |                              |
           v                              v
+------------------------+        +-------------------------+
|  Frontend Components   |        |    Python Components    |
|------------------------|        |-------------------------|
| - NetworkViewer       |        | - Model Training        |
| - ControlPanel        |        | - PyTorch Integration   |
| - PropertyInspector   |        | - Neural Net Processing |
| - TrainingMetrics     |        | - Data Validation      |
+------------------------+        +-------------------------+
           |                              |
           |                              |
           v                              v
+------------------------+        +-------------------------+
|    Bridge Layer        |        |     Model Storage       |
|------------------------|        |-------------------------|
| - pytorch_service.py   |        | - models/              |
| - importers/          |        |   ├── mnist_final.pt    |
| - visualization/      |        |   └── mnist_initial.pt  |
+------------------------+        +-------------------------+
```

## Directory Structure

### Frontend (Next.js)
- `src/`
  - `app/`: Next.js application routes
  - `components/`: React components for UI
  - `lib/`: Utility functions and core logic
    - `bridge/`: Python service integration
    - `importers/`: Model import functionality
    - `types/`: TypeScript type definitions
    - `validation/`: Data validation logic
    - `visualization/`: Network visualization engine

### Backend (Python)
- `python_service/`
  - `main.py`: FastAPI server entry point
  - `models.py`: Neural network model definitions
  - `neuroscope.py`: Core neuroscope functionality
  - `examples/`: Example implementations
  - `models/`: Stored neural network models

## Key Interactions

1. **Frontend → Backend Communication**
   - The Next.js frontend communicates with the Python backend through FastAPI endpoints
   - Bridge layer (`src/lib/bridge/pytorch_service.py`) handles the communication

2. **Model Processing Flow**
   - Models are imported through the frontend
   - Processed by the Python backend
   - Visualized using the frontend visualization engine

3. **Data Flow**
   - Network structure validation
   - Training metrics processing
   - Real-time visualization updates

## Development Setup

1. **Frontend**
   - Next.js server (default port: 3000)
   - TypeScript + React components
   - Tailwind CSS for styling

2. **Backend**
   - Python FastAPI server
   - PyTorch integration
   - Model processing and validation

## Architecture Decisions

1. **Separation of Concerns**
   - Frontend handles visualization and user interaction
   - Backend handles model processing and data validation
   - Bridge layer manages communication between the two

2. **Modular Design**
   - Components are isolated and reusable
   - Clear separation between visualization and data processing
   - Extensible importer system for different model types

3. **Type Safety**
   - TypeScript for frontend type safety
   - Python type hints for backend type safety
   - Validated data structures for communication
