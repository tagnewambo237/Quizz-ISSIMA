import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/modules/auth";
import connectDB from "@/lib/mongodb";

/**
 * API Route: Inscription utilisateur
 *
 * POST /api/auth/register
 *
 * Exemple d'utilisation du module auth
 */

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, email, password, role } = body;

    // Validation basique
    if (!name || !email || !role) {
      return NextResponse.json(
        {
          success: false,
          error: "Données manquantes",
        },
        { status: 400 }
      );
    }

    // Utiliser le service du module auth
    const result = await AuthService.registerUser({
      name,
      email,
      password,
      role,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Erreur lors de l'inscription",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        userId: result.userId,
        message: "Utilisateur inscrit avec succès",
        redirectTo: result.redirectTo,
      },
    });
  } catch (error: any) {
    console.error("[API] Erreur inscription:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erreur serveur",
      },
      { status: 500 }
    );
  }
}

