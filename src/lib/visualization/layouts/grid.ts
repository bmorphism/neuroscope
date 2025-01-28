import { VisualizationNode, VisualizationLink, GridLayoutOptions } from '../types';

export class GridLayout {
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public apply(
    nodes: VisualizationNode[],
    links: VisualizationLink[],
    options?: GridLayoutOptions
  ): { nodes: VisualizationNode[]; links: VisualizationLink[] } {
    const padding = options?.padding || 50;
    const numNodes = nodes.length;

    // Calculate grid dimensions
    let cols = options?.columns;
    let rows = options?.rows;

    if (!cols && !rows) {
      // If neither is specified, try to make a square grid
      cols = Math.ceil(Math.sqrt(numNodes));
      rows = Math.ceil(numNodes / cols);
    } else if (!cols) {
      // If only rows specified, calculate cols
      rows = rows!;
      cols = Math.ceil(numNodes / rows);
    } else if (!rows) {
      // If only cols specified, calculate rows
      rows = Math.ceil(numNodes / cols);
    }

    // Calculate cell size
    const cellWidth = (this.width - 2 * padding) / cols;
    const cellHeight = (this.height - 2 * padding) / rows;

    // Position nodes in grid
    nodes.forEach((node, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);

      node.fx = padding + col * cellWidth + cellWidth / 2;
      node.fy = padding + row * cellHeight + cellHeight / 2;
    });

    return { nodes, links };
  }
} 