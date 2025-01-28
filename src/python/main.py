import io
import os
import tempfile
from typing import Dict, List

import torch
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from models import NeuroscopeNetwork
from pytorch_converter import convert_pytorch_model

app = FastAPI(title="Neuroscope Python Bridge")

# Configure CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check() -> Dict[str, str]:
    """Check if the service is healthy and PyTorch is available."""
    try:
        # Verify PyTorch is working
        x = torch.randn(1, 1)
        y = x * 2
        return {"status": "ok", "pytorch_version": torch.__version__}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/import/pytorch", response_model=NeuroscopeNetwork)
async def import_pytorch_model(
    weights_file: UploadFile = File(...),
    info_file: UploadFile = File(...)
) -> NeuroscopeNetwork:
    """Import a PyTorch model file and convert it to a NeuroscopeNetwork.
    
    Args:
        weights_file: The PyTorch weights file (.pt or .pth)
        info_file: The model structure info file (.pt or .pth)
        
    Returns:
        NeuroscopeNetwork: The converted network
        
    Raises:
        HTTPException: If the file type is invalid or model loading fails
    """
    for file in [weights_file, info_file]:
        if not file.filename.endswith(('.pt', '.pth')):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type for {file.filename}. Only .pt and .pth files are supported."
            )
    
    try:
        # Create temporary files
        temp_files: List[str] = []
        
        # Load weights
        with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
            content = await weights_file.read()
            tmp_file.write(content)
            tmp_file.flush()
            temp_files.append(tmp_file.name)
            weights = torch.load(tmp_file.name, map_location=torch.device('cpu'))
        
        # Load structure info
        with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
            content = await info_file.read()
            tmp_file.write(content)
            tmp_file.flush()
            temp_files.append(tmp_file.name)
            model_info = torch.load(tmp_file.name, map_location=torch.device('cpu'))
            
        # Clean up temp files
        for file in temp_files:
            os.unlink(file)
            
        # Validate model info structure
        if not isinstance(model_info, dict) or 'layers' not in model_info:
            raise ValueError("Invalid model info format. Expected a dictionary with 'layers' key")
            
        # Convert model to network
        network = convert_pytorch_model({
            'state_dict': weights,
            'model_structure': model_info
        })
        return network
            
    except Exception as e:
        # Clean up temp files in case of error
        for file in temp_files:
            try:
                os.unlink(file)
            except:
                pass
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load model: {str(e)}"
        ) 