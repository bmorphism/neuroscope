import { VisualizationNode, VisualizationLink, LayoutOptions, LayoutType } from '../types';
import { ForceLayout } from './force';
import { HierarchicalLayout } from './hierarchical';
import { CircularLayout } from './circular';
import { GridLayout } from './grid';

export class LayoutManager {
  private width: number;
  private height: number;
  private layouts: Record<LayoutType, any>;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;

    this.layouts = {
      force: new ForceLayout(width, height),
      hierarchical: new HierarchicalLayout(width, height),
      circular: new CircularLayout(width, height),
      grid: new GridLayout(width, height)
    };
  }

  public applyLayout(
    nodes: VisualizationNode[],
    links: VisualizationLink[],
    options: LayoutOptions
  ): { nodes: VisualizationNode[]; links: VisualizationLink[] } {
    const layout = this.layouts[options.type];
    if (!layout) {
      throw new Error(`Unsupported layout type: ${options.type}`);
    }

    // Clone nodes and links to avoid modifying originals
    const clonedNodes = nodes.map(node => ({ ...node }));
    const clonedLinks = links.map(link => ({ ...link }));

    // Apply layout
    layout.apply(clonedNodes, clonedLinks, options.options);

    return {
      nodes: clonedNodes,
      links: clonedLinks
    };
  }

  public suggestLayout(network: { type: string; nodes: VisualizationNode[]; links: VisualizationLink[] }): LayoutOptions {
    // Suggest the most appropriate layout based on network type and structure
    switch (network.type) {
      case 'ANN':
        return {
          type: 'hierarchical',
          options: {
            width: this.width,
            height: this.height,
            direction: 'LR',
            levelSpacing: 100,
            nodeSpacing: 50
          }
        };

      case 'Connectome':
        return {
          type: 'circular',
          options: {
            width: this.width,
            height: this.height,
            sortBy: 'type'
          }
        };

      case 'SNN':
        // For SNNs, use hierarchical if it has clear layers, otherwise use force
        const hasLayers = this.detectLayers(network.nodes, network.links);
        return hasLayers ? {
          type: 'hierarchical',
          options: {
            width: this.width,
            height: this.height,
            direction: 'LR'
          }
        } : {
          type: 'force',
          options: {
            width: this.width,
            height: this.height,
            chargeStrength: -30,
            linkDistance: 100
          }
        };

      default:
        return {
          type: 'force',
          options: {
            width: this.width,
            height: this.height
          }
        };
    }
  }

  private detectLayers(nodes: VisualizationNode[], links: VisualizationLink[]): boolean {
    // Simple heuristic: check if nodes have clear input/output separation
    const hasIncoming = new Set<string>();
    const hasOutgoing = new Set<string>();

    links.forEach(link => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;
      
      hasOutgoing.add(sourceId);
      hasIncoming.add(targetId);
    });

    // If there are clear input nodes (no incoming) and output nodes (no outgoing),
    // it's likely a layered network
    const inputNodes = nodes.filter(n => !hasIncoming.has(n.id));
    const outputNodes = nodes.filter(n => !hasOutgoing.has(n.id));

    return inputNodes.length > 0 && outputNodes.length > 0;
  }
} 