"use client";

import { useEffect, useState } from 'react';
import { Gift, Calendar, UserRound, Briefcase, Table as TableIcon, Mail, Plus, Trash2 } from 'lucide-react';
import { Colaborador } from '@/lib/db';

interface Destinatario {
  id: number;
  email: string;
  criado_em: string;
}

export default function Home() {
  const [hoje, setHoje] = useState<Colaborador[]>([]);
  const [semana, setSemana] = useState<Colaborador[]>([]);
  const [todos, setTodos] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);

  // Estado da seção de destinatários
  const [destinatarios, setDestinatarios] = useState<Destinatario[]>([]);
  const [novoEmail, setNovoEmail] = useState('');
  const [emailFeedback, setEmailFeedback] = useState<{ type: 'ok' | 'erro'; msg: string } | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [resHoje, resSemana, resTodos, resDestinatarios] = await Promise.all([
          fetch('/api/aniversariantes/hoje'),
          fetch('/api/aniversariantes/semana'),
          fetch('/api/aniversariantes/todos'),
          fetch('/api/destinatarios')
        ]);
        
        if (resHoje.ok && resSemana.ok && resTodos.ok) {
          const dataHoje = await resHoje.json();
          const dataSemana = await resSemana.json();
          const dataTodos = await resTodos.json();
          setHoje(dataHoje);
          
          // Remove quem faz aniversário hoje da lista da semana, para não duplicar visualmente
          const hojeIds = new Set(dataHoje.map((c: Colaborador) => c.id));
          setSemana(dataSemana.filter((c: Colaborador) => !hojeIds.has(c.id)));
          setTodos(dataTodos);
        }
        if (resDestinatarios.ok) {
          const dataDestinatarios = await resDestinatarios.json();
          setDestinatarios(dataDestinatarios.destinatarios ?? []);
        }
      } catch (error) {
        console.error('Failed to fetch:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [, month, day] = dateString.split('-');
    return `${day}/${month}`;
  };

  const getMonthNumber = (dateString: string) => {
    if (!dateString) return -1;
    const [, month] = dateString.split('-');
    return parseInt(month, 10);
  };

  const getDayNumber = (dateString: string) => {
    if (!dateString) return -1;
    const [, , day] = dateString.split('-');
    return parseInt(day, 10);
  };

  const aniversariantesDoMes = todos
    .filter(c => getMonthNumber(c.data_nascimento) === selectedMonth)
    .sort((a, b) => getDayNumber(a.data_nascimento) - getDayNumber(b.data_nascimento));

  const meses = [
    { value: 1, label: 'Janeiro' }, { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' }, { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' }, { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' }, { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' }, { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' }, { value: 12, label: 'Dezembro' }
  ];

  async function adicionarEmail() {
    if (!novoEmail.trim()) return;
    setEmailLoading(true);
    setEmailFeedback(null);
    try {
      const res = await fetch('/api/destinatarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: novoEmail.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmailFeedback({ type: 'ok', msg: 'E-mail adicionado!' });
        setNovoEmail('');
        // Recarrega a lista
        const res2 = await fetch('/api/destinatarios');
        const data2 = await res2.json();
        setDestinatarios(data2.destinatarios ?? []);
      } else {
        setEmailFeedback({ type: 'erro', msg: data.error || 'Erro ao adicionar.' });
      }
    } catch {
      setEmailFeedback({ type: 'erro', msg: 'Falha na requisição.' });
    } finally {
      setEmailLoading(false);
    }
  }

  async function removerEmail(id: number) {
    try {
      const res = await fetch(`/api/destinatarios?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDestinatarios(prev => prev.filter(d => d.id !== id));
      }
    } catch {
      // silencia erro de UI
    }
  }

  return (
    <main className="container animate-fade-in pb-12">
      <header className="text-center mb-8 mt-8">
        <h1 className="text-4xl font-bold mb-2">
          Painel de <span className="text-gradient">Aniversariantes</span>
        </h1>
        <p className="text-muted">Celebre os momentos especiais da nossa equipe</p>
      </header>

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Coluna Hoje */}
            <section className="glass-panel p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-badge-success rounded-full flex items-center justify-center">
                  <Gift size={24} />
                </div>
                <h2 className="text-2xl">Aniversariantes de Hoje</h2>
              </div>

              {hoje.length === 0 ? (
                <div className="text-center text-muted p-6 border border-dashed rounded-xl" style={{ borderColor: 'var(--glass-border)' }}>
                  <Gift size={32} className="mx-auto mb-2 opacity-50" />
                  <p>Nenhum aniversariante hoje.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {hoje.map((person) => (
                    <div key={person.id} className="glass-panel p-4 flex justify-between items-center" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                      <div className="flex items-center gap-4">
                        <div className="bg-badge-success rounded-full p-2">
                          <UserRound size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{person.nome}</h3>
                          <p className="text-sm text-muted flex items-center gap-2">
                            <Briefcase size={14} /> {person.cargo_principal || 'Sem cargo definido'}
                          </p>
                        </div>
                      </div>
                      <div className="font-bold text-xl text-gradient">
                        {formatDate(person.data_nascimento)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Coluna Semana */}
            <section className="glass-panel p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-badge rounded-full flex items-center justify-center">
                  <Calendar size={24} />
                </div>
                <h2 className="text-2xl">Mais nesta semana</h2>
              </div>

              {semana.length === 0 ? (
                <div className="text-center text-muted p-6 border border-dashed rounded-xl" style={{ borderColor: 'var(--glass-border)' }}>
                  <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                  <p>Ninguém mais faz aniversário esta semana.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {semana.map((person) => (
                    <div key={person.id} className="flex justify-between items-center p-4 border-b border-dashed" style={{ borderColor: 'var(--glass-border)' }}>
                      <div>
                        <h3 className="font-semibold text-lg">{person.nome}</h3>
                        <p className="text-sm text-muted">{person.cargo_principal || 'Sem cargo'}</p>
                      </div>
                      <div className="font-bold">
                        {formatDate(person.data_nascimento)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Tabela de Todos por Mês */}
          <section className="glass-panel p-6 mt-8">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-badge rounded-full flex items-center justify-center">
                  <TableIcon size={24} />
                </div>
                <h2 className="text-2xl">Aniversariantes do Mês</h2>
              </div>
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="p-2 rounded bg-[#1e293b] border border-[#334155] text-white outline-none"
              >
                {meses.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            {aniversariantesDoMes.length === 0 ? (
              <div className="text-center text-muted p-6 border border-dashed rounded-xl" style={{ borderColor: 'var(--glass-border)' }}>
                <TableIcon size={32} className="mx-auto mb-2 opacity-50" />
                <p>Nenhum aniversariante neste mês.</p>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Nome</th>
                      <th>Cargo / Área</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aniversariantesDoMes.map(person => (
                      <tr key={person.id}>
                        <td className="font-bold text-gradient">{formatDate(person.data_nascimento)}</td>
                        <td className="font-semibold">{person.nome}</td>
                        <td className="text-muted text-sm">{person.cargo_principal || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Seção de Configurações — Destinatários de E-mail */}
          <section className="glass-panel p-6 mt-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-badge rounded-full flex items-center justify-center">
                <Mail size={24} />
              </div>
              <div>
                <h2 className="text-2xl">Configurações de E-mail</h2>
                <p className="text-muted text-sm">Gerencie quem recebe os e-mails automáticos de aniversariantes.</p>
              </div>
            </div>

            {/* Formulário de adição */}
            <div className="flex gap-3 mb-6">
              <input
                id="input-novo-email"
                type="email"
                placeholder="novo@email.com.br"
                value={novoEmail}
                onChange={e => setNovoEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && adicionarEmail()}
                className="flex-1 p-3 rounded-lg bg-[#1e293b] border border-[#334155] text-white outline-none focus:border-[#6366f1] transition-colors"
              />
              <button
                id="btn-adicionar-email"
                onClick={adicionarEmail}
                disabled={emailLoading}
                className="flex items-center gap-2 px-5 py-3 rounded-lg font-semibold transition-opacity disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                <Plus size={18} />
                {emailLoading ? 'Adicionando...' : 'Adicionar'}
              </button>
            </div>

            {/* Feedback */}
            {emailFeedback && (
              <p className={`text-sm mb-4 px-3 py-2 rounded-lg ${
                emailFeedback.type === 'ok'
                  ? 'bg-badge-success text-white'
                  : 'bg-red-500/20 text-red-300'
              }`}>
                {emailFeedback.msg}
              </p>
            )}

            {/* Lista de destinatários */}
            {destinatarios.length === 0 ? (
              <div className="text-center text-muted p-6 border border-dashed rounded-xl" style={{ borderColor: 'var(--glass-border)' }}>
                <Mail size={32} className="mx-auto mb-2 opacity-50" />
                <p>Nenhum destinatário cadastrado ainda.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {destinatarios.map(d => (
                  <div
                    key={d.id}
                    className="flex justify-between items-center p-4 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}
                  >
                    <div className="flex items-center gap-3">
                      <Mail size={16} className="text-muted" />
                      <span className="font-mono text-sm">{d.email}</span>
                    </div>
                    <button
                      id={`btn-remover-email-${d.id}`}
                      onClick={() => removerEmail(d.id)}
                      className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                      title="Remover destinatário"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
