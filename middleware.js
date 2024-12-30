import { NextResponse } from 'next/server';
import { getLoggedInUser } from './lib/appwrite/server/appwrite';

export async function middleware(request) {
 

  const publicPaths = [
    '/api',
    '/verify',
    '/login',
    '/register',
    '/register-for-event',
    '/reset-password',
    '/update-password',
  ];

  if (publicPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
    try {
      const user = await getLoggedInUser();

      if (user) {
        const url = request.nextUrl.clone();

        if (user.role === "client" || user.role === "admin") {
          url.pathname = '/dashboard/events';
          return NextResponse.redirect(url);
        } else {
          if (user.active_event) {
            url.pathname = `/event/${user.active_event}`;
            return NextResponse.redirect(url);
          } else {
            return NextResponse.next();
          }
        }
      }
      return NextResponse.next();
    } catch (error) {
      console.log('Error in middleware:', error);
      
      const user = await getLoggedInUser();

      if (user.role === "client" || user.role === "admin") {
        url.pathname = '/login';
        return NextResponse.redirect(url);
      } else {
        if (user.active_event) {
          url.pathname = `/register-for-event/${user.active_event}`;
          return NextResponse.redirect(url);
        } else {
          url.pathname = '/login';
          return NextResponse.redirect(url);
        }
      }
    }
  }

  try {
    const user = await getLoggedInUser();

    if (user) {
      return NextResponse.next();
    }
  } catch (error) {
    console.log('Error fetching user:', error);
  }

  const url = request.nextUrl.clone();
  url.pathname = '/login';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
  