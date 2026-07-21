import { NextResponse } from 'next/server';
import db, { Colaborador } from '@/lib/db';
import { isBirthdayToday } from '@/lib/date-rules';

export async function GET() {
  try {
    const todosColaboradores = db.prepare('SELECT * FROM colaboradores').all() as Colaborador[];
    
    // Filtra em memória para aplicar as regras de negócio complexas de data (ex: 29 de fev)
    const aniversariantesHoje = todosColaboradores.filter(c => 
      c.data_nascimento && isBirthdayToday(c.data_nascimento)
    );

    return NextResponse.json(aniversariantesHoje);
  } catch (error) {
    console.error('Erro ao buscar aniversariantes de hoje:', error);
    return NextResponse.json({ error: 'Falha ao buscar aniversariantes do dia' }, { status: 500 });
  }
}
