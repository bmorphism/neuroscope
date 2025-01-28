import { VisualizationNode, VisualizationLink, ForceLayoutOptions } from '../types';

export class ForceLayout {
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public apply(
    nodes: VisualizationNode[],
    links: VisualizationLink[],
    options?: ForceLayoutOptions
  ): { nodes: VisualizationNode[]; links: VisualizationLink[] } {
    // For force layout, we just reset any fixed positions
    nodes.forEach(node => {
      node.fx = undefined;
      node.fy = undefined;
    });

    return { nodes, links };
  }
} 