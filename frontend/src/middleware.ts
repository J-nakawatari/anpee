import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { setup } from './lib/csrf'

const csrfProtection = setup

export async function middleware(request: NextRequest) {
  // CSRFトークンのチェックをスキップするパス
  const skipPaths = [
    '/_next',
    '/api/health',
    '/favicon.ico',
    '/login',
    '/register',
    '/forgot-password',
    '/',
    '/terms',
    '/privacy',
    '/commercial-law',
  ]

  const pathname = request.nextUrl.pathname
  
  // 静的ファイルやスキップパスはCSRFチェックをスキップ
  if (skipPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // APIルートのみCSRF保護を適用
  if (pathname.startsWith('/api/')) {
    // @ts-ignore - next-csrfの型定義の問題を回避
    return csrfProtection(request)
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
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}