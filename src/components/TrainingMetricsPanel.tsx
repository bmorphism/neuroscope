'use client';

import React from 'react';
import { TrainingMetrics } from '@/lib/visualization/training';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface TrainingMetricsPanelProps {
  metrics: TrainingMetrics[];
  smoothedMetrics: Map<string, number>;
  className?: string;
}

export const TrainingMetricsPanel: React.FC<TrainingMetricsPanelProps> = ({
  metrics,
  smoothedMetrics,
  className = ''
}) => {
  // Transform metrics for chart display
  const chartData = metrics.map(m => ({
    epoch: m.epoch,
    loss: m.loss,
    accuracy: m.accuracy,
    ...m.customMetrics
  }));

  // Get current metrics
  const currentMetrics = metrics[metrics.length - 1];
  const currentSmoothed = Object.fromEntries(smoothedMetrics.entries());

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Current Metrics</h3>
            <div className="space-y-1">
              <p className="text-sm">
                Epoch: <span className="font-medium">{currentMetrics?.epoch}</span>
              </p>
              <p className="text-sm">
                Loss: <span className="font-medium">{currentMetrics?.loss.toFixed(4)}</span>
                {' '}
                <span className="text-gray-500">
                  (smoothed: {currentSmoothed.loss?.toFixed(4)})
                </span>
              </p>
              {currentMetrics?.accuracy !== undefined && (
                <p className="text-sm">
                  Accuracy: <span className="font-medium">{(currentMetrics.accuracy * 100).toFixed(2)}%</span>
                  {' '}
                  <span className="text-gray-500">
                    (smoothed: {(currentSmoothed.accuracy * 100)?.toFixed(2)}%)
                  </span>
                </p>
              )}
            </div>
          </div>

          {currentMetrics?.customMetrics && Object.keys(currentMetrics.customMetrics).length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Custom Metrics</h3>
              <div className="space-y-1">
                {Object.entries(currentMetrics.customMetrics).map(([key, value]) => (
                  <p key={key} className="text-sm">
                    {key}: <span className="font-medium">{value.toFixed(4)}</span>
                    {' '}
                    <span className="text-gray-500">
                      (smoothed: {currentSmoothed[key]?.toFixed(4)})
                    </span>
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Training Progress</h3>
          <div className="w-full h-64">
            <LineChart
              width={600}
              height={240}
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="epoch" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="loss"
                stroke="#ef4444"
                name="Loss"
              />
              {currentMetrics?.accuracy !== undefined && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#22c55e"
                  name="Accuracy"
                />
              )}
              {currentMetrics?.customMetrics && 
                Object.keys(currentMetrics.customMetrics).map((key, index) => (
                  <Line
                    key={key}
                    yAxisId="left"
                    type="monotone"
                    dataKey={key}
                    stroke={`hsl(${(index * 60 + 180) % 360}, 70%, 50%)`}
                    name={key}
                  />
                ))
              }
            </LineChart>
          </div>
        </div>
      </div>
    </Card>
  );
}; 