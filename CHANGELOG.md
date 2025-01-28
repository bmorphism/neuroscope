# Changelog

## [Unreleased]

### Added
- Basic Python bridge service with FastAPI
- PyTorch model import functionality
- Support for various PyTorch layer types
- Model file handling and validation
- Network visualization with D3.js
- Multiple layout options:
  - Force-directed layout
  - Hierarchical layout
  - Circular layout
  - Grid layout
- Interactive controls for visualization parameters
- Node and link tooltips
- Network statistics display
- Support for large model visualization
- Real-time layout updates
- Proper cleanup and state management
- Enhanced interactive visualization features:
  - Double-click to expand nodes
  - Right-click context menu
  - Hover effects for connected nodes
  - Node and connection highlighting
  - Activation visualization with color scales
  - Gradient visualization with border colors
  - Smooth animations for visual transitions
  - Improved event handling system
- Training visualization system:
  - Real-time metrics tracking
  - Gradient flow visualization
  - Activation pattern display
  - Customizable update intervals
  - Exponential smoothing for metrics
  - Interactive metrics charts
  - Support for custom metrics
- Example Applications:
  - Sentiment Analysis with Attention Visualization
    - LSTM-based architecture
    - Attention mechanism visualization
    - Token importance mapping
    - Real-time training metrics
    - Custom metrics for attention patterns

### Changed
- Simplified training visualization system:
  - Removed WebSocket-based training hook
  - Added simpler file-based visualization decorator
  - Streamlined FastAPI service
  - Improved error handling and type safety

### Fixed
- Layout transitions between different types
- Node position preservation during updates
- Configuration update handling
- Network state update notifications
- Layout switching behavior
- Control panel responsiveness
- Model import validation
- Error handling for unsupported layer types

### In Progress
- Model training visualization
  - Loss landscape visualization
  - Layer-wise gradient analysis
  - Attention pattern visualization
- Network comparison features
  - Side-by-side visualization
  - Metrics comparison
  - Architecture diff view

### Technical Debt
- Optimize large model handling
- Add comprehensive error handling
- Improve type safety
- Add unit tests
- Add integration tests
- Add end-to-end tests

### Future Considerations
- Support for more PyTorch layer types
- Custom layout algorithms
- Advanced network analysis features
- Export capabilities
- Collaboration features
- Version control integration

### Next Steps
1. Complete remaining example applications
   - Event-based vision with SNNs
   - Time-series analysis for financial data
   - Weather prediction with RNNs
2. Enhance visualization features
   - Loss landscape visualization
   - Layer-wise gradient analysis
3. Add network comparison capabilities
   - Side-by-side visualization
   - Architecture diffing