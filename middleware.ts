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
                // If user has no role, go to onboarding
                if (!token?.role) {
                    response = NextResponse.redirect(new URL("/onboarding", req.url))
                } else {
                    // Route based on role
                    let target = "/student"
                    if (token.role === "TEACHER") target = "/teacher"
                    else if (token.role === "SCHOOL_ADMIN") target = "/admin"
                    response = NextResponse.redirect(new URL(target, req.url))
                }
            } else {
                response = NextResponse.next()
            }
        } else if (!isAuth) {
            response = NextResponse.redirect(new URL("/login", req.url))
        } else {
            // Check if user needs onboarding (no role)
            if (!token?.role && !req.nextUrl.pathname.startsWith("/onboarding")) {
                response = NextResponse.redirect(new URL("/onboarding", req.url))
            }
            // If user has role but tries to access main onboarding page (not subpages), redirect to dashboard
            else if (token?.role && req.nextUrl.pathname === "/onboarding") {
                let target = "/student"
                if (token.role === "TEACHER") target = "/teacher"
                else if (token.role === "SCHOOL_ADMIN") target = "/admin"
                response = NextResponse.redirect(new URL(target, req.url))
            }
            // Role based protection
            else if (req.nextUrl.pathname.startsWith("/teacher") && token?.role !== "TEACHER") {
                response = NextResponse.redirect(new URL("/student", req.url))
            } else if (req.nextUrl.pathname.startsWith("/admin") && token?.role !== "SCHOOL_ADMIN") {
                // Only school admins can access admin routes
                const fallback = token?.role === "TEACHER" ? "/teacher" : "/student"
                response = NextResponse.redirect(new URL(fallback, req.url))
            } else if (req.nextUrl.pathname.startsWith("/student") && token?.role !== "STUDENT") {
                // Allow other roles to access student view for now
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
    matcher: ["/dashboard/:path*", "/teacher/:path*", "/student/:path*", "/admin/:path*", "/exam/:path*", "/login", "/register", "/onboarding"],
}
