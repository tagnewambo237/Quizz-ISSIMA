import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import ConceptEvaluation from "@/models/ConceptEvaluation";
import { GamificationService } from "@/modules/gamification";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

/**
 * POST /api/self-assessment
 * Save a student's self-assessment for a concept
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { conceptId, level, reflection, syllabusId } = await req.json();

    if (!conceptId || !level) {
      return NextResponse.json(
        { success: false, message: "conceptId and level are required" },
        { status: 400 }
      );
    }

    const studentId = session.user.id;

    // Check if evaluation already exists
    const existingEval = await ConceptEvaluation.findOne({
      student: new mongoose.Types.ObjectId(studentId),
      concept: new mongoose.Types.ObjectId(conceptId),
    });

    let evaluation;

    if (existingEval) {
      // Update existing
      existingEval.level = level;
      existingEval.reflection = reflection;
      existingEval.evaluatedAt = new Date();
      evaluation = await existingEval.save();
    } else {
      // Create new
      evaluation = await ConceptEvaluation.create({
        student: new mongoose.Types.ObjectId(studentId),
        concept: new mongoose.Types.ObjectId(conceptId),
        syllabus: syllabusId
          ? new mongoose.Types.ObjectId(syllabusId)
          : undefined,
        level,
        reflection,
        evaluatedAt: new Date(),
      });

      // Award XP for first self-evaluation of this concept
      await GamificationService.addXP(
        studentId,
        5, // 5 XP pour une auto-évaluation
        "self-eval",
        conceptId
      );
    }

    return NextResponse.json({
      success: true,
      evaluation: {
        id: evaluation._id,
        level: evaluation.level,
        evaluatedAt: evaluation.evaluatedAt,
      },
    });
  } catch (error) {
    console.error("[Self-Assessment API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/self-assessment
 * Get all self-assessments for the current student
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const syllabusId = searchParams.get("syllabusId");

    const query: {
      student: mongoose.Types.ObjectId;
      syllabus?: mongoose.Types.ObjectId;
    } = {
      student: new mongoose.Types.ObjectId(session.user.id),
    };

    if (syllabusId) {
      query.syllabus = new mongoose.Types.ObjectId(syllabusId);
    }

    const evaluations = await ConceptEvaluation.find(query)
      .populate("concept", "title name description")
      .sort({ evaluatedAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      evaluations: evaluations.map((e) => ({
        id: e._id,
        concept: e.concept,
        level: e.level,
        reflection: e.reflection,
        evaluatedAt: e.evaluatedAt,
      })),
    });
  } catch (error) {
    console.error("[Self-Assessment API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
