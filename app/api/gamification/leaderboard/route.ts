import { NextRequest, NextResponse } from 'next/server';
import { GamificationService } from '@/modules/gamification';
import connectDB from '@/lib/mongodb';

/**
 * API Route: Leaderboard global
 * 
 * GET /api/gamification/leaderboard?limit=10
 * 
 * Retourne le classement des joueurs par XP
 */

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Utiliser le service du module gamification
    const leaderboard = await GamificationService.getLeaderboard(limit);

    return NextResponse.json({
      success: true,
      data: {
        leaderboard: leaderboard.map((entry: any, index: number) => ({
          rank: index + 1,
          userId: entry.userId._id,
          userName: entry.userId.name,
          userEmail: entry.userId.email,
          totalXP: entry.totalXP,
          level: entry.level,
          badges: entry.badges.length
        }))
      }
    });
  } catch (error: any) {
    console.error('[API] Erreur leaderboard:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur serveur'
      },
      { status: 500 }
    );
  }
}

