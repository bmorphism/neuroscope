import * as d3 from 'd3';
import { VisualizationNode, VisualizationLink, ForceLayoutOptions } from '../types';

export class ForceLayout {
  private width: number;
  private height: number;
  private simulation!: d3.Simulation<VisualizationNode, VisualizationLink>;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.initializeSimulation();
  }

  private initializeSimulation() {
    this.simulation = d3.forceSimulation<VisualizationNode>()
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force('collision', d3.forceCollide().radius(30))
      .force('x', d3.forceX(this.width / 2))
      .force('y', d3.forceY(this.height / 2));
  }

  public apply(
    nodes: VisualizationNode[],
    links: VisualizationLink[],
    options?: ForceLayoutOptions
  ): { nodes: VisualizationNode[]; links: VisualizationLink[] } {
    const { 
      chargeStrength = -30,
      linkDistance = 100
    } = options || {};

    // Reset any fixed positions
    nodes.forEach(node => {
      node.fx = undefined;
      node.fy = undefined;
    });

    // Create a map of node IDs to node objects
    const nodeMap = new Map(nodes.map(node => [node.id, node]));

    // Convert string IDs to node references in links
    const processedLinks = links.map(link => ({
      ...link,
      source: typeof link.source === 'string' ? nodeMap.get(link.source) : link.source,
      target: typeof link.target === 'string' ? nodeMap.get(link.target) : link.target
    })).filter(link => link.source && link.target) as VisualizationLink[];

    // Configure forces
    this.simulation
      .force('charge', d3.forceManyBody().strength(chargeStrength))
      .force('link', d3.forceLink<VisualizationNode, VisualizationLink>(processedLinks)
        .id(d => d.id)
        .distance(linkDistance));

    // Run simulation
    this.simulation
      .nodes(nodes)
      .alpha(1)
      .restart();

    // Let simulation run for a few ticks to establish initial positions
    for (let i = 0; i < 300; ++i) {
      this.simulation.tick();
    }

    return { nodes, links };
  }

  public destroy() {
    if (this.simulation) {
      this.simulation.stop();
    }
  }
}
