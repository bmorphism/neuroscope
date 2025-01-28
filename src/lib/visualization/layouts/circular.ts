import { VisualizationNode, VisualizationLink, CircularLayoutOptions } from '../types';

export class CircularLayout {
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public apply(
    nodes: VisualizationNode[],
    links: VisualizationLink[],
    options?: CircularLayoutOptions
  ): { nodes: VisualizationNode[]; links: VisualizationLink[] } {
    const radius = options?.radius || Math.min(this.width, this.height) / 3;
    const startAngle = options?.startAngle || 0;
    const endAngle = options?.endAngle || 2 * Math.PI;
    const angleStep = (endAngle - startAngle) / nodes.length;

    const centerX = this.width / 2;
    const centerY = this.height / 2;

    nodes.forEach((node, index) => {
      const angle = startAngle + index * angleStep;
      node.fx = centerX + radius * Math.cos(angle);
      node.fy = centerY + radius * Math.sin(angle);
    });

    return { nodes, links };
  }
} 