import { NextRequest, NextResponse } from "next/server";
import { ExamService } from "@/modules/assessments";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";

/**
 * API Route: Création d'examen
 *
 * POST /api/assessments/exams
 */

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { title, description, classId, duration, syllabusId } = body;

    if (!title || !classId || !duration) {
      return NextResponse.json(
        { success: false, error: "Données manquantes" },
        { status: 400 }
      );
    }

    // Utiliser le service du module assessments
    const { examId } = await ExamService.createExam({
      title,
      description,
      classId,
      duration,
      syllabusId,
      createdBy: (session.user as any).id,
    });

    return NextResponse.json({
      success: true,
      data: {
        examId: examId.toString(),
        message: "Examen créé avec succès",
      },
    });
  } catch (error: any) {
    console.error("[API] Erreur création examen:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erreur serveur",
      },
      { status: 500 }
    );
  }
}

