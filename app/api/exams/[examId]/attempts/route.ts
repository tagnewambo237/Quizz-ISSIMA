import { NextRequest, NextResponse } from "next/server";
import { AttemptService } from "@/modules/exam-execution";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";

/**
 * API Route: Démarrer une tentative d'examen
 *
 * POST /api/exams/[examId]/attempts
 */

export async function POST(
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
    const body = await request.json();
    const { examTitle, duration } = body;

    if (!examTitle || !duration) {
      return NextResponse.json(
        { success: false, error: "Données manquantes" },
        { status: 400 }
      );
    }

    // Utiliser le service du module exam-execution
    const { attemptId, expiresAt } = await AttemptService.startAttempt({
      examId,
      examTitle,
      userId: (session.user as any).id,
      duration,
    });

    return NextResponse.json({
      success: true,
      data: {
        attemptId: attemptId.toString(),
        expiresAt: expiresAt,
        message: "Tentative démarrée avec succès",
      },
    });
  } catch (error: any) {
    console.error("[API] Erreur démarrage tentative:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erreur serveur",
      },
      { status: 500 }
    );
  }
}

