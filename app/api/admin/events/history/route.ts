import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getEventHistory } from '@/lib/events';

/**
 * GET /api/admin/events/history
 * 
 * Récupère l'historique des événements avec filtres
 * 
 * Query params:
 * - type: string - Filtrer par type d'événement
 * - userId: string - Filtrer par utilisateur
 * - correlationId: string - Filtrer par correlation ID
 * - startDate: string (ISO) - Date de début
 * - endDate: string (ISO) - Date de fin
 * - limit: number - Nombre max de résultats (default: 50)
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
    const type = searchParams.get('type') || undefined;
    const userId = searchParams.get('userId') || undefined;
    const correlationId = searchParams.get('correlationId') || undefined;
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    const limitStr = searchParams.get('limit');

    const filters: any = {};

    if (type) filters.type = type;
    if (userId) filters.userId = userId;
    if (correlationId) filters.correlationId = correlationId;
    if (startDateStr) filters.startDate = new Date(startDateStr);
    if (endDateStr) filters.endDate = new Date(endDateStr);
    if (limitStr) filters.limit = parseInt(limitStr, 10);
    else filters.limit = 50; // Default

    // Récupérer l'historique
    const history = await getEventHistory(filters);

    return NextResponse.json({
      success: true,
      count: history.length,
      filters,
      events: history
    });

  } catch (error: any) {
    console.error('[API /admin/events/history] Error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
