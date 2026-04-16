import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 公开路由白名单
const publicPaths = [
  '/',
  '/(public)',
  '/login',
  '/admin/login',
];

function isPublicPath(pathname: string): boolean {
  return publicPaths.some(p => pathname === p || pathname.startsWith(p + '/'));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 公开路由直接放行
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // A 端路由保护
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = request.cookies.get('admin_token')?.value || request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // C 端路由保护（/person/* 和 /company/*）
  if (pathname.startsWith('/person') || pathname.startsWith('/company')) {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/person/:path*', '/company/:path*', '/admin/:path*', '/((?!api|_next/static|_next/image|favicon.ico).)*'],
};
