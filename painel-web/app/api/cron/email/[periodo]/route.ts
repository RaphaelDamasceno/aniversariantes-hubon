import { NextRequest, NextResponse } from 'next/server';
import db, { Colaborador } from '@/lib/db';
import { isBirthdayToday, isBirthdayThisWeek, isBirthdayThisMonth } from '@/lib/date-rules';
import { sendEmail } from '@/lib/mailer';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ periodo: string }> }
) {
  const { periodo } = await params;

  if (!['dia', 'semana', 'mes'].includes(periodo)) {
    return NextResponse.json({ error: 'Período inválido. Use dia, semana ou mes.' }, { status: 400 });
  }

  try {
    const todosColaboradores = db.prepare('SELECT * FROM colaboradores').all() as Colaborador[];
    
    let aniversariantes: Colaborador[] = [];
    let titulo = '';
    let descricao = '';

    if (periodo === 'dia') {
      aniversariantes = todosColaboradores.filter(c => c.data_nascimento && isBirthdayToday(c.data_nascimento));
      titulo = 'Aniversariantes do Dia 🎂';
      descricao = 'Confira os aniversariantes de hoje!';
    } else if (periodo === 'semana') {
      aniversariantes = todosColaboradores.filter(c => c.data_nascimento && isBirthdayThisWeek(c.data_nascimento));
      titulo = 'Aniversariantes da Semana 🎉';
      descricao = 'Confira os aniversariantes desta semana!';
    } else if (periodo === 'mes') {
      aniversariantes = todosColaboradores.filter(c => c.data_nascimento && isBirthdayThisMonth(c.data_nascimento));
      titulo = 'Aniversariantes do Mês 🎈';
      descricao = 'Confira os aniversariantes deste mês!';
    }

    const to = process.env.EMAIL_TO;
    
    if (!to) {
      return NextResponse.json({ error: 'Variável EMAIL_TO não configurada no .env' }, { status: 500 });
    }

    // Montar o HTML
    let html = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
        <h2 style="color: #2563eb; text-align: center;">${titulo}</h2>
        <p style="text-align: center; font-size: 16px;">${descricao}</p>
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
    `;

    if (aniversariantes.length === 0) {
      html += `<p style="text-align: center; color: #666;">Não temos aniversariantes neste período.</p>`;
    } else {
      html += `<ul style="list-style: none; padding: 0;">`;
      aniversariantes.forEach(c => {
        // Extrai dia e mês para exibição amigável
        const data = c.data_nascimento ? new Date(c.data_nascimento).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '';
        html += `
          <li style="padding: 10px; background-color: #f9fafb; margin-bottom: 8px; border-radius: 4px; display: flex; justify-content: space-between;">
            <strong>${c.nome}</strong>
            <span style="color: #666;">${data} ${c.cargo_principal ? `- ${c.cargo_principal}` : ''}</span>
          </li>
        `;
      });
      html += `</ul>`;
    }

    html += `
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
        <p style="text-align: center; font-size: 12px; color: #999;">Enviado automaticamente pelo Painel de Aniversariantes.</p>
      </div>
    `;

    const sucesso = await sendEmail({
      to,
      subject: titulo,
      html,
    });

    if (sucesso) {
      return NextResponse.json({ ok: true, message: 'E-mail enviado com sucesso!', count: aniversariantes.length });
    } else {
      return NextResponse.json({ error: 'Falha ao enviar e-mail. Verifique o console.' }, { status: 500 });
    }

  } catch (error) {
    console.error('Erro na rota de cron:', error);
    return NextResponse.json({ error: 'Falha interna' }, { status: 500 });
  }
}
