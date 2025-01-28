from typing import Any, Dict, List, Optional

from pydantic import BaseModel


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
    type: str
    nodes: List[NetworkNode]
    connections: List[NetworkConnection]

class TrainingMetrics(BaseModel):
    epoch: int
    loss: float
    accuracy: Optional[float] = None
    gradients: Dict[str, float]
    activations: Dict[str, float]
    custom_metrics: Optional[Dict[str, float]] = None 