import { NextRequest, NextResponse } from "next/server";
import { ExamService } from "@/modules/assessments";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";

/**
 * API Route: Publication d'examen
 *
 * POST /api/assessments/exams/[examId]/publish
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
    const { examTitle, classId, className, dueDate } = body;

    if (!examTitle || !classId || !className) {
      return NextResponse.json(
        { success: false, error: "Données manquantes" },
        { status: 400 }
      );
    }

    // Utiliser le service du module assessments
    await ExamService.publishExam(
      examId,
      examTitle,
      classId,
      className,
      dueDate ? new Date(dueDate) : undefined,
      (session.user as any).id
    );

    return NextResponse.json({
      success: true,
      data: {
        message: "Examen publié avec succès",
      },
    });
  } catch (error: any) {
    console.error("[API] Erreur publication examen:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erreur serveur",
      },
      { status: 500 }
    );
  }
}

