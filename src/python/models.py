from typing import Any, Dict, List, Optional, Tuple, Union

from pydantic import BaseModel, Field


class NetworkNode(BaseModel):
    id: str
    type: str
    properties: Dict[str, Any]

class NetworkConnection(BaseModel):
    source: str
    target: str
    weight: float
    properties: Dict[str, Any]

class NeuroscopeNetwork(BaseModel):
    type: str = Field(..., pattern="^(ANN|SNN|Connectome)$")
    nodes: List[NetworkNode]
    connections: List[NetworkConnection]

class LayerProperties(BaseModel):
    type: str
    trainable_parameters: int
    
    # Common optional properties
    has_bias: Optional[bool] = None
    
    # Linear layer properties
    in_features: Optional[int] = None
    out_features: Optional[int] = None
    
    # Convolutional layer properties (1D and 2D)
    in_channels: Optional[int] = None
    out_channels: Optional[int] = None
    kernel_size: Optional[Union[int, Tuple[int, int]]] = None
    stride: Optional[Union[int, Tuple[int, int]]] = None
    padding: Optional[Union[int, Tuple[int, int]]] = None
    
    # BatchNorm properties
    num_features: Optional[int] = None
    eps: Optional[float] = None
    momentum: Optional[float] = None
    affine: Optional[bool] = None
    
    # Recurrent layer properties
    input_size: Optional[int] = None
    hidden_size: Optional[int] = None
    num_layers: Optional[int] = None
    bidirectional: Optional[bool] = None
    
    # Activation function properties
    activation_type: Optional[str] = None
    inplace: Optional[bool] = None
    negative_slope: Optional[float] = None
    
    # Pooling layer properties
    output_size: Optional[Union[int, Tuple[int, int]]] = None
    
    # Dropout properties
    p: Optional[float] = None 