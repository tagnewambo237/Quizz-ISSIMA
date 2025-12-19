import { NextRequest, NextResponse } from "next/server";
import { StatsService } from "@/modules/analytics";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";

/**
 * API Route: Statistiques d'une classe
 *
 * GET /api/analytics/classes/[classId]/stats
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }

    await connectDB();

    const { classId } = await params;

    // Utiliser le service du module analytics
    const stats = await StatsService.getClassStats(classId);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error("[API] Erreur stats classe:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erreur serveur",
      },
      { status: 500 }
    );
  }
}

