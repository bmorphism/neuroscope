import * as d3 from 'd3';
import {
  VisualizationNode,
  VisualizationLink,
  VisualizationConfig,
  VisualizationState,
  VisualizationEvents,
  LayoutOptions,
  ForceLayoutOptions
} from './types';
import { NeuroscopeNetwork } from '../types/network';
import { LayoutManager } from './layouts/manager';

const DEFAULT_CONFIG: VisualizationConfig = {
  width: 800,
  height: 600,
  nodeRadius: 10,
  nodeColor: '#3b82f6', // Blue nodes
  linkColor: '#64748b', // Slate gray links
  linkWidth: 2,
  chargeStrength: -30,
  linkDistance: 100,
  showLabels: true,
  showTooltips: true,
  showWeights: true,
  directed: true,
  arrowSize: 10,
  labelFontSize: 12,
  layout: {
    type: 'force',
    options: {
      width: 800,
      height: 600
    }
  }
};

interface NodeHighlight {
  nodeId: string;
  color: string;
  duration: number;
}

interface ConnectionHighlight {
  sourceId: string;
  targetId: string;
  color: string;
  duration: number;
}

interface AnimationState {
  nodeHighlights: Map<string, NodeHighlight>;
  connectionHighlights: Map<string, ConnectionHighlight>;
  activations: Map<string, number>;
  gradients: Map<string, number>;
}

export class VisualizationEngine {
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private container: d3.Selection<SVGGElement, unknown, null, undefined>;
  private simulation!: d3.Simulation<VisualizationNode, VisualizationLink>;
  private state: VisualizationState;
  private events: VisualizationEvents;
  private tooltip: d3.Selection<HTMLDivElement, unknown, null, undefined>;
  private layoutManager: LayoutManager;
  private isDestroyed: boolean = false;
  private animationState: AnimationState;
  private animationFrame: number | null = null;

  constructor(
    container: HTMLElement,
    config: Partial<VisualizationConfig> = {},
    events: VisualizationEvents = {}
  ) {
    this.state = {
      nodes: [],
      links: [],
      config: { ...DEFAULT_CONFIG, ...config },
      transform: { x: 0, y: 0, scale: 1 }
    };
    this.events = events;
    this.layoutManager = new LayoutManager(this.state.config.width, this.state.config.height);

    // Initialize SVG with a group for zoom
    this.svg = d3
      .select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${this.state.config.width} ${this.state.config.height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Create container for zoomable elements
    this.container = this.svg.append('g');

    // Initialize tooltip
    this.tooltip = d3.select(container)
      .append('div')
      .attr('class', 'fixed hidden bg-gray-900 text-white p-2 rounded shadow-lg text-sm pointer-events-none border border-gray-700')
      .style('z-index', '50')
      .style('max-width', '300px')
      .style('word-wrap', 'break-word');

    this.animationState = {
      nodeHighlights: new Map(),
      connectionHighlights: new Map(),
      activations: new Map(),
      gradients: new Map()
    };

    this.initializeArrowMarker();
    this.initializeZoom();
    this.initializeSimulation();

    // Add double-click handler for node expansion
    this.container.on('dblclick', (event, d) => {
      if (d && this.events.onNodeExpand) {
        this.events.onNodeExpand(d.id);
      }
    });

    // Add right-click context menu
    this.container.on('contextmenu', (event) => {
      event.preventDefault();
      const d = event.target.__data__;
      if (d && this.events.onContextMenu) {
        this.events.onContextMenu(d.id, event.pageX, event.pageY);
      }
    });

    // Add hover effects
    this.container
      .on('mouseover', (event, d) => {
        if (d) {
          this.highlightConnectedNodes(d.id);
        }
      })
      .on('mouseout', () => {
        this.clearHighlights();
      });
  }

  private initializeArrowMarker(): void {
    this.svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', this.state.config.arrowSize)
      .attr('markerHeight', this.state.config.arrowSize)
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', this.state.config.linkColor);
  }

  private initializeZoom(): void {
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => this.handleZoom(event));
    
    this.svg.call(zoom);
  }

  private initializeSimulation(): void {
    this.simulation = d3.forceSimulation<VisualizationNode, VisualizationLink>()
      .force('charge', d3.forceManyBody().strength(this.state.config.chargeStrength))
      .force('center', d3.forceCenter(this.state.config.width / 2, this.state.config.height / 2))
      .on('tick', () => this.tick());

    this.simulation.force('link', d3.forceLink<VisualizationNode, VisualizationLink>()
      .id(d => d.id)
      .distance(this.state.config.linkDistance));
  }

  private handleZoom(event: d3.D3ZoomEvent<SVGSVGElement, unknown>): void {
    if (this.isDestroyed) return;
    this.state.transform = {
      x: event.transform.x,
      y: event.transform.y,
      scale: event.transform.k
    };
    this.container.attr('transform', event.transform.toString());
  }

  public destroy(): void {
    this.isDestroyed = true;
    if (this.simulation) {
      this.simulation.stop();
    }
    this.svg.remove();
    this.tooltip.remove();
  }

  public updateConfig(config: Partial<VisualizationConfig>): void {
    if (this.isDestroyed) return;

    const prevConfig = this.state.config;
    this.state.config = { ...this.state.config, ...config };

    // Update force simulation parameters if they changed
    if (config.chargeStrength !== undefined && config.chargeStrength !== prevConfig.chargeStrength) {
      this.simulation.force('charge', d3.forceManyBody().strength(config.chargeStrength));
    }
    if (config.linkDistance !== undefined && config.linkDistance !== prevConfig.linkDistance) {
      const linkForce = this.simulation.force<d3.ForceLink<VisualizationNode, VisualizationLink>>('link');
      if (linkForce) linkForce.distance(config.linkDistance);
    }

    // Update visual properties
    if (config.nodeRadius !== undefined) {
      this.container.selectAll<SVGCircleElement, VisualizationNode>('circle')
        .attr('r', config.nodeRadius);
    }
    if (config.linkWidth !== undefined) {
      this.container.selectAll<SVGLineElement, VisualizationLink>('line')
        .attr('stroke-width', config.linkWidth);
    }
    if (config.nodeColor !== undefined) {
      this.container.selectAll<SVGCircleElement, VisualizationNode>('circle')
        .attr('fill', config.nodeColor);
    }
    if (config.linkColor !== undefined) {
      this.container.selectAll<SVGLineElement, VisualizationLink>('line')
        .attr('stroke', config.linkColor);
      // Update arrow marker color
      this.svg.select('defs marker path').attr('fill', config.linkColor);
    }

    // Update layout if it changed
    if (config.layout && config.layout !== prevConfig.layout) {
      const { nodes: layoutedNodes, links: layoutedLinks } = 
        this.layoutManager.applyLayout(this.state.nodes, this.state.links, config.layout);
      
      this.state.nodes = layoutedNodes;
      this.state.links = layoutedLinks;
      
      if (config.layout.type === 'force') {
        this.simulation.alpha(1).restart();
      } else {
        this.simulation.stop();
        this.updateVisualization();
      }
    }

    // Update visibility
    this.container.selectAll<SVGTextElement, VisualizationNode>('text.label')
      .style('display', this.state.config.showLabels ? 'block' : 'none');
    this.container.selectAll<SVGTextElement, VisualizationLink>('text.weight')
      .style('display', this.state.config.showWeights ? 'block' : 'none');
    this.container.selectAll<SVGLineElement, VisualizationLink>('line')
      .attr('marker-end', this.state.config.directed ? 'url(#arrowhead)' : null);

    // Restart simulation if using force layout
    if (this.state.config.layout?.type === 'force') {
      this.simulation.alpha(0.3).restart();
    }
  }

  public updateCallbacks(events: VisualizationEvents): void {
    if (this.isDestroyed) return;
    this.events = events;
  }

  private tick(): void {
    if (this.isDestroyed) return;

    // Update node positions
    this.container.selectAll<SVGCircleElement, VisualizationNode>('circle')
      .attr('cx', d => d.x!)
      .attr('cy', d => d.y!);

    // Update node labels
    this.container.selectAll<SVGTextElement, VisualizationNode>('text.label')
      .attr('x', d => d.x!)
      .attr('y', d => d.y! - (d.radius || this.state.config.nodeRadius) * 1.5);

    // Update link positions
    this.container.selectAll<SVGLineElement, VisualizationLink>('line')
      .attr('x1', d => (d.source as VisualizationNode).x!)
      .attr('y1', d => (d.source as VisualizationNode).y!)
      .attr('x2', d => (d.target as VisualizationNode).x!)
      .attr('y2', d => (d.target as VisualizationNode).y!);

    // Update weight labels
    if (this.state.config.showWeights) {
      this.container.selectAll<SVGTextElement, VisualizationLink>('text.weight')
        .attr('x', d => ((d.source as VisualizationNode).x! + (d.target as VisualizationNode).x!) / 2)
        .attr('y', d => ((d.source as VisualizationNode).y! + (d.target as VisualizationNode).y!) / 2 - 5);
    }
  }

  public setNetwork(network: NeuroscopeNetwork): void {
    if (this.isDestroyed) return;

    // Convert network nodes and links to visualization format
    const nodes: VisualizationNode[] = network.nodes.map(node => ({
      id: node.id,
      type: node.type,
      properties: node.properties,
      radius: this.state.config.nodeRadius,
      color: this.state.config.nodeColor,
      label: node.type
    }));

    const links: VisualizationLink[] = network.connections.map(conn => ({
      source: conn.source,
      target: conn.target,
      weight: conn.weight,
      properties: conn.properties,
      color: this.state.config.linkColor
    }));

    // Update state
    this.state.nodes = nodes;
    this.state.links = links;

    // Apply current layout
    if (this.state.config.layout) {
      const { nodes: layoutedNodes, links: layoutedLinks } = 
        this.layoutManager.applyLayout(nodes, links, this.state.config.layout);
      
      this.state.nodes = layoutedNodes;
      this.state.links = layoutedLinks;
    }

    // Update visualization
    this.updateVisualization();

    // Notify about network update
    if (this.events.onNetworkUpdate) {
      this.events.onNetworkUpdate(this.state.nodes, this.state.links);
    }
  }

  private updateVisualization(): void {
    if (this.isDestroyed) return;

    // Update nodes
    const nodes = this.container
      .selectAll<SVGGElement, VisualizationNode>('g.node')
      .data(this.state.nodes, d => d.id);

    // Remove old nodes
    nodes.exit().remove();

    // Add new nodes
    const nodesEnter = nodes.enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .on('click', (event, d) => this.events.onNodeClick?.(d.id))
      .on('mouseover', (event, d) => {
        if (this.state.config.showTooltips) {
          const properties = Object.entries(d.properties || {})
            .map(([key, value]) => `<div><span class="font-medium">${key}:</span> ${value}</div>`)
            .join('');

          this.tooltip
            .html(`<div class="font-medium mb-1">Type: ${d.type}</div>${properties}`)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 10}px`)
            .classed('hidden', false);
        }
      })
      .on('mouseout', () => {
        this.tooltip.classed('hidden', true);
      });

    nodesEnter.append('circle')
      .attr('r', d => d.radius || this.state.config.nodeRadius)
      .attr('fill', d => {
        const activation = this.animationState.activations.get(d.id);
        if (activation !== undefined) {
          // Use a color scale based on activation
          return d3.interpolateRdYlBu(1 - activation);
        }
        return d.color || this.state.config.nodeColor;
      })
      .style('stroke', d => {
        const gradient = this.animationState.gradients.get(d.id);
        if (gradient !== undefined) {
          // Use a color scale based on gradient magnitude
          return d3.interpolateViridis(Math.abs(gradient));
        }
        return 'none';
      })
      .style('stroke-width', d => 
        this.animationState.gradients.has(d.id) ? '2px' : '0px'
      );

    nodesEnter.append('text')
      .attr('class', 'label')
      .attr('text-anchor', 'middle')
      .attr('dy', '-1.5em')
      .style('font-size', `${this.state.config.labelFontSize}px`)
      .style('fill', 'currentColor')
      .text(d => d.label || d.type);

    // Update links
    const links = this.container
      .selectAll<SVGGElement, VisualizationLink>('g.link')
      .data(this.state.links, d => {
        const source = typeof d.source === 'string' ? d.source : d.source.id;
        const target = typeof d.target === 'string' ? d.target : d.target.id;
        return `${source}-${target}`;
      });

    // Remove old links
    links.exit().remove();

    // Add new links
    const linksEnter = links.enter()
      .append('g')
      .attr('class', 'link')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        const source = typeof d.source === 'string' ? d.source : d.source.id;
        const target = typeof d.target === 'string' ? d.target : d.target.id;
        this.events.onLinkClick?.(source, target);
      })
      .on('mouseover', (event, d) => {
        if (this.state.config.showTooltips) {
          const properties = Object.entries(d.properties || {})
            .map(([key, value]) => `<div><span class="font-medium">${key}:</span> ${value}</div>`)
            .join('');

          const weight = d.weight ? `<div class="font-medium mb-1">Weight: ${d.weight.toFixed(4)}</div>` : '';

          this.tooltip
            .html(`${weight}${properties}`)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 10}px`)
            .classed('hidden', false);
        }
      })
      .on('mouseout', () => {
        this.tooltip.classed('hidden', true);
      });

    linksEnter.append('line')
      .attr('stroke-width', this.state.config.linkWidth)
      .attr('stroke', d => d.color || this.state.config.linkColor)
      .attr('marker-end', this.state.config.directed ? 'url(#arrowhead)' : null);

    if (this.state.config.showWeights) {
      linksEnter.append('text')
        .attr('class', 'weight')
        .attr('text-anchor', 'middle')
        .style('font-size', `${this.state.config.labelFontSize}px`)
        .style('fill', 'currentColor')
        .text(d => d.weight ? d.weight.toFixed(2) : '');
    }

    // Update force simulation
    if (this.state.config.layout?.type === 'force') {
      this.simulation.nodes(this.state.nodes);
      const linkForce = this.simulation.force<d3.ForceLink<VisualizationNode, VisualizationLink>>('link');
      if (linkForce) linkForce.links(this.state.links);
      this.simulation.alpha(1).restart();
    }
  }

  public setLayout(options: LayoutOptions): void {
    // Stop any ongoing force simulation immediately
    this.simulation.stop();
    this.simulation.alpha(0);

    this.state.config.layout = options;

    // Apply new layout
    const { nodes, links } = this.layoutManager.applyLayout(
      this.state.nodes,
      this.state.links,
      options
    );

    // Update state with new positions
    this.state.nodes = nodes;
    this.state.links = links;

    // Reset all forces
    this.simulation.force('charge', null);
    this.simulation.force('center', null);
    this.simulation.force('link', null);

    if (options.type === 'force') {
      // For force layout, set up forces and let simulation run
      this.state.nodes.forEach(node => {
        node.fx = undefined;
        node.fy = undefined;
      });

      const forceOptions = options.options as ForceLayoutOptions;
      
      this.simulation
        .force('charge', d3.forceManyBody().strength(forceOptions.chargeStrength || this.state.config.chargeStrength))
        .force('center', d3.forceCenter(this.state.config.width / 2, this.state.config.height / 2))
        .force('link', d3.forceLink<VisualizationNode, VisualizationLink>(this.state.links)
          .id(d => d.id)
          .distance(forceOptions.linkDistance || this.state.config.linkDistance));

      this.simulation
        .nodes(this.state.nodes)
        .alpha(1)
        .restart();
    } else {
      // For fixed layouts, ensure positions are locked
      this.state.nodes.forEach(node => {
        // Ensure nodes have valid positions
        if (typeof node.x === 'number' && typeof node.y === 'number') {
          node.fx = node.x;
          node.fy = node.y;
        } else {
          console.warn(`Invalid position for node ${node.id}`);
          node.x = node.fx = this.state.config.width / 2;
          node.y = node.fy = this.state.config.height / 2;
        }
      });

      // Update visuals without simulation
      this.updateVisualization();
    }

    // Notify about network update
    if (this.events.onNetworkUpdate) {
      this.events.onNetworkUpdate(this.state.nodes, this.state.links);
    }
  }

  public highlightNode(nodeId: string, color: string, duration: number = 1000): void {
    this.animationState.nodeHighlights.set(nodeId, { nodeId, color, duration });
    this.startAnimation();
  }

  public highlightConnection(sourceId: string, targetId: string, color: string, duration: number = 1000): void {
    const key = `${sourceId}-${targetId}`;
    this.animationState.connectionHighlights.set(key, { sourceId, targetId, color, duration });
    this.startAnimation();
  }

  public setNodeActivation(nodeId: string, activation: number): void {
    this.animationState.activations.set(nodeId, activation);
    this.updateVisualization();
  }

  public setGradient(nodeId: string, gradient: number): void {
    this.animationState.gradients.set(nodeId, gradient);
    this.updateVisualization();
  }

  private highlightConnectedNodes(nodeId: string): void {
    const connectedNodes = new Set<string>();
    
    // Find connected nodes through links
    this.state.links.forEach(link => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;
      
      if (sourceId === nodeId) {
        connectedNodes.add(targetId);
      }
      if (targetId === nodeId) {
        connectedNodes.add(sourceId);
      }
    });

    // Highlight connected nodes
    this.container.selectAll<SVGGElement, VisualizationNode>('g.node')
      .style('opacity', d => d.id === nodeId || connectedNodes.has(d.id) ? 1 : 0.3);

    // Highlight connected links
    this.container.selectAll<SVGGElement, VisualizationLink>('g.link')
      .style('opacity', d => {
        const sourceId = typeof d.source === 'string' ? d.source : d.source.id;
        const targetId = typeof d.target === 'string' ? d.target : d.target.id;
        return sourceId === nodeId || targetId === nodeId ? 1 : 0.3;
      });
  }

  private clearHighlights(): void {
    this.container.selectAll('g.node, g.link')
      .style('opacity', 1);
  }

  private startAnimation(): void {
    if (!this.animationFrame) {
      this.animationFrame = requestAnimationFrame(() => this.animate());
    }
  }

  private animate(): void {
    const now = performance.now();

    // Update highlights
    this.animationState.nodeHighlights.forEach((highlight, nodeId) => {
      // Apply highlight effect
      this.container.selectAll<SVGGElement, VisualizationNode>('g.node')
        .filter(d => d.id === nodeId)
        .select('circle')
        .style('stroke', highlight.color)
        .style('stroke-width', '3px');
    });

    this.animationState.connectionHighlights.forEach((highlight, key) => {
      // Apply highlight effect
      this.container.selectAll<SVGGElement, VisualizationLink>('g.link')
        .filter(d => {
          const sourceId = typeof d.source === 'string' ? d.source : d.source.id;
          const targetId = typeof d.target === 'string' ? d.target : d.target.id;
          return `${sourceId}-${targetId}` === key;
        })
        .select('line')
        .style('stroke', highlight.color)
        .style('stroke-width', '3px');
    });

    // Continue animation if there are active highlights
    if (this.animationState.nodeHighlights.size > 0 || this.animationState.connectionHighlights.size > 0) {
      this.animationFrame = requestAnimationFrame(() => this.animate());
    } else {
      this.animationFrame = null;
    }
  }
} 