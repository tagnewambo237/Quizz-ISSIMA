import { NextRequest, NextResponse } from 'next/server';
import { GamificationService } from '@/modules/gamification';
import connectDB from '@/lib/mongodb';

/**
 * API Route: Profil Gamification d'un utilisateur
 * 
 * GET /api/gamification/profile/[userId]
 * 
 * Exemple d'utilisation du module gamification via API
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB();

    const { userId } = await params;

    // Utiliser le service du module gamification
    const profile = await GamificationService.getUserProfile(userId);
    const history = await GamificationService.getXPHistory(userId, 20);

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          userId: profile.userId,
          totalXP: profile.totalXP,
          level: profile.level,
          currentLevelXP: profile.currentLevelXP,
          nextLevelXP: profile.nextLevelXP,
          badges: profile.badges,
          streakDays: profile.streakDays,
          lastActivityDate: profile.lastActivityDate
        },
        recentTransactions: history
      }
    });
  } catch (error: any) {
    console.error('[API] Erreur gamification profile:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur serveur'
      },
      { status: 500 }
    );
  }
}

