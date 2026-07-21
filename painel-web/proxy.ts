import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)', '/'],
};

export function proxy(req: NextRequest) {
  const basicAuth = req.headers.get('authorization');

  const user = process.env.ADMIN_USER || 'admin';
  const pass = process.env.ADMIN_PASS || 'secret123';

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [providedUser, providedPass] = atob(authValue).split(':');

    if (providedUser === user && providedPass === pass) {
      return NextResponse.next();
    }
  }

  const url = req.nextUrl;
  url.pathname = '/api/auth'; // Usado para disparar o prompt 401

  return new NextResponse('Auth required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Painel de Aniversariantes"',
    },
  });
}
