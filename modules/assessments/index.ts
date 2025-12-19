/**
 * Module Assessments
 *
 * Gère les examens, questions et codes de retard
 *
 * @module assessments
 */

// Charger les event handlers
import "./events/handlers";

// Exporter l'API publique
export { ExamService } from "./services/ExamService";
export { QuestionService } from "./services/QuestionService";
export { LateCodeService } from "./services/LateCodeService";
export { AssessmentsEvents } from "./events/types";

console.log("[Module] Assessments chargé ✅");

