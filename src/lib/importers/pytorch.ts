import { BaseImporter } from './base';
import { NeuroscopeNetwork, Node, Connection, ANNProperties } from '../types/network';

const PYTHON_SERVICE_URL = 'http://localhost:8000';

interface LayerInfo {
  type: string;
  properties: Record<string, any>;
}

export class PyTorchImporter extends BaseImporter {
  async fromFile(path: string): Promise<NeuroscopeNetwork> {
    // This is a placeholder implementation
    // In reality, we would:
    // 1. Use a Python bridge to load the PyTorch model
    // 2. Extract architecture using model.modules()
    // 3. Convert to our format
    
    throw new Error('PyTorch import not yet implemented');
    
    /* Implementation will look something like this:
    const model = await this.loadPyTorchModel(path);
    const nodes: Node[] = [];
    const connections: Connection[] = [];
    
    // Extract layers
    for (const module of model.modules()) {
      const node: Node = {
        id: module.name,
        type: module.type,
        properties: this.extractProperties(module)
      };
      nodes.push(node);
    }
    
    // Extract connections
    for (const param of model.named_parameters()) {
      if (param.name.includes('weight')) {
        const [source, target] = this.parseConnectionPath(param.name);
        const connection: Connection = {
          source,
          target,
          weight: param.data,
          properties: {}
        };
        connections.push(connection);
      }
    }
    
    return {
      type: 'ANN',
      nodes,
      connections
    };
    */
  }
  
  private extractProperties(module: any): ANNProperties {
    return {
      activationFunction: module.activation || 'linear',
      layerType: module.type,
      biases: module.bias ? Array.from(module.bias.data) : undefined
    };
  }
  
  private parseConnectionPath(paramName: string): [string, string] {
    // Parse PyTorch parameter paths to get source and target layers
    const parts = paramName.split('.');
    return [parts[0], parts[1]];
  }

  /**
   * Check if the Python service is healthy
   */
  public async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${PYTHON_SERVICE_URL}/health`);
      const data = await response.json();
      return data.status === 'ok';
    } catch (error) {
      console.error('Failed to check Python service health:', error);
      return false;
    }
  }

  /**
   * Import a PyTorch model file
   * @param weightsFile The .pt or .pth weights file
   * @param infoFile The .info file
   * @returns The converted network in Neuroscope format
   */
  public async importModel(weightsFile: File, infoFile: File): Promise<NeuroscopeNetwork> {
    // Verify file types
    if (!weightsFile.name.endsWith('.pt') && !weightsFile.name.endsWith('.pth')) {
      throw new Error('Invalid weights file type. Only .pt and .pth files are supported.');
    }
    if (!infoFile.name.endsWith('.pt')) {
      throw new Error('Invalid info file type. Only .pt files are supported.');
    }

    try {
      // Create form data
      const formData = new FormData();
      formData.append('weights_file', weightsFile);
      formData.append('info_file', infoFile);

      // Send request
      const response = await fetch(`${PYTHON_SERVICE_URL}/import/pytorch`, {
        method: 'POST',
        body: formData,
      });

      // Handle errors
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to import model');
      }

      // Parse response
      const network = await response.json();
      return network as NeuroscopeNetwork;
    } catch (error) {
      console.error('Failed to import PyTorch model:', error);
      throw error;
    }
  }
}

export function extractLayerProperties(layerType: string, layerInfo: any): Record<string, any> {
  const properties: Record<string, any> = {};

  switch (layerType) {
    // Convolutional layers
    case 'Conv1d':
    case 'Conv2d':
    case 'Conv3d':
      properties.in_channels = layerInfo.in_channels;
      properties.out_channels = layerInfo.out_channels;
      properties.kernel_size = layerInfo.kernel_size;
      properties.stride = layerInfo.stride;
      properties.padding = layerInfo.padding;
      properties.dilation = layerInfo.dilation;
      properties.groups = layerInfo.groups;
      properties.bias = layerInfo.bias !== null;
      break;

    // Pooling layers
    case 'MaxPool1d':
    case 'MaxPool2d':
    case 'MaxPool3d':
    case 'AvgPool1d':
    case 'AvgPool2d':
    case 'AvgPool3d':
    case 'AdaptiveAvgPool1d':
    case 'AdaptiveAvgPool2d':
    case 'AdaptiveAvgPool3d':
      properties.kernel_size = layerInfo.kernel_size;
      properties.stride = layerInfo.stride;
      properties.padding = layerInfo.padding;
      if (layerType.startsWith('Adaptive')) {
        properties.output_size = layerInfo.output_size;
      }
      break;

    // Normalization layers
    case 'BatchNorm1d':
    case 'BatchNorm2d':
    case 'BatchNorm3d':
      properties.num_features = layerInfo.num_features;
      properties.eps = layerInfo.eps;
      properties.momentum = layerInfo.momentum;
      properties.affine = layerInfo.affine;
      properties.track_running_stats = layerInfo.track_running_stats;
      break;

    case 'LayerNorm':
      properties.normalized_shape = layerInfo.normalized_shape;
      properties.eps = layerInfo.eps;
      properties.elementwise_affine = layerInfo.elementwise_affine;
      break;

    // Recurrent layers
    case 'RNN':
    case 'LSTM':
    case 'GRU':
      properties.input_size = layerInfo.input_size;
      properties.hidden_size = layerInfo.hidden_size;
      properties.num_layers = layerInfo.num_layers;
      properties.bias = layerInfo.bias;
      properties.batch_first = layerInfo.batch_first;
      properties.dropout = layerInfo.dropout;
      properties.bidirectional = layerInfo.bidirectional;
      break;

    // Linear layers
    case 'Linear':
      properties.in_features = layerInfo.in_features;
      properties.out_features = layerInfo.out_features;
      properties.bias = layerInfo.bias !== null;
      break;

    // Dropout layers
    case 'Dropout':
    case 'Dropout2d':
    case 'Dropout3d':
      properties.p = layerInfo.p;
      properties.inplace = layerInfo.inplace;
      break;

    // Activation functions
    case 'ReLU':
    case 'LeakyReLU':
    case 'PReLU':
    case 'RReLU':
    case 'SELU':
    case 'CELU':
    case 'GELU':
      properties.inplace = layerInfo.inplace;
      if (layerType === 'LeakyReLU') {
        properties.negative_slope = layerInfo.negative_slope;
      }
      break;

    case 'Sigmoid':
    case 'Tanh':
    case 'Softmax':
    case 'LogSoftmax':
      // These layers typically don't have additional parameters
      break;

    // Embedding layers
    case 'Embedding':
      properties.num_embeddings = layerInfo.num_embeddings;
      properties.embedding_dim = layerInfo.embedding_dim;
      properties.padding_idx = layerInfo.padding_idx;
      properties.max_norm = layerInfo.max_norm;
      properties.norm_type = layerInfo.norm_type;
      properties.scale_grad_by_freq = layerInfo.scale_grad_by_freq;
      properties.sparse = layerInfo.sparse;
      break;

    // Transformer layers
    case 'TransformerEncoderLayer':
    case 'TransformerDecoderLayer':
      properties.d_model = layerInfo.d_model;
      properties.nhead = layerInfo.nhead;
      properties.dim_feedforward = layerInfo.dim_feedforward;
      properties.dropout = layerInfo.dropout;
      properties.activation = layerInfo.activation;
      properties.layer_norm_eps = layerInfo.layer_norm_eps;
      properties.batch_first = layerInfo.batch_first;
      properties.norm_first = layerInfo.norm_first;
      break;

    default:
      console.warn(`Unknown layer type: ${layerType}`);
      // For unknown layers, include all properties
      Object.assign(properties, layerInfo);
  }

  return properties;
}