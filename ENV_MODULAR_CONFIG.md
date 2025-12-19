# Configuration .env pour Architecture Modulaire

Ajoutez ces variables à votre fichier `.env` :

```env
# ========================================
# ARCHITECTURE MODULAIRE - QuizLock
# ========================================

# ========================================
# EventBus Configuration
# ========================================

# Activer le nouveau système EventBus
USE_NEW_EVENT_BUS="true"

# Activer l'architecture modulaire
USE_MODULAR_STRUCTURE="true"

# Mode de publication des événements pendant la migration
# - "dual": Publie dans ancien ET nouveau système (migration sécurisée)
# - "new-only": Publie uniquement dans nouveau système (production)
# - "legacy-only": Publie uniquement dans ancien système (rollback)
EVENT_PUBLISHING_MODE="new-only"

# ========================================
# Modules Activés
# ========================================

# Module Auth (utilisateurs, authentification)
MODULE_AUTH_ENABLED="true"

# Module Academic Structure (écoles, classes, syllabus)
MODULE_ACADEMIC_STRUCTURE_ENABLED="true"

# Module Invitations (enrollment étudiants)
MODULE_INVITATIONS_ENABLED="true"

# Module Assessments (examens, questions)
MODULE_ASSESSMENTS_ENABLED="true"

# Module Exam Execution (tentatives, notation)
MODULE_EXAM_EXECUTION_ENABLED="true"

# Module Gamification (XP, badges, niveaux)
MODULE_GAMIFICATION_ENABLED="true"

# Module Analytics (statistiques, prédictions)
MODULE_ANALYTICS_ENABLED="true"

# Module Messaging (notifications, forums)
MODULE_MESSAGING_ENABLED="true"

# ========================================
# Event Sourcing & Dead Letter Queue
# ========================================

# Activer Event Sourcing (stockage des événements)
ENABLE_EVENT_SOURCING="true"

# Activer Dead Letter Queue (retry automatique)
ENABLE_DEAD_LETTER_QUEUE="true"

# Nombre maximum de tentatives avant abandon (DLQ)
DLQ_MAX_RETRIES="3"

# Interval de retry automatique (en millisecondes)
# 300000 = 5 minutes
DLQ_RETRY_INTERVAL="300000"

# TTL des événements dans EventStore (en jours)
# Les événements seront supprimés automatiquement après ce délai
EVENT_STORE_TTL_DAYS="90"

# ========================================
# Performance Tuning
# ========================================

# Interval de traitement des queues (en millisecondes)
# Plus petit = plus réactif, mais plus de CPU
# Recommandé: 100ms pour production
EVENT_QUEUE_PROCESSING_INTERVAL="100"

# ========================================
# Debugging
# ========================================

# Activer les logs verbose pour debugging
# ATTENTION: Génère beaucoup de logs, uniquement pour dev
VERBOSE_EVENT_LOGGING="false"

# ========================================
# Notes de Migration
# ========================================

# Phase 1: Test en parallèle (DUAL MODE)
# USE_NEW_EVENT_BUS="true"
# EVENT_PUBLISHING_MODE="dual"
# MODULE_GAMIFICATION_ENABLED="true"

# Phase 2: Migration progressive
# USE_NEW_EVENT_BUS="true"
# EVENT_PUBLISHING_MODE="new-only"
# Activer modules un par un et surveiller les logs/métriques

# Phase 3: Architecture complète
# USE_MODULAR_STRUCTURE="true"
# Tous les modules activés
```

## Configuration Minimale pour Démarrer

```env
USE_NEW_EVENT_BUS="true"
USE_MODULAR_STRUCTURE="true"
EVENT_PUBLISHING_MODE="new-only"

MODULE_GAMIFICATION_ENABLED="true"
MODULE_INVITATIONS_ENABLED="true"
MODULE_MESSAGING_ENABLED="true"

ENABLE_EVENT_SOURCING="true"
ENABLE_DEAD_LETTER_QUEUE="true"
```

