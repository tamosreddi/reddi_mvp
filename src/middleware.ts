import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next();

  // --- DEMO MODE REDIRECT ---
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    if (
      request.nextUrl.pathname === '/auth/login' ||
      request.nextUrl.pathname === '/auth/register'
    ) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // En demo, no bloqueamos el acceso a nada más
    return response;
  }
  // --- END DEMO MODE REDIRECT ---

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si NO hay usuario y NO está en /auth, redirige a login
  if (!user && !request.nextUrl.pathname.startsWith('/auth')) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/auth/login';
    redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Si HAY usuario y está en /auth/login o /auth/register, redirige a dashboard
  if (
    user &&
    (request.nextUrl.pathname === '/auth/login' ||
      request.nextUrl.pathname === '/auth/register')
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/|favicon.ico|api/)[^.]*)",
  ],
};