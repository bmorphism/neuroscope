import json
import os
import tempfile
from typing import Dict, List

import torch
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from models import NetworkConnection, NetworkNode, NeuroscopeNetwork
from pytorch_converter import convert_pytorch_model

app = FastAPI(title="Neuroscope PyTorch Bridge")

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check() -> Dict[str, str]:
    """Check if the service is healthy."""
    try:
        # Verify PyTorch is working
        torch.zeros(1)
        return {"status": "ok", "message": "Service is healthy"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Service health check failed: {str(e)}"
        )

@app.post("/import/pytorch")
async def import_pytorch_model(
    weights_file: UploadFile = File(...),
    info_file: UploadFile = File(...)
):
    """Import a PyTorch model and convert it to Neuroscope format."""
    if not weights_file.filename.endswith(('.pt', '.pth')):
        raise HTTPException(
            status_code=400,
            detail="Invalid weights file type. Only .pt and .pth files are supported."
        )
    
    if not info_file.filename.endswith('.pt'):
        raise HTTPException(
            status_code=400,
            detail="Invalid info file type. Only .pt files are supported."
        )

    weights_tmp = None
    info_tmp = None
    
    try:
        # Create temporary files
        weights_tmp = tempfile.NamedTemporaryFile(delete=False)
        info_tmp = tempfile.NamedTemporaryFile(delete=False)
        
        # Write files to disk
        weights_tmp.write(await weights_file.read())
        info_tmp.write(await info_file.read())
        weights_tmp.flush()
        info_tmp.flush()
        
        # Close files before loading them with torch
        weights_tmp.close()
        info_tmp.close()
        
        # Load the model info
        model_info = torch.load(info_tmp.name, map_location=torch.device('cpu'))
        if not isinstance(model_info, dict) or 'layers' not in model_info:
            raise HTTPException(
                status_code=400,
                detail="Invalid model info file format"
            )
        
        # Load the weights
        weights = torch.load(weights_tmp.name, map_location=torch.device('cpu'))
        if not isinstance(weights, dict):
            raise HTTPException(
                status_code=400,
                detail="Invalid weights file format"
            )
        
        # Convert layers to nodes
        nodes = []
        connections = []
        prev_node = None
        
        for i, layer in enumerate(model_info['layers']):
            node = NetworkNode(
                id=f"layer_{i}",
                type=layer['type'],
                properties=layer
            )
            nodes.append(node)
            
            # Add connection from previous layer if it exists
            if prev_node is not None:
                # Get weight matrix if available
                weight_key = f"{layer['name']}.weight"
                weight = 1.0  # Default weight
                if weight_key in weights:
                    weight_tensor = weights[weight_key]
                    weight = float(torch.mean(torch.abs(weight_tensor)).item())
                
                connection = NetworkConnection(
                    source=prev_node.id,
                    target=node.id,
                    weight=weight,
                    properties={}
                )
                connections.append(connection)
            
            prev_node = node
        
        # Convert to Neuroscope format
        network = NeuroscopeNetwork(
            type='ANN',
            nodes=nodes,
            connections=connections
        )
        
        return network.dict()
                
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process model: {str(e)}"
        )
    finally:
        # Clean up temporary files
        if weights_tmp:
            try:
                os.unlink(weights_tmp.name)
            except:
                pass
        if info_tmp:
            try:
                os.unlink(info_tmp.name)
            except:
                pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000) 
