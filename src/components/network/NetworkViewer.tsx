import React, { useEffect, useRef } from 'react';
import { VisualizationEngine } from '@/lib/visualization/engine';
import { NeuroscopeNetwork } from '@/lib/types/network';
import { VisualizationConfig, VisualizationEvents, VisualizationNode, VisualizationLink } from '@/lib/visualization/types';

interface NetworkViewerProps {
  network: NeuroscopeNetwork;
  config?: Partial<VisualizationConfig>;
  className?: string;
  onNodeClick?: VisualizationEvents['onNodeClick'];
  onNodeHover?: VisualizationEvents['onNodeHover'];
  onLinkClick?: VisualizationEvents['onLinkClick'];
  onZoom?: VisualizationEvents['onZoom'];
  onNetworkUpdate?: (nodes: VisualizationNode[], links: VisualizationLink[]) => void;
}

export const NetworkViewer: React.FC<NetworkViewerProps> = ({
  network,
  config,
  className = '',
  onNodeClick,
  onNodeHover,
  onLinkClick,
  onZoom,
  onNetworkUpdate
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<VisualizationEngine | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize visualization engine
    engineRef.current = new VisualizationEngine(
      containerRef.current,
      {
        ...config,
        nodeColor: '#ffffff', // White nodes
        linkColor: '#a0aec0', // Light gray links
        labelFontSize: 12
      },
      {
        onNodeClick,
        onNodeHover,
        onLinkClick,
        onZoom,
        onNetworkUpdate: (nodes, links) => {
          onNetworkUpdate?.(nodes, links);
        }
      }
    );

    // Set initial network
    engineRef.current.setNetwork(network);

    // Cleanup
    return () => {
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, []); // Empty deps array as we handle updates separately

  // Handle network updates
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setNetwork(network);
    }
  }, [network]);

  // Handle config updates
  useEffect(() => {
    if (engineRef.current && config) {
      if (config.layout) {
        engineRef.current.setLayout(config.layout);
      } else {
        // Update other config options
        engineRef.current.updateConfig(config);
      }
    }
  }, [config]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full bg-gray-900 ${className}`}
      data-testid="network-viewer"
    />
  );
}; 