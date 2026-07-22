import { NextRequest, NextResponse } from 'next/server';
import dbConfig, { EmailDestinatario } from '@/lib/db-config';

// GET /api/destinatarios — lista todos os destinatários
export async function GET() {
  try {
    const rows = dbConfig
      .prepare('SELECT * FROM email_destinatarios ORDER BY criado_em ASC')
      .all() as EmailDestinatario[];

    return NextResponse.json({ ok: true, destinatarios: rows });
  } catch (error) {
    console.error('Erro ao listar destinatários:', error);
    return NextResponse.json({ ok: false, error: 'Falha ao listar destinatários' }, { status: 500 });
  }
}

// POST /api/destinatarios — adiciona um e-mail
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = (body.email ?? '').trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: 'E-mail inválido.' }, { status: 400 });
    }

    dbConfig.prepare('INSERT INTO email_destinatarios (email) VALUES (?)').run(email);

    return NextResponse.json({ ok: true, message: 'E-mail adicionado com sucesso.' }, { status: 201 });
  } catch (error: unknown) {
    // SQLite UNIQUE constraint
    if (error instanceof Error && error.message.includes('UNIQUE')) {
      return NextResponse.json({ ok: false, error: 'Este e-mail já está na lista.' }, { status: 409 });
    }
    console.error('Erro ao adicionar destinatário:', error);
    return NextResponse.json({ ok: false, error: 'Falha ao adicionar destinatário.' }, { status: 500 });
  }
}

// DELETE /api/destinatarios?id=X — remove um e-mail pelo id
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ ok: false, error: 'ID inválido.' }, { status: 400 });
    }

    const result = dbConfig.prepare('DELETE FROM email_destinatarios WHERE id = ?').run(Number(id));

    if (result.changes === 0) {
      return NextResponse.json({ ok: false, error: 'Destinatário não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, message: 'E-mail removido com sucesso.' });
  } catch (error) {
    console.error('Erro ao remover destinatário:', error);
    return NextResponse.json({ ok: false, error: 'Falha ao remover destinatário.' }, { status: 500 });
  }
}
