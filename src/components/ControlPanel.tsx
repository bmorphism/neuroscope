'use client';

import React from 'react';
import { VisualizationConfig, LayoutType, LayoutOptions } from '../lib/visualization/types';
import { Card, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface ControlPanelProps {
  config: VisualizationConfig;
  onConfigChange: (config: Partial<VisualizationConfig>) => void;
  onLayoutChange: (layout: LayoutOptions) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ config, onConfigChange, onLayoutChange }) => {
  const handleLayoutChange = (type: LayoutType) => {
    const layout: LayoutOptions = {
      type,
      options: {
        width: config.width,
        height: config.height,
        ...(type === 'hierarchical' ? {
          direction: 'horizontal',
          levelSpacing: 100,
          nodeSpacing: 50
        } : type === 'circular' ? {
          radius: Math.min(config.width, config.height) / 3
        } : type === 'grid' ? {
          padding: 50
        } : {
          chargeStrength: config.chargeStrength,
          linkDistance: config.linkDistance
        })
      }
    };
    onLayoutChange(layout);
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Layout Selection */}
        <div className="space-y-2">
          <Label>Layout</Label>
          <Select
            value={config.layout.type}
            onValueChange={value => handleLayoutChange(value as LayoutType)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select layout" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="force">Force</SelectItem>
              <SelectItem value="hierarchical">Hierarchical</SelectItem>
              <SelectItem value="circular">Circular</SelectItem>
              <SelectItem value="grid">Grid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Node Size */}
        <div className="space-y-2">
          <Label>Node Size</Label>
          <Slider
            value={[config.nodeRadius]}
            min={5}
            max={20}
            step={1}
            onValueChange={([value]) => onConfigChange({ nodeRadius: value })}
          />
        </div>

        {/* Link Width */}
        <div className="space-y-2">
          <Label>Link Width</Label>
          <Slider
            value={[config.linkWidth]}
            min={1}
            max={5}
            step={0.5}
            onValueChange={([value]) => onConfigChange({ linkWidth: value })}
          />
        </div>

        {/* Force Layout Controls */}
        {config.layout.type === 'force' && (
          <>
            <div className="space-y-2">
              <Label>Charge Strength</Label>
              <Slider
                value={[Math.abs(config.chargeStrength)]}
                min={10}
                max={100}
                step={5}
                onValueChange={([value]) => onConfigChange({ chargeStrength: -value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Link Distance</Label>
              <Slider
                value={[config.linkDistance]}
                min={50}
                max={200}
                step={10}
                onValueChange={([value]) => onConfigChange({ linkDistance: value })}
              />
            </div>
          </>
        )}

        {/* Display Options */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Show Labels</Label>
            <Switch
              checked={config.showLabels}
              onCheckedChange={checked => onConfigChange({ showLabels: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Show Weights</Label>
            <Switch
              checked={config.showWeights}
              onCheckedChange={checked => onConfigChange({ showWeights: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Show Tooltips</Label>
            <Switch
              checked={config.showTooltips}
              onCheckedChange={checked => onConfigChange({ showTooltips: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Directed</Label>
            <Switch
              checked={config.directed}
              onCheckedChange={checked => onConfigChange({ directed: checked })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 