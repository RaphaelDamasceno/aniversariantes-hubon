"use client";

import { useEffect, useState } from 'react';
import { Gift, Calendar, UserRound, Briefcase, Award, Table as TableIcon } from 'lucide-react';
import { Colaborador } from '@/lib/db';

export default function Home() {
  const [hoje, setHoje] = useState<Colaborador[]>([]);
  const [semana, setSemana] = useState<Colaborador[]>([]);
  const [todos, setTodos] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);

  useEffect(() => {
    async function fetchData() {
      try {
        const [resHoje, resSemana, resTodos] = await Promise.all([
          fetch('/api/aniversariantes/hoje'),
          fetch('/api/aniversariantes/semana'),
          fetch('/api/aniversariantes/todos')
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
                          {person.is_clevel === 1 && (
                            <span className="text-xs bg-badge mt-2 inline-flex items-center gap-1"><Award size={12}/> C-Level</span>
                          )}
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
                      <th>Perfil</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aniversariantesDoMes.map(person => (
                      <tr key={person.id}>
                        <td className="font-bold text-gradient">{formatDate(person.data_nascimento)}</td>
                        <td className="font-semibold">{person.nome}</td>
                        <td className="text-muted text-sm">{person.cargo_principal || '-'}</td>
                        <td>
                          {person.is_clevel === 1 ? (
                            <span className="text-xs bg-badge inline-flex items-center gap-1"><Award size={12}/> C-Level</span>
                          ) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
