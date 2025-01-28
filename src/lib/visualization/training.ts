import { VisualizationEngine } from './engine';

export interface TrainingMetrics {
  epoch: number;
  loss: number;
  accuracy?: number;
  gradients: Record<string, number>;
  activations: Record<string, number>;
  customMetrics?: Record<string, number>;
}

export interface TrainingVisualizationConfig {
  updateInterval: number;  // milliseconds
  smoothingFactor: number;  // exponential moving average factor (0-1)
  highlightThreshold: number;  // threshold for gradient highlighting
  colorScale: 'viridis' | 'plasma' | 'inferno' | 'magma';
}

const DEFAULT_CONFIG: TrainingVisualizationConfig = {
  updateInterval: 100,
  smoothingFactor: 0.3,
  highlightThreshold: 0.5,
  colorScale: 'viridis'
};

export class TrainingVisualizer {
  private engine: VisualizationEngine;
  private config: TrainingVisualizationConfig;
  private metrics: TrainingMetrics[];
  private updateTimer: number | null;
  private smoothedMetrics: Map<string, number>;

  constructor(
    engine: VisualizationEngine,
    config: Partial<TrainingVisualizationConfig> = {}
  ) {
    this.engine = engine;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.metrics = [];
    this.smoothedMetrics = new Map();
    this.updateTimer = null;
  }

  public updateMetrics(metrics: TrainingMetrics): void {
    this.metrics.push(metrics);
    this.updateSmoothMetrics(metrics);
    
    // Update node colors based on activations
    Object.entries(metrics.activations).forEach(([nodeId, activation]) => {
      this.engine.setNodeActivation(nodeId, activation);
    });

    // Update node borders based on gradients
    Object.entries(metrics.gradients).forEach(([nodeId, gradient]) => {
      this.engine.setGradient(nodeId, gradient);
      
      // Highlight nodes with significant gradients
      if (Math.abs(gradient) > this.config.highlightThreshold) {
        const intensity = Math.min(Math.abs(gradient) / 2, 1);
        const color = gradient > 0 ? `rgba(0, 255, 0, ${intensity})` : `rgba(255, 0, 0, ${intensity})`;
        this.engine.highlightNode(nodeId, color, this.config.updateInterval * 2);
      }
    });
  }

  private updateSmoothMetrics(metrics: TrainingMetrics): void {
    // Update exponential moving averages
    Object.entries(metrics.customMetrics || {}).forEach(([key, value]) => {
      const current = this.smoothedMetrics.get(key) || value;
      const smoothed = current * (1 - this.config.smoothingFactor) + value * this.config.smoothingFactor;
      this.smoothedMetrics.set(key, smoothed);
    });

    // Always smooth loss
    const currentLoss = this.smoothedMetrics.get('loss') || metrics.loss;
    const smoothedLoss = currentLoss * (1 - this.config.smoothingFactor) + metrics.loss * this.config.smoothingFactor;
    this.smoothedMetrics.set('loss', smoothedLoss);

    if (metrics.accuracy !== undefined) {
      const currentAcc = this.smoothedMetrics.get('accuracy') || metrics.accuracy;
      const smoothedAcc = currentAcc * (1 - this.config.smoothingFactor) + metrics.accuracy * this.config.smoothingFactor;
      this.smoothedMetrics.set('accuracy', smoothedAcc);
    }
  }

  public getMetricHistory(): TrainingMetrics[] {
    return this.metrics;
  }

  public getSmoothedMetrics(): Map<string, number> {
    return new Map(this.smoothedMetrics);
  }

  public clearHistory(): void {
    this.metrics = [];
    this.smoothedMetrics.clear();
  }

  public destroy(): void {
    if (this.updateTimer !== null) {
      window.clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }
} 