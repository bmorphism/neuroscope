import React from 'react';
import { VisualizationConfig } from '@/lib/visualization/types';
import { LayoutOptions } from '@/lib/visualization/layouts/types';

interface ControlPanelProps {
  config: VisualizationConfig;
  onConfigChange: (config: Partial<VisualizationConfig>) => void;
  onLayoutChange: (layout: LayoutOptions) => void;
  className?: string;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  config,
  onConfigChange,
  onLayoutChange,
  className = ''
}) => {
  const handleLayoutChange = (type: LayoutOptions['type']) => {
    const baseOptions = {
      width: config.width,
      height: config.height
    };

    const layoutOptions: LayoutOptions = {
      type,
      options: type === 'hierarchical' ? {
        ...baseOptions,
        direction: 'LR',
        levelSpacing: 100,
        nodeSpacing: 50
      } : type === 'circular' ? {
        ...baseOptions,
        sortBy: 'type'
      } : type === 'grid' ? {
        ...baseOptions,
        sortBy: 'none'
      } : {
        ...baseOptions,
        chargeStrength: config.chargeStrength,
        linkDistance: config.linkDistance
      }
    };

    onLayoutChange(layoutOptions);
  };

  return (
    <div className={`bg-gray-800 p-4 rounded-lg ${className}`}>
      <div className="space-y-6">
        {/* Layout Section */}
        <section>
          <h3 className="text-white font-semibold mb-2">Layout</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              className={`px-3 py-2 rounded ${
                config.layout?.type === 'hierarchical'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              }`}
              onClick={() => handleLayoutChange('hierarchical')}
            >
              Hierarchical
            </button>
            <button
              className={`px-3 py-2 rounded ${
                config.layout?.type === 'circular'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              }`}
              onClick={() => handleLayoutChange('circular')}
            >
              Circular
            </button>
            <button
              className={`px-3 py-2 rounded ${
                config.layout?.type === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              }`}
              onClick={() => handleLayoutChange('grid')}
            >
              Grid
            </button>
            <button
              className={`px-3 py-2 rounded ${
                config.layout?.type === 'force'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              }`}
              onClick={() => handleLayoutChange('force')}
            >
              Force
            </button>
          </div>
        </section>

        {/* Display Options */}
        <section>
          <h3 className="text-white font-semibold mb-2">Display Options</h3>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.showLabels}
                onChange={(e) => onConfigChange({ showLabels: e.target.checked })}
                className="form-checkbox text-blue-600 rounded"
              />
              <span className="text-gray-200">Show Labels</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.showWeights}
                onChange={(e) => onConfigChange({ showWeights: e.target.checked })}
                className="form-checkbox text-blue-600 rounded"
              />
              <span className="text-gray-200">Show Weights</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.directed}
                onChange={(e) => onConfigChange({ directed: e.target.checked })}
                className="form-checkbox text-blue-600 rounded"
              />
              <span className="text-gray-200">Directed Edges</span>
            </label>
          </div>
        </section>

        {/* Style Controls */}
        <section>
          <h3 className="text-white font-semibold mb-2">Style</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-gray-200 text-sm mb-1">Node Size</label>
              <input
                type="range"
                min="5"
                max="20"
                value={config.nodeRadius}
                onChange={(e) => onConfigChange({ nodeRadius: Number(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-gray-200 text-sm mb-1">Edge Width</label>
              <input
                type="range"
                min="1"
                max="5"
                value={config.linkWidth}
                onChange={(e) => onConfigChange({ linkWidth: Number(e.target.value) })}
                className="w-full"
              />
            </div>
            {config.layout?.type === 'force' && (
              <>
                <div>
                  <label className="block text-gray-200 text-sm mb-1">Force Strength</label>
                  <input
                    type="range"
                    min="-100"
                    max="-10"
                    value={config.chargeStrength}
                    onChange={(e) => onConfigChange({ chargeStrength: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-gray-200 text-sm mb-1">Link Distance</label>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    value={config.linkDistance}
                    onChange={(e) => onConfigChange({ linkDistance: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}; 