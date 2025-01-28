'use client';

import React from 'react';
import { NetworkViewer } from '@/components/NetworkViewer';
import { ControlPanel } from '@/components/ControlPanel';
import { PropertyInspector } from '@/components/PropertyInspector';
import { NetworkStats } from '@/components/NetworkStats';
import { ModelImporter } from '@/components/ModelImporter';
import { TrainingMetricsPanel } from '@/components/TrainingMetricsPanel';
import { VisualizationConfig, VisualizationNode, VisualizationLink, LayoutOptions } from '@/lib/visualization/types';
import { NeuroscopeNetwork } from '@/lib/types/network';
import { TrainingVisualizer } from '@/lib/visualization/training';
import { TrainingMetrics } from '@/lib/visualization/training';

const DEFAULT_CONFIG: VisualizationConfig = {
  width: 800,
  height: 600,
  nodeRadius: 10,
  nodeColor: '#3b82f6',
  linkColor: '#64748b',
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

export default function DemoPage() {
  const [network, setNetwork] = React.useState<NeuroscopeNetwork | null>(null);
  const [config, setConfig] = React.useState<VisualizationConfig>(DEFAULT_CONFIG);
  const [selectedNode, setSelectedNode] = React.useState<VisualizationNode | null>(null);
  const [selectedLink, setSelectedLink] = React.useState<VisualizationLink | null>(null);
  const [networkState, setNetworkState] = React.useState<{
    nodes: VisualizationNode[];
    links: VisualizationLink[];
  } | null>(null);
  const [trainingMetrics, setTrainingMetrics] = React.useState<TrainingMetrics[]>([]);
  const [smoothedMetrics, setSmoothedMetrics] = React.useState<Map<string, number>>(new Map());
  const visualizerRef = React.useRef<TrainingVisualizer | null>(null);

  const handleConfigChange = (newConfig: Partial<VisualizationConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  const handleLayoutChange = (layout: LayoutOptions) => {
    setConfig(prev => ({ ...prev, layout }));
  };

  const handleNodeClick = (nodeId: string) => {
    const node = networkState?.nodes.find(n => n.id === nodeId) || null;
    setSelectedNode(node);
    setSelectedLink(null);
  };

  const handleLinkClick = (sourceId: string, targetId: string) => {
    const link = networkState?.links.find(l => {
      const source = typeof l.source === 'string' ? l.source : l.source.id;
      const target = typeof l.target === 'string' ? l.target : l.target.id;
      return source === sourceId && target === targetId;
    }) || null;
    setSelectedLink(link);
    setSelectedNode(null);
  };

  const handleNetworkUpdate = (nodes: VisualizationNode[], links: VisualizationLink[]) => {
    setNetworkState({ nodes, links });
  };

  const handleImport = (importedNetwork: NeuroscopeNetwork) => {
    setNetwork(importedNetwork);
  };

  // WebSocket connection for training updates
  React.useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/training');
    
    ws.onmessage = (event) => {
      const metrics: TrainingMetrics = JSON.parse(event.data);
      setTrainingMetrics(prev => [...prev, metrics]);
      
      // Update visualization if we have a visualizer
      if (visualizerRef.current) {
        visualizerRef.current.updateMetrics(metrics);
        setSmoothedMetrics(visualizerRef.current.getSmoothedMetrics());
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {network ? (
            <NetworkViewer
              network={network}
              config={config}
              onNodeClick={handleNodeClick}
              onLinkClick={handleLinkClick}
              onNetworkUpdate={handleNetworkUpdate}
            />
          ) : (
            <div className="w-full min-h-[400px] bg-white dark:bg-gray-800 rounded-lg shadow-sm flex items-center justify-center">
              <p className="text-gray-500">Import a model to visualize</p>
            </div>
          )}
          
          {trainingMetrics.length > 0 && (
            <TrainingMetricsPanel
              metrics={trainingMetrics}
              smoothedMetrics={smoothedMetrics}
            />
          )}
        </div>
        
        <div className="space-y-4">
          <ModelImporter onImport={handleImport} />
          {network && <ControlPanel config={config} onConfigChange={handleConfigChange} onLayoutChange={handleLayoutChange} />}
          <PropertyInspector
            node={selectedNode}
            link={selectedLink}
          />
          {networkState && (
            <NetworkStats
              nodes={networkState.nodes}
              links={networkState.links}
            />
          )}
        </div>
      </div>
    </div>
  );
} 