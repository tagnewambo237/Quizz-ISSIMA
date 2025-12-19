/**
 * Module Exam Execution
 *
 * Gère les tentatives, réponses, notation et anti-triche
 *
 * @module exam-execution
 */

// Charger les event handlers
import "./events/handlers";

// Exporter l'API publique
export { AttemptService } from "./services/AttemptService";
export { GradingService } from "./services/GradingService";
export { AntiCheatService } from "./services/AntiCheatService";
export { ExamExecutionEvents } from "./events/types";

console.log("[Module] Exam Execution chargé ✅");

