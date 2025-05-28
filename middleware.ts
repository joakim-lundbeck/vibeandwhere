import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  
  if (isAdminRoute) {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return new NextResponse(null, {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Access"',
        },
      })
    }

    const authValue = authHeader.split(' ')[1]
    const [user, pwd] = atob(authValue).split(':')

    // Check credentials against environment variables
    if (
      user !== process.env.ADMIN_USERNAME ||
      pwd !== process.env.ADMIN_PASSWORD
    ) {
      return new NextResponse(null, {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Access"',
        },
      })
    }
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/admin/:path*',
} 