import json
import os
import tempfile
from typing import Any, Dict, List, Optional

import torch
import torch.nn as nn
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def extract_layer_info(layer: nn.Module) -> Dict[str, Any]:
    """Extract relevant information from a PyTorch layer."""
    info: Dict[str, Any] = {}
    
    # Common attributes
    if hasattr(layer, 'training'):
        info['training'] = layer.training
    
    # Layer-specific attributes
    if isinstance(layer, (nn.Conv1d, nn.Conv2d, nn.Conv3d)):
        info.update({
            'in_channels': layer.in_channels,
            'out_channels': layer.out_channels,
            'kernel_size': layer.kernel_size,
            'stride': layer.stride,
            'padding': layer.padding,
            'dilation': layer.dilation,
            'groups': layer.groups,
            'bias': layer.bias is not None
        })
    
    elif isinstance(layer, (nn.BatchNorm1d, nn.BatchNorm2d, nn.BatchNorm3d)):
        info.update({
            'num_features': layer.num_features,
            'eps': layer.eps,
            'momentum': layer.momentum,
            'affine': layer.affine,
            'track_running_stats': layer.track_running_stats
        })
    
    elif isinstance(layer, nn.LayerNorm):
        info.update({
            'normalized_shape': layer.normalized_shape,
            'eps': layer.eps,
            'elementwise_affine': layer.elementwise_affine
        })
    
    elif isinstance(layer, (nn.MaxPool1d, nn.MaxPool2d, nn.MaxPool3d,
                          nn.AvgPool1d, nn.AvgPool2d, nn.AvgPool3d)):
        info.update({
            'kernel_size': layer.kernel_size,
            'stride': layer.stride,
            'padding': layer.padding
        })
    
    elif isinstance(layer, (nn.AdaptiveAvgPool1d, nn.AdaptiveAvgPool2d, nn.AdaptiveAvgPool3d)):
        info.update({
            'output_size': layer.output_size
        })
    
    elif isinstance(layer, (nn.RNN, nn.LSTM, nn.GRU)):
        info.update({
            'input_size': layer.input_size,
            'hidden_size': layer.hidden_size,
            'num_layers': layer.num_layers,
            'bias': layer.bias,
            'batch_first': layer.batch_first,
            'dropout': layer.dropout,
            'bidirectional': layer.bidirectional
        })
    
    elif isinstance(layer, nn.Linear):
        info.update({
            'in_features': layer.in_features,
            'out_features': layer.out_features,
            'bias': layer.bias is not None
        })
    
    elif isinstance(layer, (nn.Dropout, nn.Dropout2d, nn.Dropout3d)):
        info.update({
            'p': layer.p,
            'inplace': layer.inplace if hasattr(layer, 'inplace') else False
        })
    
    elif isinstance(layer, (nn.ReLU, nn.LeakyReLU, nn.PReLU, nn.RReLU,
                          nn.SELU, nn.CELU, nn.GELU)):
        info.update({
            'inplace': layer.inplace if hasattr(layer, 'inplace') else False
        })
        if isinstance(layer, nn.LeakyReLU):
            info['negative_slope'] = layer.negative_slope
    
    elif isinstance(layer, nn.Embedding):
        info.update({
            'num_embeddings': layer.num_embeddings,
            'embedding_dim': layer.embedding_dim,
            'padding_idx': layer.padding_idx,
            'max_norm': layer.max_norm,
            'norm_type': layer.norm_type,
            'scale_grad_by_freq': layer.scale_grad_by_freq,
            'sparse': layer.sparse
        })
    
    elif isinstance(layer, (nn.TransformerEncoderLayer, nn.TransformerDecoderLayer)):
        info.update({
            'd_model': layer.d_model,
            'nhead': layer.nhead,
            'dim_feedforward': layer.dim_feedforward,
            'dropout': layer.dropout,
            'activation': layer.activation.__class__.__name__ if layer.activation else None,
            'layer_norm_eps': layer.layer_norm_eps,
            'batch_first': layer.batch_first,
            'norm_first': layer.norm_first
        })
    
    return info

def analyze_model(model: nn.Module) -> Dict[str, Any]:
    """Analyze a PyTorch model and extract its structure."""
    nodes: List[Dict[str, Any]] = []
    connections: List[Dict[str, Any]] = []
    node_count = 0

    def add_node(layer: nn.Module, name: str) -> int:
        nonlocal node_count
        node_id = node_count
        node_count += 1
        
        layer_type = layer.__class__.__name__
        layer_info = extract_layer_info(layer)
        
        nodes.append({
            'id': str(node_id),
            'type': layer_type,
            'name': name,
            'properties': layer_info
        })
        
        return node_id

    def process_container(container: nn.Module, prefix: str = '') -> List[int]:
        container_nodes = []
        
        # Process named children
        for name, child in container.named_children():
            full_name = f'{prefix}.{name}' if prefix else name
            
            if isinstance(child, (nn.Sequential, nn.ModuleList, nn.ModuleDict)):
                child_nodes = process_container(child, full_name)
                container_nodes.extend(child_nodes)
            else:
                node_id = add_node(child, full_name)
                container_nodes.append(node_id)
                
                # If it's a container, process its children
                if len(list(child.children())) > 0:
                    child_nodes = process_container(child, full_name)
                    # Connect this container to its first child
                    if child_nodes:
                        connections.append({
                            'source': str(node_id),
                            'target': str(child_nodes[0]),
                            'weight': 1.0
                        })
                        # Connect children in sequence
                        for i in range(len(child_nodes) - 1):
                            connections.append({
                                'source': str(child_nodes[i]),
                                'target': str(child_nodes[i + 1]),
                                'weight': 1.0
                            })
        
        # Connect nodes in sequence if in a Sequential container
        if isinstance(container, nn.Sequential):
            for i in range(len(container_nodes) - 1):
                connections.append({
                    'source': str(container_nodes[i]),
                    'target': str(container_nodes[i + 1]),
                    'weight': 1.0
                })
        
        return container_nodes

    # Start processing from the root
    process_container(model)

    return {
        'type': 'PyTorch',
        'nodes': nodes,
        'connections': connections
    }

@app.post("/api/import/pytorch")
async def import_pytorch_model(
    weights_file: UploadFile = File(...),
    info_file: UploadFile = File(...)
) -> Dict[str, Any]:
    try:
        # Create temporary directory
        with tempfile.TemporaryDirectory() as temp_dir:
            # Save uploaded files
            weights_path = os.path.join(temp_dir, weights_file.filename)
            info_path = os.path.join(temp_dir, info_file.filename)
            
            with open(weights_path, 'wb') as f:
                f.write(await weights_file.read())
            with open(info_path, 'wb') as f:
                f.write(await info_file.read())
            
            # Load model info
            with open(info_path, 'r') as f:
                model_info = json.load(f)
            
            # Load model weights
            model = torch.load(weights_path, map_location='cpu')
            
            # Analyze model structure
            network = analyze_model(model)
            
            return network
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"} 