import { NextResponse } from 'next/server';
import db, { Colaborador } from '@/lib/db';
import { isBirthdayThisWeek } from '@/lib/date-rules';

export async function GET() {
  try {
    const todosColaboradores = db.prepare('SELECT * FROM colaboradores').all() as Colaborador[];
    
    // Filtra em memória para aplicar as regras de negócio complexas de data (ex: 29 de fev, virada de ano)
    const aniversariantesSemana = todosColaboradores.filter(c => 
      c.data_nascimento && isBirthdayThisWeek(c.data_nascimento)
    );

    return NextResponse.json(aniversariantesSemana);
  } catch (error) {
    console.error('Erro ao buscar aniversariantes da semana:', error);
    return NextResponse.json({ error: 'Falha ao buscar aniversariantes da semana' }, { status: 500 });
  }
}
