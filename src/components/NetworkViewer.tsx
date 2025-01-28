'use client';

import React, { useRef, useEffect } from 'react';
import { VisualizationEngine } from '@/lib/visualization/engine';
import { VisualizationConfig, LayoutOptions, VisualizationNode, VisualizationLink } from '@/lib/visualization/types';
import { NeuroscopeNetwork } from '@/lib/types/network';

export interface NetworkViewerProps {
  network: NeuroscopeNetwork;
  config?: Partial<VisualizationConfig>;
  onNodeClick?: (nodeId: string) => void;
  onLinkClick?: (sourceId: string, targetId: string) => void;
  onNetworkUpdate?: (nodes: any[], links: any[]) => void;
}

export const NetworkViewer: React.FC<NetworkViewerProps> = ({
  network,
  config,
  onNodeClick,
  onLinkClick,
  onNetworkUpdate
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<VisualizationEngine | null>(null);

  // Initialize visualization engine
  useEffect(() => {
    if (!containerRef.current) return;

    engineRef.current = new VisualizationEngine(
      containerRef.current,
      config,
      {
        onNodeClick,
        onLinkClick,
        onNetworkUpdate
      }
    );

    // Set initial network
    engineRef.current.setNetwork(network);

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, [containerRef.current]);

  // Update config when it changes
  useEffect(() => {
    if (engineRef.current && config) {
      engineRef.current.updateConfig(config);
    }
  }, [config]);

  // Update callbacks when they change
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateCallbacks({
        onNodeClick,
        onLinkClick,
        onNetworkUpdate
      });
    }
  }, [onNodeClick, onLinkClick, onNetworkUpdate]);

  // Update network when it changes
  useEffect(() => {
    if (engineRef.current && network) {
      engineRef.current.setNetwork(network);
    }
  }, [network]);

  return (
    <div 
      ref={containerRef} 
      className="w-full min-h-[400px] bg-white dark:bg-gray-800 rounded-lg shadow-sm"
    />
  );
}; 