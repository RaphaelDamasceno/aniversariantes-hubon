import { NextResponse } from 'next/server';
import db, { Colaborador } from '@/lib/db';

export async function GET() {
  try {
    const todosColaboradores = db.prepare('SELECT * FROM colaboradores').all() as Colaborador[];
    // Retorna todos os colaboradores para que o frontend possa agrupar por mês
    return NextResponse.json(todosColaboradores);
  } catch (error) {
    console.error('Erro ao buscar todos os aniversariantes:', error);
    return NextResponse.json({ error: 'Falha ao buscar todos os aniversariantes' }, { status: 500 });
  }
}
