import React, { useMemo } from 'react';
import { VisualizationNode, VisualizationLink } from '@/lib/visualization/types';

interface NetworkStatsProps {
  nodes: VisualizationNode[];
  links: VisualizationLink[];
  className?: string;
}

export const NetworkStats: React.FC<NetworkStatsProps> = ({
  nodes,
  links,
  className = ''
}) => {
  const stats = useMemo(() => {
    // Basic stats
    const nodeCount = nodes.length;
    const edgeCount = links.length;
    const density = (2 * edgeCount) / (nodeCount * (nodeCount - 1));

    // Degree statistics
    const inDegrees = new Map<string, number>();
    const outDegrees = new Map<string, number>();
    
    nodes.forEach(node => {
      inDegrees.set(node.id, 0);
      outDegrees.set(node.id, 0);
    });

    links.forEach(link => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;
      
      outDegrees.set(sourceId, (outDegrees.get(sourceId) || 0) + 1);
      inDegrees.set(targetId, (inDegrees.get(targetId) || 0) + 1);
    });

    const avgInDegree = Array.from(inDegrees.values()).reduce((a, b) => a + b, 0) / nodeCount;
    const avgOutDegree = Array.from(outDegrees.values()).reduce((a, b) => a + b, 0) / nodeCount;

    // Node type distribution
    const typeDistribution = nodes.reduce((acc, node) => {
      acc[node.type] = (acc[node.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      nodeCount,
      edgeCount,
      density: density.toFixed(3),
      avgInDegree: avgInDegree.toFixed(2),
      avgOutDegree: avgOutDegree.toFixed(2),
      typeDistribution
    };
  }, [nodes, links]);

  return (
    <div className={`bg-gray-800 p-4 rounded-lg ${className}`}>
      <h3 className="text-white font-semibold mb-3">Network Statistics</h3>
      
      <div className="space-y-4">
        {/* Basic Stats */}
        <div>
          <h4 className="text-gray-300 text-sm font-medium mb-2">Basic Statistics</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-400">Nodes:</span>
              <span className="text-white ml-2">{stats.nodeCount}</span>
            </div>
            <div>
              <span className="text-gray-400">Edges:</span>
              <span className="text-white ml-2">{stats.edgeCount}</span>
            </div>
            <div>
              <span className="text-gray-400">Density:</span>
              <span className="text-white ml-2">{stats.density}</span>
            </div>
          </div>
        </div>

        {/* Degree Stats */}
        <div>
          <h4 className="text-gray-300 text-sm font-medium mb-2">Degree Statistics</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-400">Avg In-Degree:</span>
              <span className="text-white ml-2">{stats.avgInDegree}</span>
            </div>
            <div>
              <span className="text-gray-400">Avg Out-Degree:</span>
              <span className="text-white ml-2">{stats.avgOutDegree}</span>
            </div>
          </div>
        </div>

        {/* Type Distribution */}
        <div>
          <h4 className="text-gray-300 text-sm font-medium mb-2">Node Types</h4>
          <div className="space-y-1 text-sm">
            {Object.entries(stats.typeDistribution).map(([type, count]) => (
              <div key={type}>
                <span className="text-gray-400">{type}:</span>
                <span className="text-white ml-2">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 