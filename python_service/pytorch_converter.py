from typing import Any, Dict, Optional, Tuple

import numpy as np
import torch
from models import NetworkConnection, NetworkNode, NeuroscopeNetwork


def get_layer_properties(layer: torch.nn.Module) -> Dict[str, Any]:
    """Extract properties from a PyTorch layer."""
    properties = {
        "type": layer.__class__.__name__,
        "trainable_parameters": sum(p.numel() for p in layer.parameters() if p.requires_grad),
        "has_bias": hasattr(layer, "bias") and layer.bias is not None,
    }

    # Linear layer properties
    if isinstance(layer, torch.nn.Linear):
        properties.update({
            "in_features": layer.in_features,
            "out_features": layer.out_features,
        })

    # Convolutional layer properties
    elif isinstance(layer, torch.nn.Conv2d):
        properties.update({
            "in_channels": layer.in_channels,
            "out_channels": layer.out_channels,
            "kernel_size": layer.kernel_size,
            "stride": layer.stride,
            "padding": layer.padding,
        })

    # Pooling layer properties
    elif isinstance(layer, (torch.nn.MaxPool2d, torch.nn.AvgPool2d)):
        properties.update({
            "kernel_size": layer.kernel_size,
            "stride": layer.stride,
            "padding": layer.padding,
        })

    # Activation function properties
    elif isinstance(layer, (torch.nn.ReLU, torch.nn.LeakyReLU)):
        properties.update({
            "inplace": layer.inplace,
        })
        if isinstance(layer, torch.nn.LeakyReLU):
            properties["negative_slope"] = layer.negative_slope

    # Dropout properties
    elif isinstance(layer, torch.nn.Dropout):
        properties.update({
            "p": layer.p,
            "inplace": layer.inplace,
        })

    # Batch normalization properties
    elif isinstance(layer, torch.nn.BatchNorm2d):
        properties.update({
            "num_features": layer.num_features,
            "eps": layer.eps,
            "momentum": layer.momentum,
            "affine": layer.affine,
        })

    return properties

def extract_layer_metrics(model: torch.nn.Module) -> Tuple[Dict[str, float], Dict[str, float]]:
    """Extract gradients and activations from model layers."""
    gradients = {}
    activations = {}
    
    def process_layer(layer: torch.nn.Module, prefix: str = ""):
        # Extract gradients if available
        for name, param in layer.named_parameters():
            if param.grad is not None:
                grad_norm = float(torch.norm(param.grad).item())
                gradients[f"{prefix}{name}"] = grad_norm

        # Extract activations if available
        if hasattr(layer, "output") and layer.output is not None:
            act_norm = float(torch.norm(layer.output).item())
            activations[prefix.rstrip(".")] = act_norm

        # Process child modules
        for name, child in layer.named_children():
            process_layer(child, f"{prefix}{name}.")

    process_layer(model)
    return gradients, activations

def register_activation_hooks(model: torch.nn.Module) -> None:
    """Register forward hooks to capture layer activations."""
    def hook(module: torch.nn.Module, input: Any, output: Any) -> None:
        module.output = output.detach()

    for module in model.modules():
        if len(list(module.children())) == 0:  # Only register hooks for leaf modules
            module.register_forward_hook(hook)

def convert_pytorch_model(model: torch.nn.Module) -> NeuroscopeNetwork:
    """Convert a PyTorch model to Neuroscope network format."""
    # Register hooks to capture activations
    register_activation_hooks(model)
    
    nodes = []
    connections = []
    node_id_counter = 0

    def process_layer(layer: torch.nn.Module, parent_id: Optional[str] = None):
        nonlocal node_id_counter
        layer_id = f"layer_{node_id_counter}"
        node_id_counter += 1

        # Create node for the layer
        properties = get_layer_properties(layer)
        nodes.append(NetworkNode(
            id=layer_id,
            type=properties["type"],
            properties=properties
        ))

        # Add connection if there's a parent and weights
        if parent_id and hasattr(layer, "weight"):
            weight_matrix = layer.weight.detach().cpu().numpy()
            
            # Calculate weight statistics
            avg_weight = float(np.mean(np.abs(weight_matrix)))
            max_weight = float(np.max(np.abs(weight_matrix)))
            min_weight = float(np.min(np.abs(weight_matrix)))
            std_weight = float(np.std(weight_matrix))
            
            connections.append(NetworkConnection(
                source=parent_id,
                target=layer_id,
                weight=avg_weight,
                properties={
                    "max_weight": max_weight,
                    "min_weight": min_weight,
                    "std_weight": std_weight,
                    "shape": list(weight_matrix.shape)
                }
            ))

        # Process child modules
        for name, child in layer.named_children():
            process_layer(child, layer_id)

    # Start conversion from the root
    process_layer(model)

    return NeuroscopeNetwork(
        type="ANN",
        nodes=nodes,
        connections=connections
    ) 