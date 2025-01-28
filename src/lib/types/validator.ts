import { NeuroscopeNetwork, ValidationResult, NetworkType } from './network';

export class NetworkValidator {
  private validateNode(node: any): string[] {
    const errors: string[] = [];
    
    if (!node.id || typeof node.id !== 'string') {
      errors.push(`Invalid node ID: ${node.id}`);
    }
    
    if (!node.type || typeof node.type !== 'string') {
      errors.push(`Invalid node type: ${node.type}`);
    }
    
    if (node.spatialInfo) {
      const { x, y, z } = node.spatialInfo;
      if (typeof x !== 'number' || typeof y !== 'number' || typeof z !== 'number') {
        errors.push('Invalid spatial information format');
      }
    }
    
    return errors;
  }
  
  private validateConnection(connection: any, nodeIds: Set<string>): string[] {
    const errors: string[] = [];
    
    if (!nodeIds.has(connection.source)) {
      errors.push(`Invalid source node ID: ${connection.source}`);
    }
    
    if (!nodeIds.has(connection.target)) {
      errors.push(`Invalid target node ID: ${connection.target}`);
    }
    
    if (typeof connection.weight !== 'number') {
      errors.push('Connection weight must be a number');
    }
    
    return errors;
  }
  
  private validateDynamics(dynamics: any): string[] {
    const errors: string[] = [];
    
    if (dynamics.temporalResolution && typeof dynamics.temporalResolution !== 'number') {
      errors.push('Temporal resolution must be a number');
    }
    
    return errors;
  }
  
  public validate(network: NeuroscopeNetwork): ValidationResult {
    const errors: string[] = [];
    
    // Validate network type
    if (!['ANN', 'SNN', 'Connectome'].includes(network.type)) {
      errors.push(`Invalid network type: ${network.type}`);
    }
    
    // Validate nodes
    const nodeIds = new Set<string>();
    network.nodes.forEach(node => {
      errors.push(...this.validateNode(node));
      nodeIds.add(node.id);
    });
    
    // Validate connections
    network.connections.forEach(connection => {
      errors.push(...this.validateConnection(connection, nodeIds));
    });
    
    // Validate dynamics if present
    if (network.dynamics) {
      errors.push(...this.validateDynamics(network.dynamics));
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
} 