import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { SECURITY_HEADERS } from "./lib/security/headers"

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token
        const isAuth = !!token
        const isAuthPage = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register")

        let response: NextResponse

        if (isAuthPage) {
            if (isAuth) {
                response = NextResponse.redirect(new URL("/dashboard", req.url))
            } else {
                response = NextResponse.next()
            }
        } else if (!isAuth) {
            response = NextResponse.redirect(new URL("/login", req.url))
        } else {
            // Check if user needs onboarding (no role)
            // Note: We need to ensure the token has the role. 
            // If the role is missing in the token, it means the user hasn't selected one yet.
            if (!token?.role && !req.nextUrl.pathname.startsWith("/onboarding")) {
                response = NextResponse.redirect(new URL("/onboarding", req.url))
            }
            // If user has role but tries to access onboarding, redirect to dashboard
            else if (token?.role && req.nextUrl.pathname.startsWith("/onboarding")) {
                response = NextResponse.redirect(new URL("/dashboard", req.url))
            }
            // Role based protection
            else if (req.nextUrl.pathname.startsWith("/teacher") && token?.role !== "TEACHER") {
                response = NextResponse.redirect(new URL("/student", req.url))
            } else if (req.nextUrl.pathname.startsWith("/student") && token?.role !== "STUDENT") {
                // Teachers can access student view? Maybe not for now.
                response = NextResponse.next()
            } else {
                response = NextResponse.next()
            }
        }

        // Apply security headers to all responses
        Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
            response.headers.set(key, value)
        })

        return response
    },
    {
        callbacks: {
            authorized: ({ token }) => true, // Let middleware handle redirection logic
        },
    }
)

export const config = {
    matcher: ["/dashboard/:path*", "/teacher/:path*", "/student/:path*", "/exam/:path*", "/login", "/register", "/onboarding"],
}
