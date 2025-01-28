import { VisualizationNode, VisualizationLink, LayoutType, ForceLayoutOptions, HierarchicalLayoutOptions, CircularLayoutOptions, GridLayoutOptions } from '../types';

export interface LayoutOptions {
  type: LayoutType;
  options?: ForceLayoutOptions | HierarchicalLayoutOptions | CircularLayoutOptions | GridLayoutOptions;
}

export interface LayoutResult {
  nodes: VisualizationNode[];
  links: VisualizationLink[];
}

export interface BaseLayoutOptions {
  width: number;
  height: number;
  padding?: number;
}

export interface HierarchicalLayoutOptions extends BaseLayoutOptions {
  direction?: 'TB' | 'LR'; // Top to Bottom or Left to Right
  levelSpacing?: number;
  nodeSpacing?: number;
}

export interface CircularLayoutOptions extends BaseLayoutOptions {
  radius?: number;
  startAngle?: number;
  endAngle?: number;
  sortBy?: 'type' | 'id' | 'none';
}

export interface GridLayoutOptions extends BaseLayoutOptions {
  rows?: number;
  cols?: number;
  sortBy?: 'type' | 'id' | 'none';
}

export interface ForceLayoutOptions extends BaseLayoutOptions {
  chargeStrength?: number;
  linkDistance?: number;
  centerStrength?: number;
}

export type LayoutOptions = 
  | { type: 'hierarchical'; options: HierarchicalLayoutOptions }
  | { type: 'circular'; options: CircularLayoutOptions }
  | { type: 'grid'; options: GridLayoutOptions }
  | { type: 'force'; options: ForceLayoutOptions }; 