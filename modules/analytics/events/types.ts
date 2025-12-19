/**
 * Types d'événements spécifiques au module Analytics
 */

export const AnalyticsEvents = {
  ANALYTICS_REPORT_GENERATED: "ANALYTICS_REPORT_GENERATED",
  PERFORMANCE_ALERT: "PERFORMANCE_ALERT",
  STATS_UPDATED: "STATS_UPDATED",
} as const;

/**
 * Types d'alertes de performance
 */
export const PerformanceAlertTypes = {
  HIGH_FAILURE_RATE: "high_failure_rate",
  LOW_PARTICIPATION: "low_participation",
  DECLINING_PERFORMANCE: "declining_performance",
  SUSPICIOUS_PATTERN: "suspicious_pattern",
} as const;

