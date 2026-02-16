import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(request.nextUrl.pathname);
    const isLandingPage = request.nextUrl.pathname === '/';
    const isKioskPage = request.nextUrl.pathname.startsWith('/kiosk');
    const isPublicLegalPage = ['/privacy', '/terms', '/contact', '/payment-success', '/payment-cancelled'].includes(request.nextUrl.pathname);

    // If trying to access admin pages without token, redirect to login
    // Allow root (landing), auth pages, kiosk and legal pages
    if (!token && !isAuthPage && !isKioskPage && !isLandingPage && !isPublicLegalPage) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If logged in and trying to access auth pages, redirect to dashboard
    if (token && isAuthPage) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - static files (images, fonts, etc.)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|eot|mp4|webm|ogg)).*)',
    ],
};