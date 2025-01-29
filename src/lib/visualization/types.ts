import { SimulationNodeDatum, SimulationLinkDatum } from 'd3';
import { Node, Connection } from '../types/network';
export interface VisualizationNode extends SimulationNodeDatum {
  id: string;
  label?: string;
  color?: string;
  radius?: number;
  x?: number;
  y?: number;
  properties?: Record<string, any>;
  type?: string;
  level?: number;
  group?: string;
}

export interface VisualizationLink extends SimulationLinkDatum<VisualizationNode> {
  source: string | VisualizationNode;
  target: string | VisualizationNode;
  weight?: number;
  properties?: Record<string, any>;
  color?: string;
  originalConnection?: Connection;
}

export interface VisualizationConfig {
  width: number;
  height: number;
  nodeRadius: number;
  nodeColor: string;
  linkColor: string;
  linkWidth: number;
  chargeStrength: number;
  linkDistance: number;
  showLabels: boolean;
  showTooltips: boolean;
  showWeights: boolean;
  directed: boolean;
  arrowSize: number;
  labelFontSize: number;
  layout: LayoutOptions;
}

export interface VisualizationState {
  nodes: VisualizationNode[];
  links: VisualizationLink[];
  config: VisualizationConfig;
  transform: {
    x: number;
    y: number;
    scale: number;
  };
}

export interface VisualizationEvents {
  onClick?: (nodeId: string) => void;
  onHover?: (nodeId: string | null) => void;
  onNodeExpand?: (nodeId: string) => void;
  onContextMenu?: (nodeId: string, x: number, y: number) => void;
  onNodeClick?: (nodeId: string) => void;
  onLinkClick?: (sourceId: string, targetId: string) => void;
  onNetworkUpdate?: (nodes: VisualizationNode[], links: VisualizationLink[]) => void;
}

export type LayoutType = 'force' | 'hierarchical' | 'circular' | 'grid';

export interface LayoutOptions {
  type: LayoutType;
  options?: ForceLayoutOptions | HierarchicalLayoutOptions | CircularLayoutOptions | GridLayoutOptions;
}

export interface ForceLayoutOptions {
  width?: number;
  height?: number;
  chargeStrength?: number;
  linkDistance?: number;
}

export interface HierarchicalLayoutOptions {
  width?: number;
  height?: number;
  nodeSpacing?: number;
  levelSpacing?: number;
  direction?: 'vertical' | 'horizontal';
}

export interface CircularLayoutOptions {
  width?: number;
  height?: number;
  radius?: number;
  startAngle?: number;
  endAngle?: number;
}

export interface GridLayoutOptions {
  width?: number;
  height?: number;
  rows?: number;
  columns?: number;
  padding?: number;
}
