import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake can make it very hard to debug
    // issues with users being logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Protected routes
    const isProtectedRoute = request.nextUrl.pathname === '/' ||
        request.nextUrl.pathname.startsWith('/mypage') ||
        request.nextUrl.pathname.startsWith('/search');

    // Auth routes (where logged in users shouldn't go)
    const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/signup') ||
        request.nextUrl.pathname.startsWith('/welcome');

    if (!user && isProtectedRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/welcome'
        return NextResponse.redirect(url)
    }

    if (user && isAuthRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
