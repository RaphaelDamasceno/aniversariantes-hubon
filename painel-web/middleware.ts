import { NextRequest, NextResponse } from 'next/server';

export const config = {
  // Aplica a todas as rotas (incluindo /api), exceto arquivos estáticos e internos do Next
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)', '/'],
};

export function middleware(req: NextRequest) {
  // 1. Exceção para rotas automatizadas (CRON)
  if (req.nextUrl.pathname.startsWith('/api/cron/')) {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
      return NextResponse.next();
    }
    
    // Se não informou o secret correto (ou se ele não está configurado), nega o acesso
    return new NextResponse('Unauthorized CRON Request', { status: 401 });
  }

  // 2. Proteção Basic Auth para o restante do painel e API normal
  const basicAuth = req.headers.get('authorization');

  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASS;

  if (!user || !pass) {
    return new NextResponse('Authentication not configured on server', { status: 500 });
  }

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    try {
      const [providedUser, providedPass] = atob(authValue).split(':');

      if (providedUser === user && providedPass === pass) {
        return NextResponse.next();
      }
    } catch {
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
