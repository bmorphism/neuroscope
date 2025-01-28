import React from 'react';
import { VisualizationNode, VisualizationLink } from '@/lib/visualization/types';

interface PropertyInspectorProps {
  selectedNode?: VisualizationNode;
  selectedLink?: VisualizationLink;
  className?: string;
}

export const PropertyInspector: React.FC<PropertyInspectorProps> = ({
  selectedNode,
  selectedLink,
  className = ''
}) => {
  if (!selectedNode && !selectedLink) {
    return (
      <div className={`bg-gray-800 p-4 rounded-lg ${className}`}>
        <p className="text-gray-400 text-sm">Select a node or edge to inspect its properties</p>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 p-4 rounded-lg ${className}`}>
      {selectedNode && (
        <div>
          <h3 className="text-white font-semibold mb-3">Node Properties</h3>
          <div className="space-y-2">
            <div>
              <span className="text-gray-400 text-sm">ID:</span>
              <span className="text-white ml-2">{selectedNode.id}</span>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Type:</span>
              <span className="text-white ml-2">{selectedNode.type}</span>
            </div>
            {Object.entries(selectedNode.originalNode.properties).map(([key, value]) => (
              <div key={key}>
                <span className="text-gray-400 text-sm">{key}:</span>
                <span className="text-white ml-2">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedLink && (
        <div className={selectedNode ? 'mt-6' : ''}>
          <h3 className="text-white font-semibold mb-3">Edge Properties</h3>
          <div className="space-y-2">
            <div>
              <span className="text-gray-400 text-sm">Source:</span>
              <span className="text-white ml-2">
                {typeof selectedLink.source === 'string'
                  ? selectedLink.source
                  : selectedLink.source.id}
              </span>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Target:</span>
              <span className="text-white ml-2">
                {typeof selectedLink.target === 'string'
                  ? selectedLink.target
                  : selectedLink.target.id}
              </span>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Weight:</span>
              <span className="text-white ml-2">{selectedLink.weight.toFixed(4)}</span>
            </div>
            {Object.entries(selectedLink.originalConnection.properties).map(([key, value]) => (
              <div key={key}>
                <span className="text-gray-400 text-sm">{key}:</span>
                <span className="text-white ml-2">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 