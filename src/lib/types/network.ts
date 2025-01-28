import { z } from 'zod';
import { 
  ValidNetwork,
  ValidANN,
  ValidSNN,
  ValidConnectome,
  NetworkSchema,
  ANNSchema,
  SNNSchema,
  ConnectomeSchema
} from '../validation/network';

// Re-export the validated types
export type Network = ValidNetwork;
export type ANN = ValidANN;
export type SNN = ValidSNN;
export type Connectome = ValidConnectome;

// Helper function to validate networks
export function validateNetwork(network: unknown): Network {
  return NetworkSchema.parse(network);
}

export function validateANN(network: unknown): ANN {
  return ANNSchema.parse(network);
}

export function validateSNN(network: unknown): SNN {
  return SNNSchema.parse(network);
}

export function validateConnectome(network: unknown): Connectome {
  return ConnectomeSchema.parse(network);
}

// Type guards using Zod validation
export function isNetwork(network: unknown): network is Network {
  return NetworkSchema.safeParse(network).success;
}

export function isANN(network: unknown): network is ANN {
  return ANNSchema.safeParse(network).success;
}

export function isSNN(network: unknown): network is SNN {
  return SNNSchema.safeParse(network).success;
}

export function isConnectome(network: unknown): network is Connectome {
  return ConnectomeSchema.safeParse(network).success;
}

export type NetworkType = 'ANN' | 'SNN' | 'Connectome';

export type SpatialInfo = {
  x: number;
  y: number;
  z: number;
};

export type Node = {
  id: string;
  type: string;
  properties: Record<string, any>;
  spatialInfo?: SpatialInfo;
};

export type Connection = {
  source: string;
  target: string;
  weight: number;
  properties: Record<string, any>;
};

export type DynamicsConfig = {
  temporalResolution?: number;
  simulationParameters?: Record<string, any>;
};

export type NeuroscopeNetwork = {
  type: NetworkType;
  nodes: Node[];
  connections: Connection[];
  dynamics?: DynamicsConfig;
};

// Validation types
export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

// Network-specific property interfaces
export interface ANNProperties {
  activationFunction: string;
  biases?: number[];
  layerType: string;
}

export interface SNNProperties extends ANNProperties {
  membraneThreshold: number;
  refractoryPeriod: number;
  restingPotential: number;
}

export interface ConnectomeProperties {
  cellType: string;
  neurotransmitter?: string;
  region?: string;
} 