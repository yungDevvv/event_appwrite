import { NextResponse } from 'next/server';
import { getLoggedInUser } from './lib/appwrite/server/appwrite';

export async function middleware(request) {
  // Публичные пути, которые не требуют авторизации
  const publicPaths = [
    '/api',
    '/verify',
    '/login',
    '/register',
    '/register-for-event',
    '/reset-password',
    '/update-password',
    '/unathorized'
  ];

  // Если путь публичный, пропускаем
  if (publicPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Пытаемся получить пользователя, но перехватываем все ошибки
  let user = null;
  try {
    user = await getLoggedInUser();
  } catch (error) {
    // Если произошла ошибка, перенаправляем на unauthorized
    const url = request.nextUrl.clone();
    url.pathname = '/unathorized';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
  // try {
  //   // Проверяем роль пользователя
  //   if (user.role === "client" || user.role === "admin") {
  //     const url = request.nextUrl.clone();
  //     url.pathname = '/dashboard/events';
  //     return NextResponse.redirect(url);
  //   }

  //   // Проверяем активное событие
  //   if (user.active_event) {
  //     const url = request.nextUrl.clone();
  //     url.pathname = `/event/${user.active_event}`;
  //     return NextResponse.redirect(url);
  //   }
  // } catch (error) {
  //   // Если что-то пошло не так при проверке ролей,
  //   // просто пропускаем запрос дальше
  //   // return NextResponse.next();
  // }

  // // По умолчанию пропускаем запрос
  // return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}