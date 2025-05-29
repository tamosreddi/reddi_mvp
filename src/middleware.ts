import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log('MIDDLEWARE SESSION:', session);

  // Si NO hay sesión y NO está en /auth, redirige a login
  if (!session && !req.nextUrl.pathname.startsWith('/auth')) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/auth/login';
    redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Si HAY sesión y está en /auth/login o /auth/register, redirige a dashboard
  if (
    session &&
    (req.nextUrl.pathname === '/auth/login' ||
      req.nextUrl.pathname === '/auth/register')
  ) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/|favicon.ico|api/)[^.]*)",
  ],
};