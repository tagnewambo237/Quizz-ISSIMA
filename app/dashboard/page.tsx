import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect("/login")
    }

    // Redirect based on user role
    if (!session.user.role) {
        redirect("/onboarding")
    } else if (session.user.role === "TEACHER") {
        redirect("/teacher")
    } else {
        redirect("/student")
    }
}
