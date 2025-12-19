import { NextRequest, NextResponse } from "next/server";
import { StatsService } from "@/modules/analytics";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";

/**
 * API Route: Statistiques d'un examen
 *
 * GET /api/analytics/exams/[examId]/stats
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
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

    const { examId } = await params;

    // Utiliser le service du module analytics
    const stats = await StatsService.getExamStats(examId);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error("[API] Erreur stats examen:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erreur serveur",
      },
      { status: 500 }
    );
  }
}

