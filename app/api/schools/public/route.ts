import { NextRequest, NextResponse } from "next/server";
import { SchoolService } from "@/lib/services/SchoolService";

export async function GET(req: NextRequest) {
    try {
        const schools = await SchoolService.getPublicSchools();
        return NextResponse.json(schools);
    } catch (error) {
        console.error("Error fetching public schools:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
