/**
 * Module Messaging
 *
 * Gère les notifications, forums et messages
 *
 * @module messaging
 */

// Charger les event handlers
import "./events/handlers";

// Exporter l'API publique
export { MessagingEvents } from "./events/types";
export { NotificationService } from "./services/NotificationService";

console.log("[Module] Messaging chargé ✅");
