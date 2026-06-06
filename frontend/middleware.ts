import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard', '/interviews', '/challenges', '/admin'];
const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value || 
    request.headers.get('authorization')?.replace('Bearer ', '');
  
  const path = request.nextUrl.pathname;

  const isProtected = protectedRoutes.some(route => path.startsWith(route));
  const isAuth = authRoutes.some(route => path.startsWith(route));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (isAuth && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
