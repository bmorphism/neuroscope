# Component Documentation

## Frontend Components

### NetworkViewer
- Purpose: Visualizes neural network architecture
- Location: `src/components/network/NetworkViewer.tsx`
- Dependencies: visualization engine, layout manager
- Key Features:
  - Interactive network visualization
  - Multiple layout options (circular, force, grid, hierarchical)
  - Layer highlighting and selection
  - Zoom and pan controls

### ControlPanel
- Purpose: User controls for network manipulation
- Location: `src/components/controls/ControlPanel.tsx`
- Dependencies: network state management
- Key Features:
  - Layout selection
  - Visualization controls
  - Network parameter adjustments
  - Training controls

### PropertyInspector
- Purpose: Displays and edits network properties
- Location: `src/components/controls/PropertyInspector.tsx`
- Dependencies: network validation
- Key Features:
  - Layer property editing
  - Parameter visualization
  - Real-time validation
  - Property history

### TrainingMetricsPanel
- Purpose: Displays training progress and metrics
- Location: `src/components/TrainingMetricsPanel.tsx`
- Dependencies: Python backend metrics
- Key Features:
  - Real-time training metrics
  - Loss visualization
  - Accuracy tracking
  - Epoch progress

## Backend Components

### Main Server (main.py)
- Purpose: FastAPI server implementation
- Location: `python_service/main.py`
- Dependencies: FastAPI, PyTorch
- Key Features:
  - RESTful API endpoints
  - WebSocket support for real-time updates
  - Model management
  - Training coordination

### Model Handler (models.py)
- Purpose: Neural network model definitions
- Location: `python_service/models.py`
- Dependencies: PyTorch, NumPy
- Key Features:
  - Model architecture definitions
  - Weight management
  - Training loops
  - Inference pipelines

### Neuroscope Core (neuroscope.py)
- Purpose: Core visualization and analysis logic
- Location: `python_service/neuroscope.py`
- Dependencies: PyTorch, NetworkX
- Key Features:
  - Network structure analysis
  - Graph conversion
  - Metric calculation
  - Layer relationship mapping

## Bridge Components

### PyTorch Service
- Purpose: Frontend-Backend communication
- Location: `src/lib/bridge/pytorch_service.py`
- Dependencies: FastAPI client
- Key Features:
  - API request handling
  - Data serialization
  - Error handling
  - Real-time updates

### Model Importers
- Purpose: Import models from various formats
- Location: `src/lib/importers/`
- Supported Formats:
  - PyTorch (.pt)
  - Future support planned for:
    - TensorFlow
    - ONNX
    - Keras

### Visualization Engine
- Purpose: Network visualization rendering
- Location: `src/lib/visualization/`
- Key Features:
  - Multiple layout algorithms
  - Interactive rendering
  - Performance optimization
  - Custom styling support

## Layout Managers

### Layout Types
- Location: `src/lib/visualization/layouts/`
- Implementations:
  - Circular (`circular.ts`)
  - Force-directed (`force.ts`)
  - Grid (`grid.ts`)
  - Hierarchical (`hierarchical.ts`)
- Common Features:
  - Configurable spacing
  - Node positioning
  - Edge routing
  - Collision detection
