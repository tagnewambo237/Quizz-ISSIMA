import { NextRequest, NextResponse } from "next/server";
import { ClassService } from "@/modules/academic-structure";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";

/**
 * API Route: Création de classe
 *
 * POST /api/academic/classes
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
    const { name, schoolId, syllabusId, maxStudents } = body;

    if (!name || !schoolId) {
      return NextResponse.json(
        { success: false, error: "Données manquantes" },
        { status: 400 }
      );
    }

    // Utiliser le service du module academic-structure
    const { classId } = await ClassService.createClass({
      name,
      schoolId,
      teacherId: (session.user as any).id,
      syllabusId,
      maxStudents,
    });

    return NextResponse.json({
      success: true,
      data: {
        classId: classId.toString(),
        message: "Classe créée avec succès",
      },
    });
  } catch (error: any) {
    console.error("[API] Erreur création classe:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erreur serveur",
      },
      { status: 500 }
    );
  }
}

