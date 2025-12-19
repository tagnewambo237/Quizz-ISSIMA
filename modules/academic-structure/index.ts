/**
 * Module Academic Structure
 *
 * Gère les écoles, classes, niveaux, filières, matières et syllabus
 *
 * @module academic-structure
 */

// Charger les event handlers
import "./events/handlers";

// Exporter l'API publique
export { AcademicStructureEvents } from "./events/types";
export { ClassService } from "./services/ClassService";
export { SchoolService } from "./services/SchoolService";
export { SyllabusService } from "./services/SyllabusService";

console.log("[Module] Academic Structure chargé ✅");
