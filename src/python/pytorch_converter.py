from typing import Any, Dict, List, Optional, Tuple, Union

import numpy as np
import torch
import torch.nn as nn
from models import (LayerProperties, NetworkConnection, NetworkNode,
                    NeuroscopeNetwork)


def create_layer_from_info(layer_info: Dict[str, Any]) -> nn.Module:
    """Create a PyTorch layer from layer info dictionary."""
    layer_type = layer_info['type']
    if layer_type == 'Conv2d':
        return nn.Conv2d(
            in_channels=layer_info['in_channels'],
            out_channels=layer_info['out_channels'],
            kernel_size=3,  # Default values since we don't need the exact params
            padding=1
        )
    elif layer_type == 'Conv1d':
        return nn.Conv1d(
            in_channels=layer_info['in_channels'],
            out_channels=layer_info['out_channels'],
            kernel_size=layer_info.get('kernel_size', 3)
        )
    elif layer_type == 'Linear':
        return nn.Linear(
            in_features=layer_info['in_features'],
            out_features=layer_info['out_features']
        )
    elif layer_type == 'BatchNorm2d':
        return nn.BatchNorm2d(layer_info['num_features'])
    elif layer_type == 'BatchNorm1d':
        return nn.BatchNorm1d(layer_info['num_features'])
    elif layer_type == 'ReLU':
        return nn.ReLU()
    elif layer_type == 'MaxPool2d':
        return nn.MaxPool2d(kernel_size=2)
    elif layer_type == 'MaxPool1d':
        return nn.MaxPool1d(kernel_size=layer_info.get('kernel_size', 2))
    elif layer_type == 'Dropout':
        return nn.Dropout(p=layer_info.get('p', 0.5))
    elif layer_type == 'LSTM':
        return nn.LSTM(
            input_size=layer_info['input_size'],
            hidden_size=layer_info['hidden_size'],
            num_layers=layer_info.get('num_layers', 1),
            bidirectional=layer_info.get('bidirectional', False)
        )
    elif layer_type == 'GRU':
        return nn.GRU(
            input_size=layer_info['input_size'],
            hidden_size=layer_info['hidden_size'],
            num_layers=layer_info.get('num_layers', 1),
            bidirectional=layer_info.get('bidirectional', False)
        )
    elif layer_type == 'LeakyReLU':
        return nn.LeakyReLU(negative_slope=layer_info.get('negative_slope', 0.01))
    elif layer_type == 'Sigmoid':
        return nn.Sigmoid()
    elif layer_type == 'Tanh':
        return nn.Tanh()
    else:
        raise ValueError(f"Unsupported layer type: {layer_type}")

def get_layer_properties(layer: nn.Module, layer_info: Dict[str, Any]) -> LayerProperties:
    """Extract properties from a PyTorch layer."""
    props = {
        "type": layer_info['type'],
        "trainable_parameters": sum(p.numel() for p in layer.parameters() if p.requires_grad),
    }
    
    # Linear layer properties
    if isinstance(layer, nn.Linear):
        props.update({
            "in_features": layer_info['in_features'],
            "out_features": layer_info['out_features'],
            "has_bias": layer.bias is not None
        })
    
    # Convolutional layer properties (1D and 2D)
    elif isinstance(layer, (nn.Conv1d, nn.Conv2d)):
        props.update({
            "in_channels": layer_info['in_channels'],
            "out_channels": layer_info['out_channels'],
            "kernel_size": layer_info.get('kernel_size', 3),
            "stride": layer_info.get('stride', 1),
            "padding": layer_info.get('padding', 0),
            "has_bias": layer.bias is not None
        })
    
    # BatchNorm properties (1D and 2D)
    elif isinstance(layer, (nn.BatchNorm1d, nn.BatchNorm2d)):
        props.update({
            "num_features": layer_info['num_features'],
            "eps": layer.eps,
            "momentum": layer.momentum,
            "affine": layer.affine
        })
    
    # Recurrent layer properties
    elif isinstance(layer, (nn.LSTM, nn.GRU)):
        props.update({
            "input_size": layer_info['input_size'],
            "hidden_size": layer_info['hidden_size'],
            "num_layers": layer_info.get('num_layers', 1),
            "bidirectional": layer_info.get('bidirectional', False),
            "has_bias": layer.bias_hh_l0 is not None
        })
    
    # Pooling layer properties (1D and 2D)
    elif isinstance(layer, (nn.MaxPool1d, nn.MaxPool2d, nn.AvgPool1d, nn.AvgPool2d)):
        props.update({
            "kernel_size": layer_info.get('kernel_size', 2),
            "stride": layer_info.get('stride', None),
            "padding": layer_info.get('padding', 0)
        })
    
    # Dropout properties
    elif isinstance(layer, nn.Dropout):
        props.update({
            "p": layer_info.get('p', 0.5)
        })
    
    # Activation function properties
    elif isinstance(layer, nn.ReLU):
        props.update({
            "activation_type": "ReLU",
            "inplace": getattr(layer, 'inplace', False)
        })
    elif isinstance(layer, nn.LeakyReLU):
        props.update({
            "activation_type": "LeakyReLU",
            "negative_slope": layer_info.get('negative_slope', 0.01),
            "inplace": getattr(layer, 'inplace', False)
        })
    elif isinstance(layer, (nn.Sigmoid, nn.Tanh)):
        props.update({
            "activation_type": layer.__class__.__name__
        })
    
    return LayerProperties(**props)

def convert_pytorch_model(model_data: Dict[str, Any]) -> NeuroscopeNetwork:
    """Convert a PyTorch model state dict to a NeuroscopeNetwork."""
    nodes: List[NetworkNode] = []
    connections: List[NetworkConnection] = []
    
    # Get model structure
    structure = model_data['model_structure']
    state_dict = model_data['state_dict']
    
    # Process each layer
    prev_layer_id = None
    for i, layer_info in enumerate(structure['layers']):
        layer_id = f"layer_{i}"
        
        # Create temporary layer to get properties
        layer = create_layer_from_info(layer_info)
        
        # Get layer properties
        properties = get_layer_properties(layer, layer_info)
        
        # Create node
        nodes.append(NetworkNode(
            id=layer_id,
            type=layer_info['type'],
            properties=properties.dict(exclude_none=True)
        ))
        
        # Create connection from previous layer if it exists
        if prev_layer_id is not None:
            # Try to get weight statistics if available
            weight_props = {}
            weight_key = f"{layer_info['name']}.weight"
            if weight_key in state_dict:
                weight_data = state_dict[weight_key].cpu().numpy()
                weight_props.update({
                    "max_weight": float(np.max(weight_data)),
                    "min_weight": float(np.min(weight_data)),
                    "std_weight": float(np.std(weight_data)),
                    "shape": list(weight_data.shape)
                })
            
            connections.append(NetworkConnection(
                source=prev_layer_id,
                target=layer_id,
                weight=1.0,  # Default weight
                properties=weight_props
            ))
        
        prev_layer_id = layer_id
    
    return NeuroscopeNetwork(
        type="ANN",
        nodes=nodes,
        connections=connections
    ) 