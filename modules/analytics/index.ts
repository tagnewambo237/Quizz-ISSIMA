/**
 * Module Analytics
 *
 * Gère les statistiques, prédictions et insights IA
 *
 * @module analytics
 */

// Charger les event handlers
import "./events/handlers";

// Exporter l'API publique
export { StatsService } from "./services/StatsService";
export { ReportService } from "./services/ReportService";
export { AnalyticsEvents, PerformanceAlertTypes } from "./events/types";

console.log("[Module] Analytics chargé ✅");

