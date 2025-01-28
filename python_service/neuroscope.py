import json
import os
from functools import wraps

import numpy as np
import torch


def visualize(save_path='neuroscope_data.json'):
    """
    A simple decorator to capture model states during training/inference.
    Usage:
        @visualize()
        def train(model, ...):
            # Your training loop
    """
    def decorator(func):
        @wraps(func)
        def wrapper(model, *args, **kwargs):
            # Save initial model state
            states = []
            
            def hook(module, input, output):
                if hasattr(module, 'weight'):
                    states.append({
                        'name': module.__class__.__name__,
                        'activations': float(torch.mean(torch.abs(output.detach())).item()),
                        'weights': float(torch.mean(torch.abs(module.weight.detach())).item()),
                        'gradients': float(torch.mean(torch.abs(module.weight.grad)).item()) if module.weight.grad is not None else 0.0
                    })

            # Register forward hooks
            hooks = []
            for name, module in model.named_modules():
                if hasattr(module, 'weight'):
                    hooks.append(module.register_forward_hook(hook))

            # Run the original function
            result = func(model, *args, **kwargs)

            # Remove hooks
            for h in hooks:
                h.remove()

            # Save the data
            with open(save_path, 'w') as f:
                json.dump(states, f)
            
            print(f"\nModel visualization data saved to {save_path}")
            print("You can now load this file in the Neuroscope interface")
            
            return result
        return wrapper
    return decorator 