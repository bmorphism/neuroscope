import { z } from 'zod';

// Base property schema
export const PropertySchema = z.record(z.string(), z.any());

// Node schema with type-specific validation
export const BaseNodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  properties: PropertySchema,
});

// Connection schema with validation
export const ConnectionSchema = z.object({
  source: z.string(),
  target: z.string(),
  weight: z.number(),
  properties: PropertySchema,
});

// Layer-specific property schemas for ANNs
export const LinearLayerSchema = z.object({
  in_features: z.number(),
  out_features: z.number(),
  has_bias: z.boolean(),
  trainable_parameters: z.number(),
});

export const ConvLayerSchema = z.object({
  in_channels: z.number(),
  out_channels: z.number(),
  kernel_size: z.union([z.number(), z.tuple([z.number(), z.number()])]),
  stride: z.union([z.number(), z.tuple([z.number(), z.number()])]),
  padding: z.union([z.number(), z.tuple([z.number(), z.number()])]),
  has_bias: z.boolean(),
  trainable_parameters: z.number(),
});

export const ActivationLayerSchema = z.object({
  type: z.enum(['ReLU', 'LeakyReLU', 'Sigmoid', 'Tanh']),
  inplace: z.boolean().optional(),
  negative_slope: z.number().optional(),
});

// Network type-specific schemas
export const ANNSchema = z.object({
  type: z.literal('ANN'),
  nodes: z.array(BaseNodeSchema.extend({
    properties: z.object({
      type: z.string(),
      trainable_parameters: z.number(),
      has_bias: z.boolean().optional(),
    }).and(z.record(z.string(), z.any())),
  })),
  connections: z.array(ConnectionSchema.extend({
    properties: z.object({
      max_weight: z.number().optional(),
      min_weight: z.number().optional(),
      std_weight: z.number().optional(),
      shape: z.array(z.number()).optional(),
    }).and(z.record(z.string(), z.any())),
  })),
});

export const SNNSchema = z.object({
  type: z.literal('SNN'),
  nodes: z.array(BaseNodeSchema.extend({
    properties: z.object({
      threshold: z.number(),
      reset_potential: z.number(),
      resting_potential: z.number(),
      membrane_time_constant: z.number(),
    }),
  })),
  connections: z.array(ConnectionSchema.extend({
    properties: z.object({
      delay: z.number().optional(),
      plasticity_rule: z.string().optional(),
    }),
  })),
});

export const ConnectomeSchema = z.object({
  type: z.literal('Connectome'),
  nodes: z.array(BaseNodeSchema.extend({
    properties: z.object({
      neurotransmitter: z.string(),
      cell_type: z.string(),
      region: z.string(),
    }),
  })),
  connections: z.array(ConnectionSchema.extend({
    properties: z.object({
      synapse_type: z.string(),
      strength: z.number(),
    }),
  })),
});

// Combined network schema
export const NetworkSchema = z.discriminatedUnion('type', [
  ANNSchema,
  SNNSchema,
  ConnectomeSchema,
]);

// Type inference
export type ValidNetwork = z.infer<typeof NetworkSchema>;
export type ValidANN = z.infer<typeof ANNSchema>;
export type ValidSNN = z.infer<typeof SNNSchema>;
export type ValidConnectome = z.infer<typeof ConnectomeSchema>; 