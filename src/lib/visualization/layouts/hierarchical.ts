import { VisualizationNode, VisualizationLink, HierarchicalLayoutOptions } from '../types';

export class HierarchicalLayout {
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public apply(
    nodes: VisualizationNode[],
    links: VisualizationLink[],
    options?: HierarchicalLayoutOptions
  ): { nodes: VisualizationNode[]; links: VisualizationLink[] } {
    const nodeSpacing = options?.nodeSpacing || 50;
    const levelSpacing = options?.levelSpacing || 100;
    const isVertical = options?.direction !== 'horizontal';

    // Create a map of node levels
    const levels = new Map<string, number>();
    const visited = new Set<string>();

    // Find root nodes (nodes with no incoming edges)
    const incomingEdges = new Map<string, number>();
    links.forEach(link => {
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;
      incomingEdges.set(targetId, (incomingEdges.get(targetId) || 0) + 1);
    });

    const rootNodes = nodes.filter(node => !incomingEdges.has(node.id));

    // Assign levels using BFS
    const queue = rootNodes.map(node => ({ node, level: 0 }));
    while (queue.length > 0) {
      const { node, level } = queue.shift()!;
      if (visited.has(node.id)) continue;

      visited.add(node.id);
      levels.set(node.id, level);

      // Find outgoing edges
      const outgoingLinks = links.filter(link => {
        const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
        return sourceId === node.id;
      });

      // Add child nodes to queue
      outgoingLinks.forEach(link => {
        const targetId = typeof link.target === 'string' ? link.target : link.target.id;
        const targetNode = nodes.find(n => n.id === targetId);
        if (targetNode && !visited.has(targetId)) {
          queue.push({ node: targetNode, level: level + 1 });
        }
      });
    }

    // Count nodes at each level
    const nodesPerLevel = new Map<number, number>();
    levels.forEach((level) => {
      nodesPerLevel.set(level, (nodesPerLevel.get(level) || 0) + 1);
    });

    // Position nodes
    nodes.forEach(node => {
      const level = levels.get(node.id) || 0;
      const nodesInLevel = nodesPerLevel.get(level) || 1;
      const index = Array.from(levels.entries())
        .filter(([, l]) => l === level)
        .findIndex(([id]) => id === node.id);

      if (isVertical) {
        node.fx = (this.width * (index + 1)) / (nodesInLevel + 1);
        node.fy = levelSpacing + level * levelSpacing;
      } else {
        node.fx = levelSpacing + level * levelSpacing;
        node.fy = (this.height * (index + 1)) / (nodesInLevel + 1);
      }
    });

    return { nodes, links };
  }
} 