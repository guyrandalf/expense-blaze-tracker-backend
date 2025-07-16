import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
 
export function middleware(request: NextRequest) {
  // Check if we're handling an API request
    if (request.nextUrl.pathname.startsWith('/api/')) {
      
    const response = NextResponse.next()
    
    // Get the origin of the request
    const origin = request.headers.get('origin') || ''
    
    // Allow CORS from React Native app
    response.headers.set('Access-Control-Allow-Origin', origin || '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.set('Access-Control-Allow-Credentials', 'true')

    return response
  }
  return NextResponse.next()
}

export const config = {
    matcher: '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
}
