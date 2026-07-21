import { NextRequest, NextResponse } from 'next/server';

export const config = {
  // Aplica a todas as rotas (incluindo /api), exceto arquivos estáticos e internos do Next
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)', '/'],
};

export function middleware(req: NextRequest) {
  const basicAuth = req.headers.get('authorization');

  const user = process.env.ADMIN_USER || 'admin';
  const pass = process.env.ADMIN_PASS || 'secret123';

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    try {
      const [providedUser, providedPass] = atob(authValue).split(':');

      if (providedUser === user && providedPass === pass) {
        return NextResponse.next();
      }
    } catch (e) {
      // Falha silenciosa no decode do base64, vai pro 401 abaixo
    }
  }

  return new NextResponse('Auth required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Painel de Aniversariantes"',
    },
  });
}
