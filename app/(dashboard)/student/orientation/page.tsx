import connectDB from "@/lib/mongodb"
import School from "@/models/School"
import { SchoolStatus } from "@/models/enums"
import { OrientationSchoolsClient } from "./OrientationSchoolsClient"
import { ORIENTATION_SCHOOLS_MOCK, type OrientationSchoolDTO } from "@/lib/mocks/orientationSchools"
import { Compass } from "lucide-react"

async function getOrientationSchools(): Promise<{ schools: OrientationSchoolDTO[]; source: "db" | "mock" }> {
  try {
    await connectDB()

    const schools = await School.find({
      status: SchoolStatus.VALIDATED,
      isActive: true,
    })
      .select("name type address logoUrl status contactInfo")
      .sort({ name: 1 })
      .limit(50)
      .lean()

    // Si la DB est vide, utiliser les mocks
    if (schools.length === 0) {
      return { source: "mock", schools: ORIENTATION_SCHOOLS_MOCK }
    }

    return {
      source: "db",
      schools: schools.map((s) => {
        const school = s as {
          _id: { toString: () => string }
          name: string
          type: string
          address?: string
          logoUrl?: string
          status: string
          contactInfo?: { email?: string; phone?: string; website?: string }
        }
        return {
          _id: school._id.toString(),
          name: school.name,
          type: school.type,
          address: school.address,
          logoUrl: school.logoUrl,
          status: school.status,
          contactInfo: school.contactInfo,
        }
      }),
    }
  } catch {
    // En cas d'erreur, utiliser les mocks
    return { source: "mock", schools: ORIENTATION_SCHOOLS_MOCK }
  }
}

export default async function StudentOrientationPage() {
  const { schools, source } = await getOrientationSchools()

  return (
    <div className="space-y-8 pb-10 max-w-6xl mx-auto">
      <div className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Compass className="h-5 w-5 text-white/90" />
            <span className="text-white/80 font-medium tracking-wide uppercase text-sm">Orientation</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Choisissez votre établissement</h1>
          <p className="text-white/80 text-lg max-w-3xl">
            Découvrez les établissements partenaires disponibles et démarrez votre parcours.
          </p>

          {source === "mock" && (
            <div className="mt-6 inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-sm">
              <span className="font-semibold">Mode démo :</span>
              <span className="text-white/80">données mock (MongoDB indisponible)</span>
            </div>
          )}
        </div>
      </div>

      <OrientationSchoolsClient schools={schools} />
    </div>
  )
}

