import { EventPriority, EventType, publishEvent } from "@/lib/events";
import mongoose from "mongoose";

/**
 * Service de notifications
 *
 * Envoie des notifications aux utilisateurs
 */
export class NotificationService {
  /**
   * Envoie une notification à un utilisateur
   */
  static async send(
    userId: mongoose.Types.ObjectId | string,
    notification: {
      title: string;
      message: string;
      type: "info" | "success" | "warning" | "error" | "badge" | "level_up";
      priority?: "low" | "normal" | "high";
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    const userIdObj =
      typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

    // TODO: Logique métier pour créer la notification dans la DB

    // Publier événement
    await publishEvent(
      EventType.NOTIFICATION_CREATED,
      {
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: notification.priority || "normal",
        metadata: notification.metadata,
        createdAt: new Date(),
        read: false,
      },
      {
        userId: userIdObj,
        priority:
          notification.priority === "high"
            ? EventPriority.HIGH
            : EventPriority.NORMAL,
      }
    );

    console.log(
      `[Messaging] Notification envoyée à l'utilisateur ${userIdObj}`
    );
  }

  /**
   * Envoie une notification push via Pusher (temps réel)
   */
  static async sendPush(
    userId: mongoose.Types.ObjectId | string,
    notification: {
      title: string;
      message: string;
      type: string;
    }
  ): Promise<void> {
    // TODO: Intégration avec Pusher
    console.log(`[Messaging] Push notification: ${notification.title}`);
  }
}
