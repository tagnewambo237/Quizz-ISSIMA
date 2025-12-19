import { NextRequest, NextResponse } from "next/server";
import { SchoolService } from "@/modules/academic-structure";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";

/**
 * API Route: Création d'école
 *
 * POST /api/academic/schools
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
    const { name, type, address, contactEmail } = body;

    if (!name || !type) {
      return NextResponse.json(
        { success: false, error: "Données manquantes" },
        { status: 400 }
      );
    }

    // Utiliser le service du module academic-structure
    const { schoolId } = await SchoolService.createSchool({
      name,
      type,
      address,
      contactEmail,
      createdBy: (session.user as any).id,
    });

    return NextResponse.json({
      success: true,
      data: {
        schoolId: schoolId.toString(),
        message: "École créée avec succès",
      },
    });
  } catch (error: any) {
    console.error("[API] Erreur création école:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erreur serveur",
      },
      { status: 500 }
    );
  }
}

