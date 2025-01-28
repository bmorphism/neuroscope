'use client';

import { VisualizationNode, VisualizationLink } from '@/lib/visualization/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface NetworkStatsProps {
  nodes: VisualizationNode[];
  links: VisualizationLink[];
}

export function NetworkStats({ nodes, links }: NetworkStatsProps) {
  // Calculate network statistics
  const nodeCount = nodes.length;
  const linkCount = links.length;
  
  // Calculate node type distribution
  const nodeTypes = nodes.reduce((acc, node) => {
    acc[node.type] = (acc[node.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate average degree
  const degrees = nodes.map(node => {
    const outDegree = links.filter(l => 
      (typeof l.source === 'string' ? l.source : l.source.id) === node.id
    ).length;
    const inDegree = links.filter(l => 
      (typeof l.target === 'string' ? l.target : l.target.id) === node.id
    ).length;
    return { inDegree, outDegree, totalDegree: inDegree + outDegree };
  });

  const avgDegree = degrees.reduce((sum, d) => sum + d.totalDegree, 0) / nodeCount;
  const maxDegree = Math.max(...degrees.map(d => d.totalDegree));
  const minDegree = Math.min(...degrees.map(d => d.totalDegree));

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Network Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <span className="font-medium">Nodes:</span> {nodeCount}
          </div>
          <div>
            <span className="font-medium">Edges:</span> {linkCount}
          </div>
          <div>
            <span className="font-medium">Average Degree:</span> {avgDegree.toFixed(2)}
          </div>
          <div>
            <span className="font-medium">Max Degree:</span> {maxDegree}
          </div>
          <div>
            <span className="font-medium">Min Degree:</span> {minDegree}
          </div>
          <div>
            <span className="font-medium">Node Types:</span>
            <div className="pl-4">
              {Object.entries(nodeTypes).map(([type, count]) => (
                <div key={type}>
                  {type}: {count}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 