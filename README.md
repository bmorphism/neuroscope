# Neuroscope

An interactive neural network visualization engine for both artificial and biological neural networks, designed to make neural architectures and their dynamics accessible and interpretable.

## 🛠️ Development Environment Setup

### Using flox and uv (Recommended)

[flox](https://flox.dev) and [uv](https://github.com/astral-sh/uv) provide a streamlined development environment setup:

1. Install flox:
   - Download from [flox.dev](https://flox.dev)
   - Follow the installation instructions for your platform

2. Install uv:
   ```bash
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```

3. Set up the development environment:
   ```bash
   # Initialize flox environment
   flox init
   flox install nodejs

   # Create Python virtual environment with uv
   uv venv
   uv pip install -r requirements.txt
   ```

4. Share the environment:
   - The `.flox` directory contains everything needed to run this environment
   - Others can use `flox activate` after cloning the repository
   - For team collaboration:
     ```bash
     flox push  # Share via FloxHub
     # Others can then use:
     flox pull username/neuroscope
     # or
     flox activate -r username/neuroscope
     ```

### Traditional Setup
If you prefer not to use flox/uv, follow the manual setup instructions below.

## 🚀 Quick Start

### Option 1: Visualize Your Own Model

1. Start the services:
```bash
# Terminal 1: Start frontend
npm install
npm run dev

# Terminal 2: Start Python service
cd python_service
pip install -r requirements.txt
python -m uvicorn main:app --reload  # Use python3 on Linux/Mac
```

2. Open http://localhost:3000/demo

3. Drag and drop your PyTorch model file (`.pt` or `.pth`) or visualization data (`.json`)

### Option 2: Try the MNIST Example

1. Set up the environment:
```bash
# Install frontend dependencies
npm install

# Install Python dependencies
cd python_service
pip install -r requirements.txt  # Use pip3 on Linux/Mac
```

2. Run the example:
```bash
cd python_service
python -m examples.mnist_cnn  # Use python3 on Linux/Mac
```

3. Start the services:
```bash
# Terminal 1: Start frontend
npm run dev

# Terminal 2: Start Python service
cd python_service
python -m uvicorn main:app --reload  # Use python3 on Linux/Mac
```

4. Open http://localhost:3000/demo

5. Drag and drop:
   - `python_service/models/mnist_initial.pt` for initial architecture
   - `python_service/models/mnist_final.pt` for trained model
   - `python_service/neuroscope_training.json` for training dynamics

See `python_service/examples/README.md` for detailed instructions and troubleshooting.

## 🎯 Vision

Neuroscope bridges the gap between complex neural systems and human understanding through interactive, web-based visualizations. Inspired by Manim's mathematical animations but tailored for neural networks, Neuroscope provides an intuitive interface for exploring both artificial and biological neural architectures.

## 🚀 Features

### Core Capabilities
- **Interactive Visualization Engine**: Built with NextJS, TypeScript, React, D3, and Tailwind
- **Neural Network Configuration**: Define networks through parameters, properties, and connections
- **Real-time Dynamics**: Visualize network behavior during training and inference
- **Multi-level Analysis**: From individual neurons to network-wide patterns
- **Model Import System**: Direct loading of PyTorch models and other frameworks

### Model Compatibility
- **PyTorch Integration**
  - Direct loading of `.pt` and `.pth` model files
  - Automatic architecture extraction
  - Weight and bias visualization
  - Activation function mapping
  
- **Standard Format**
  - JSON-based network description schema
  - Framework-agnostic representation
  - Support for custom layer types
  - Extensible parameter mapping
  - Type-specific properties for ANNs, SNNs, and Connectomes
  - Spatial and temporal dynamics support

- **Network Type Support**
  - Standard PyTorch models (CNNs, RNNs)
  - Spiking Neural Networks (membrane potentials, thresholds)
  - Biological Connectomes (neurotransmitters, cell types)
  - Custom network architectures

### Architecture
- **Core Schema**
  ```typescript
  type NeuroscopeNetwork = {
    type: 'ANN' | 'SNN' | 'Connectome';
    nodes: {
      id: string;
      type: string;
      properties: Record<string, any>;
      spatialInfo?: {x: number, y: number, z: number};
    }[];
    connections: {
      source: string;
      target: string;
      weight: number;
      properties: Record<string, any>;
    }[];
    dynamics?: {
      temporalResolution?: number;
      simulationParameters?: Record<string, any>;
    };
  }
  ```

- **Importers**
  - Modular importer system for different network types
  - Validation and type checking
  - Custom property handling
  - Extensible for new network formats

### Visualization Components
- **Neuronal Dynamics**
  - Activation patterns and firing rates
  - Backpropagation visualization
  - Functional connectivity
  - Decision boundaries
  - Activation sparsity maps
  
- **Network Architecture**
  - Layer-wise visualization
  - Connection strength mapping
  - Architectural patterns
  - Parameter distribution analysis

## 📊 Example Applications

### Biological Networks
- **C. elegans Connectome**
  - Complete neural circuit visualization
  - Synaptic connectivity mapping
  - Behavioral circuit analysis

### Artificial Neural Networks
1. **Event-based Vision**
   - Spiking neural networks for vehicle detection
   - Real-time processing visualization
   - Temporal dynamics analysis

2. **Financial Analysis**
   - Time-series stock prediction
   - Market pattern recognition
   - Decision process visualization

3. **Natural Language Processing**
   - CNN-based sentiment analysis on tweets
   - Attention mechanism visualization
   - Token importance mapping

4. **Environmental Modeling**
   - RNN weather prediction
   - Pattern recognition in meteorological data
   - Forecast uncertainty visualization

## 👥 Target Audience
- Researchers in adjacent fields
- High school students
- University students
- Machine learning practitioners
- Neuroscience enthusiasts

## 🗺️ Roadmap to Feature Completeness

### Phase 1: Core Infrastructure ✅
- [x] Basic visualization engine setup
  - [x] NextJS project initialization
  - [x] TypeScript configuration
  - [x] D3.js integration
  - [x] Tailwind setup
- [x] Network schema implementation
  - [x] Core types and interfaces
  - [x] Validation system
  - [x] Property type checking
- [x] Base importers
  - [x] PyTorch ANN importer
  - [ ] Basic SNN support
  - [ ] Connectome file parsing
- [x] Visualization primitives
  - [x] Node rendering
  - [x] Connection visualization
  - [x] Basic animation system
  - [x] Interactive controls
  - [x] Multiple layout options
  - [x] Tooltips and property inspection
  - [x] Zoom and pan controls

### Phase 2: Neural Network Components 🟡
- [x] Layer visualization templates
- [x] Connection visualization system
- [x] Interactive features
  - [x] Node expansion
  - [x] Context menus
  - [x] Connected node highlighting
  - [x] Node and connection animations
- [ ] Activation function visualizations
- [ ] Training process visualization
  - [ ] Real-time updates
  - [ ] Activation patterns
  - [ ] Gradient flow
  - [ ] Loss landscapes

### Phase 3: Example Applications
- [ ] C. elegans connectome implementation
- [ ] Spiking neural network for event-based vision
- [ ] Time-series analysis framework
- [ ] Sentiment analysis visualization
- [ ] Weather prediction system

### Phase 4: Advanced Features
- [ ] Custom network architecture builder
- [ ] Advanced interaction patterns
- [ ] Performance optimization
- [ ] Export and sharing capabilities

### Phase 5: Documentation and Research
- [ ] Comprehensive API documentation
- [ ] Tutorial system
- [ ] Case studies compilation
- [ ] ICML paper preparation
  - Feature completeness analysis
  - Example visualization portfolio
  - Usability study results

## 🛠️ Technical Stack
- **Frontend**: NextJS, TypeScript, React
- **Visualization**: D3.js
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## 📝 Research Publication
Our ICML paper will present:
- Complete feature analysis
- Example visualization portfolio
- Usability case studies
- Technical architecture details
- Educational impact assessment

## 🤝 Contributing
We welcome contributions! Please see our contributing guidelines for more information.

## 📄 License
[License details to be added]

---
*Neuroscope is currently under active development. Feature requests and contributions are welcome!*
