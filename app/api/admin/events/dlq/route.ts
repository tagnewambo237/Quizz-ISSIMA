import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { EventBus } from '@/lib/events/core/EventBus';
import { DeadLetterQueue } from '@/lib/events/core/DeadLetterQueue';

/**
 * GET /api/admin/events/dlq
 * 
 * Récupère les événements en échec dans la Dead Letter Queue
 * 
 * Query params:
 * - eventType: string - Filtrer par type d'événement
 * - limit: number - Nombre max de résultats (default: 100)
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

    // Extraire query params
    const searchParams = request.nextUrl.searchParams;
    const eventType = searchParams.get('eventType') || undefined;
    const limitStr = searchParams.get('limit');
    const limit = limitStr ? parseInt(limitStr, 10) : 100;

    // Récupérer DLQ
    const dlq = new DeadLetterQueue();

    const [unresolved, stats] = await Promise.all([
      dlq.getUnresolved({ eventType, limit }),
      dlq.getStats()
    ]);

    return NextResponse.json({
      success: true,
      stats,
      unresolved: unresolved.map(item => ({
        id: item._id,
        eventId: item.eventId,
        eventType: item.eventType,
        error: item.error,
        attemptCount: item.attemptCount,
        lastAttempt: item.lastAttempt,
        resolved: item.resolved,
        resolvedAt: item.resolvedAt,
        createdAt: item.createdAt
      }))
    });

  } catch (error: any) {
    console.error('[API /admin/events/dlq] Error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/events/dlq
 * 
 * Actions sur la Dead Letter Queue
 * 
 * Body:
 * - action: "retry" | "resolve" | "cleanup"
 * - eventId?: string - Pour action "resolve"
 * - olderThanDays?: number - Pour action "cleanup"
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { action, eventId, olderThanDays } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Missing required field: action' },
        { status: 400 }
      );
    }

    const dlq = new DeadLetterQueue();
    let result: any;

    switch (action) {
      case 'retry':
        // Retry tous les événements éligibles
        const retried = await dlq.retryFailed();
        result = { retried };
        break;

      case 'resolve':
        // Résoudre manuellement un événement spécifique
        if (!eventId) {
          return NextResponse.json(
            { error: 'Missing required field: eventId for resolve action' },
            { status: 400 }
          );
        }
        const resolved = await dlq.resolve(eventId);
        result = { resolved };
        break;

      case 'cleanup':
        // Nettoyer les événements résolus anciens
        const days = olderThanDays || 30;
        const deleted = await dlq.cleanup(days);
        result = { deleted, olderThanDays: days };
        break;

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      action,
      result
    });

  } catch (error: any) {
    console.error('[API /admin/events/dlq] Error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
