'use client';

import React from 'react';
import { Card, CardContent } from './ui/card';
import { VisualizationNode, VisualizationLink } from '@/lib/visualization/types';

interface PropertyInspectorProps {
  node: VisualizationNode | null;
  link: VisualizationLink | null;
}

export const PropertyInspector: React.FC<PropertyInspectorProps> = ({ node, link }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-4">Properties</h3>
        {!node && !link ? (
          <p className="text-gray-500 dark:text-gray-400">
            Select a node or edge to view its properties
          </p>
        ) : node ? (
          <div className="space-y-2">
            <div>
              <span className="font-medium">ID:</span> {node.id}
            </div>
            <div>
              <span className="font-medium">Type:</span> {node.type}
            </div>
            {node.properties && Object.entries(node.properties).map(([key, value]) => (
              <div key={key}>
                <span className="font-medium">{key}:</span>{' '}
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </div>
            ))}
          </div>
        ) : link ? (
          <div className="space-y-2">
            <div>
              <span className="font-medium">Source:</span>{' '}
              {typeof link.source === 'string' ? link.source : link.source.id}
            </div>
            <div>
              <span className="font-medium">Target:</span>{' '}
              {typeof link.target === 'string' ? link.target : link.target.id}
            </div>
            <div>
              <span className="font-medium">Weight:</span>{' '}
              {link.weight?.toFixed(4) || 'N/A'}
            </div>
            {link.properties && Object.entries(link.properties).map(([key, value]) => (
              <div key={key}>
                <span className="font-medium">{key}:</span>{' '}
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}; 