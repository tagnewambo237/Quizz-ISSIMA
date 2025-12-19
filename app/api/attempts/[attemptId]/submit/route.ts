import { NextRequest, NextResponse } from "next/server";
import { AttemptService, GradingService } from "@/modules/exam-execution";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";

/**
 * API Route: Soumettre une tentative
 *
 * POST /api/attempts/[attemptId]/submit
 */

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
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

    const { attemptId } = await params;
    const body = await request.json();
    const { examId } = body;

    if (!examId) {
      return NextResponse.json(
        { success: false, error: "ExamId manquant" },
        { status: 400 }
      );
    }

    // 1. Soumettre la tentative
    await AttemptService.submitAttempt(
      attemptId,
      examId,
      (session.user as any).id
    );

    // 2. Noter automatiquement
    const result = await GradingService.gradeAttempt(
      attemptId,
      examId,
      (session.user as any).id
    );

    return NextResponse.json({
      success: true,
      data: {
        message: "Tentative soumise et notée avec succès",
        score: result.score,
        maxScore: result.maxScore,
        percentage: result.percentage,
        passed: result.passed,
      },
    });
  } catch (error: any) {
    console.error("[API] Erreur soumission tentative:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erreur serveur",
      },
      { status: 500 }
    );
  }
}

