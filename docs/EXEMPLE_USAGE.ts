/**
 * EXEMPLE D'UTILISATION - Architecture Modulaire
 *
 * Ce fichier démontre comment utiliser le système modulaire avec le bus d'événements
 *
 * ⚠️  Ceci est un exemple de démonstration, pas du code de production
 */

import {
  EventPriority,
  EventType,
  getEventHistory,
  publishEvent,
} from "@/lib/events";
import mongoose from "mongoose";
import { GamificationService } from "./gamification";
import { InvitationService } from "./invitations";

// ========================================
// EXEMPLE 1: Publication Simple d'Événement
// ========================================

export async function exemple1_PublicationSimple() {
  console.log("\n=== EXEMPLE 1: Publication Simple ===\n");

  const userId = new mongoose.Types.ObjectId();
  const examId = new mongoose.Types.ObjectId();

  // Publier un événement ATTEMPT_GRADED
  await publishEvent(
    EventType.ATTEMPT_GRADED,
    {
      attemptId: new mongoose.Types.ObjectId(),
      examId: examId,
      score: 90,
      maxScore: 100,
      percentage: 90,
      passed: true,
    },
    {
      userId: userId,
      priority: EventPriority.HIGH,
    }
  );

  console.log("✅ Événement ATTEMPT_GRADED publié");
  console.log("📢 Automatiquement:");
  console.log("   - Module Gamification attribue XP");
  console.log("   - Module Gamification vérifie badges");
  console.log("   - Module Messaging envoie notifications");
}

// ========================================
// EXEMPLE 2: Workflow Complet (Enrollment)
// ========================================

export async function exemple2_WorkflowEnrollment() {
  console.log("\n=== EXEMPLE 2: Workflow Enrollment ===\n");

  const userId = new mongoose.Types.ObjectId();
  const classId = new mongoose.Types.ObjectId();

  // Accepter une invitation
  await InvitationService.acceptInvitation(
    "invitation-123",
    userId,
    classId,
    "Math 101",
    "John Doe",
    "john@example.com"
  );

  console.log("✅ Invitation acceptée");
  console.log("📢 Cascade d'événements:");
  console.log("   1. INVITATION_ACCEPTED publié");
  console.log("   2. STUDENT_ENROLLED publié");
  console.log("   3. Gamification écoute → +10 XP → XP_GAINED publié");
  console.log("   4. Messaging écoute → Notification bienvenue");
  console.log("   5. Messaging écoute XP_GAINED → Notification XP");
}

// ========================================
// EXEMPLE 3: Utilisation Directe des Services
// ========================================

export async function exemple3_ServicesDirects() {
  console.log("\n=== EXEMPLE 3: Services Directs ===\n");

  const userId = new mongoose.Types.ObjectId();

  // Consulter le profil gamification
  const profile = await GamificationService.getUserProfile(userId);
  console.log(`📊 Profil: Level ${profile.level} - ${profile.totalXP} XP`);

  // Consulter l'historique XP
  const history = await GamificationService.getXPHistory(userId, 10);
  console.log(`📜 Historique: ${history.length} transactions`);

  // Consulter le leaderboard
  const leaderboard = await GamificationService.getLeaderboard(5);
  console.log(`🏆 Top 5 joueurs:`);
  leaderboard.forEach((entry: any, i: number) => {
    console.log(`   ${i + 1}. Level ${entry.level} - ${entry.totalXP} XP`);
  });
}

// ========================================
// EXEMPLE 4: Event Sourcing - Historique
// ========================================

export async function exemple4_EventSourcing() {
  console.log("\n=== EXEMPLE 4: Event Sourcing ===\n");

  const userId = new mongoose.Types.ObjectId();

  // Récupérer tous les événements d'un utilisateur
  const events = await getEventHistory({
    userId: userId.toString(),
    limit: 50,
  });

  console.log(`📚 ${events.length} événements trouvés pour l'utilisateur`);

  // Récupérer événements par type
  const attemptEvents = await getEventHistory({
    type: EventType.ATTEMPT_GRADED,
    startDate: new Date("2024-01-01"),
    limit: 20,
  });

  console.log(`📝 ${attemptEvents.length} examens notés depuis janvier 2024`);

  // Suivre un workflow complet via correlationId
  const correlationId = "workflow-123";
  const workflowEvents = await getEventHistory({
    correlationId: correlationId,
  });

  console.log(`🔗 ${workflowEvents.length} événements dans le workflow`);
}

// ========================================
// EXEMPLE 5: Gestion d'Erreurs et DLQ
// ========================================

export async function exemple5_GestionErreurs() {
  console.log("\n=== EXEMPLE 5: Gestion d'Erreurs ===\n");

  // Si un handler throw une erreur
  // 1. L'événement est capturé par l'EventBus
  // 2. Ajouté à la Dead Letter Queue
  // 3. Retry automatique après 5 minutes
  // 4. Maximum 3 tentatives

  console.log("🛡️  Sécurité automatique:");
  console.log("   - Erreurs catchées par EventBus");
  console.log("   - Dead Letter Queue avec retry");
  console.log("   - Event Sourcing = aucune perte de données");
  console.log("   - Dashboard admin pour monitoring");
}

// ========================================
// EXEMPLE 6: Communication Inter-Modules
// ========================================

export async function exemple6_CommunicationInterModules() {
  console.log("\n=== EXEMPLE 6: Communication Inter-Modules ===\n");

  // Module Gamification publie BADGE_EARNED
  // Module Messaging l'écoute et envoie notification

  const userId = new mongoose.Types.ObjectId();

  await publishEvent(
    EventType.BADGE_EARNED,
    {
      badgeId: "perfect-score",
      badgeName: "Score Parfait",
      badgeIcon: "🏆",
      badgeRarity: "rare",
      pointsAwarded: 50,
    },
    {
      userId: userId,
      priority: EventPriority.HIGH,
    }
  );

  console.log("✅ Badge attribué");
  console.log("📢 Module Messaging réagit automatiquement:");
  console.log("   - Notification envoyée");
  console.log("   - Push notification (si configuré)");
  console.log("   - Email (optionnel)");
}

// ========================================
// EXEMPLE 7: Corrélation d'Événements
// ========================================

export async function exemple7_CorrelationEvenements() {
  console.log("\n=== EXEMPLE 7: Corrélation d'Événements ===\n");

  const userId = new mongoose.Types.ObjectId();
  const correlationId = "exam-session-" + Date.now();

  // 1. Début d'examen
  await publishEvent(
    EventType.ATTEMPT_STARTED,
    { examId: new mongoose.Types.ObjectId() },
    { userId, correlationId }
  );

  // 2. Réponses
  const previousEventId = "";
  for (let i = 0; i < 3; i++) {
    await publishEvent(
      EventType.QUESTION_ANSWERED,
      { questionId: new mongoose.Types.ObjectId(), answer: "A" },
      {
        userId,
        correlationId,
        causationId: previousEventId || undefined,
      }
    );
  }

  // 3. Soumission
  await publishEvent(
    EventType.ATTEMPT_SUBMITTED,
    { attemptId: new mongoose.Types.ObjectId() },
    { userId, correlationId }
  );

  console.log(`✅ Session d'examen complète (correlationId: ${correlationId})`);
  console.log("📊 Possibilité de tracer tout le workflow via Event Sourcing");
}

// ========================================
// FONCTION DEMO COMPLÈTE
// ========================================

export async function executerTousLesExemples() {
  try {
    console.log("\n╔════════════════════════════════════════╗");
    console.log("║  DÉMONSTRATION - Architecture Modulaire ║");
    console.log("╚════════════════════════════════════════╝");

    await exemple1_PublicationSimple();
    await exemple2_WorkflowEnrollment();
    await exemple3_ServicesDirects();
    await exemple4_EventSourcing();
    await exemple5_GestionErreurs();
    await exemple6_CommunicationInterModules();
    await exemple7_CorrelationEvenements();

    console.log("\n✅ Tous les exemples exécutés avec succès!\n");
  } catch (error) {
    console.error("\n❌ Erreur:", error);
  }
}

// ========================================
// NOTES IMPORTANTES
// ========================================

/*

📚 AVANTAGES DE CETTE ARCHITECTURE:

1. ✅ Découplage Total
   - Les modules ne se connaissent pas
   - Communication via événements uniquement
   - Facilite tests et maintenance

2. ✅ Scalabilité
   - Ajout de modules sans toucher l'existant
   - Désactivation de modules via feature flags
   - Priority queues pour performance

3. ✅ Traçabilité Complète
   - Event Sourcing = historique complet
   - Corrélation d'événements pour workflows
   - Debugging facilité

4. ✅ Robustesse
   - Dead Letter Queue avec retry
   - Aucune perte de données
   - Gestion d'erreurs centralisée

5. ✅ Évolutivité
   - Nouvelle feature = nouveau module
   - Migration progressive possible
   - Rollback facile via feature flags

🎯 QUAND UTILISER CETTE ARCHITECTURE:

✅ OUI:
- Application avec plusieurs domaines métier
- Besoin de découplage fort
- Équipe multiple travaillant en parallèle
- Audit et compliance importants
- Système évolutif et scalable

❌ NON:
- Application très simple (CRUD basique)
- Prototype rapide
- Équipe très petite (1-2 devs)
- Pas besoin d'historique

*/
