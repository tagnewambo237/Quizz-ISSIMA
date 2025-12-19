import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getEventBusStats } from '@/lib/events';
import { getAppStats } from '@/lib/bootstrap';
import { FEATURE_FLAGS } from '@/lib/config/features';

/**
 * GET /api/admin/events/stats
 * 
 * Récupère les statistiques du système événementiel
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Vérifier role admin
    if (session.user.role !== 'SCHOOL_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Récupérer stats EventBus
    const queueStats = getEventBusStats();
    const appStats = getAppStats();

    // Calculer totaux
    const totalQueued = Object.values(queueStats).reduce((sum, count) => sum + count, 0);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      system: {
        initialized: appStats.initialized,
        eventBus: FEATURE_FLAGS.USE_NEW_EVENT_BUS,
        modularStructure: FEATURE_FLAGS.USE_MODULAR_STRUCTURE,
        eventSourcing: FEATURE_FLAGS.ENABLE_EVENT_SOURCING,
        deadLetterQueue: FEATURE_FLAGS.ENABLE_DEAD_LETTER_QUEUE,
        publishingMode: FEATURE_FLAGS.EVENT_PUBLISHING_MODE
      },
      queues: {
        critical: queueStats[0] || 0,
        high: queueStats[1] || 0,
        normal: queueStats[2] || 0,
        low: queueStats[3] || 0,
        total: totalQueued
      },
      config: {
        dlqMaxRetries: FEATURE_FLAGS.DLQ_MAX_RETRIES,
        dlqRetryInterval: FEATURE_FLAGS.DLQ_RETRY_INTERVAL,
        processingInterval: FEATURE_FLAGS.EVENT_QUEUE_PROCESSING_INTERVAL,
        eventStoreTTL: FEATURE_FLAGS.EVENT_STORE_TTL_DAYS
      }
    });

  } catch (error: any) {
    console.error('[API /admin/events/stats] Error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
