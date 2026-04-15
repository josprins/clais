import logger from './logger';

export interface MessageMetrics {
  messageId: string;
  userId: number;
  messageType: 'text' | 'command' | 'other';
  tier: 1 | 2 | 3; // Tier 1 = simple messages (echo, basic commands)
  responseTimeMs: number;
  success: boolean;
  timestamp: Date;
  error?: string;
}

export class PerformanceMonitor {
  private metrics: MessageMetrics[] = [];
  private readonly maxMetrics = 1000; // Keep last 1000 messages for stats
  private readonly alertThresholdMs = 2000; // 2 seconds

  constructor() {
    logger.info('Performance monitor initialized');
  }

  /**
   * Record a message response time
   */
  recordMetric(metric: Omit<MessageMetrics, 'timestamp'>): void {
    const fullMetric: MessageMetrics = {
      ...metric,
      timestamp: new Date()
    };

    this.metrics.push(fullMetric);
    
    // Keep only last maxMetrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log if response time exceeds threshold
    if (metric.responseTimeMs > this.alertThresholdMs) {
      logger.warn({
        msg: 'Slow response detected',
        responseTimeMs: metric.responseTimeMs,
        thresholdMs: this.alertThresholdMs,
        userId: metric.userId,
        messageType: metric.messageType
      }, `Response time ${metric.responseTimeMs}ms exceeds 2s threshold`);
    }

    // Log periodic summary every 20 messages
    if (this.metrics.length % 20 === 0) {
      this.logSummary();
    }
  }

  /**
   * Calculate statistics for Tier 1 messages
   */
  getTier1Stats(): {
    averageResponseTime: number;
    percentile95: number;
    percentile99: number;
    totalMessages: number;
    successRate: number;
    maxResponseTime: number;
    minResponseTime: number;
  } {
    const tier1Metrics = this.metrics.filter(m => m.tier === 1);
    
    if (tier1Metrics.length === 0) {
      return {
        averageResponseTime: 0,
        percentile95: 0,
        percentile99: 0,
        totalMessages: 0,
        successRate: 0,
        maxResponseTime: 0,
        minResponseTime: 0
      };
    }

    const responseTimes = tier1Metrics.map(m => m.responseTimeMs).sort((a, b) => a - b);
    const total = responseTimes.reduce((sum, time) => sum + time, 0);
    const average = total / responseTimes.length;
    
    const percentile95 = this.calculatePercentile(responseTimes, 95);
    const percentile99 = this.calculatePercentile(responseTimes, 99);
    
    const successful = tier1Metrics.filter(m => m.success).length;
    const successRate = (successful / tier1Metrics.length) * 100;

    return {
      averageResponseTime: Math.round(average),
      percentile95: Math.round(percentile95),
      percentile99: Math.round(percentile99),
      totalMessages: tier1Metrics.length,
      successRate: Math.round(successRate * 100) / 100,
      maxResponseTime: Math.max(...responseTimes),
      minResponseTime: Math.min(...responseTimes)
    };
  }

  /**
   * Get all metrics for the last N messages
   */
  getRecentMetrics(limit: number = 100): MessageMetrics[] {
    return this.metrics.slice(-limit);
  }

  /**
   * Reset metrics (useful for testing)
   */
  reset(): void {
    this.metrics = [];
    logger.info('Performance metrics reset');
  }

  /**
   * Log a performance summary
   */
  private logSummary(): void {
    const stats = this.getTier1Stats();
    
    if (stats.totalMessages === 0) {
      return;
    }

    const meetsRequirement = stats.averageResponseTime < this.alertThresholdMs;
    
    logger.info({
      msg: 'Performance summary',
      tier1Messages: stats.totalMessages,
      averageResponseTimeMs: stats.averageResponseTime,
      percentile95Ms: stats.percentile95,
      percentile99Ms: stats.percentile99,
      successRate: `${stats.successRate}%`,
      maxResponseTimeMs: stats.maxResponseTime,
      minResponseTimeMs: stats.minResponseTime,
      meetsRequirement: meetsRequirement,
      requirementMs: this.alertThresholdMs
    }, `Tier 1 Performance: ${stats.averageResponseTime}ms avg (req: <${this.alertThresholdMs}ms)`);
  }

  /**
   * Calculate percentile from sorted array
   */
  private calculatePercentile(sortedArray: number[], percentile: number): number {
    if (sortedArray.length === 0) return 0;
    
    const index = (percentile / 100) * (sortedArray.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    
    if (lower === upper) {
      return sortedArray[lower];
    }
    
    // Linear interpolation
    const weight = index - lower;
    return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
  }

  /**
   * Check if current performance meets S-003 requirements
   */
  meetsS003Requirements(): boolean {
    const stats = this.getTier1Stats();
    
    // Need at least 100 messages to evaluate
    if (stats.totalMessages < 100) {
      return false;
    }
    
    return stats.averageResponseTime < this.alertThresholdMs;
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();