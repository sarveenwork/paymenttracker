import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Get the session from cookies
  const sessionCookie = request.cookies.get('admin-session')
  const isAuthenticated = !!sessionCookie?.value

  // Protect admin routes (except login page)
  if (request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/admin/login') {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Redirect authenticated users away from login page
  if (request.nextUrl.pathname === '/admin/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
