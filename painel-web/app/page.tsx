"use client";

import { useEffect, useState, useCallback } from 'react';
import { Colaborador } from '@/lib/db';
import styles from './dashboard.module.css';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Destinatario {
  id: number;
  email: string;
  criado_em: string;
}

interface WeekBucket {
  label: string;
  count: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(nome: string): string {
  const parts = nome.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDayMonth(dateString: string): string {
  if (!dateString) return '';
  const [, month, day] = dateString.split('-');
  return `${day}/${month}`;
}

function formatDayMonthLong(dateString: string): string {
  if (!dateString) return '';
  const [, month, day] = dateString.split('-');
  const monthNames = [
    '', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
  ];
  return `${parseInt(day)} ${monthNames[parseInt(month)]}`;
}

/** Returns which week of the month (1-4) a day belongs to */
function weekOfMonth(day: number): number {
  return Math.ceil(day / 7);
}

/** Builds 4 weekly buckets for a list of colaboradores in the current month */
function buildWeekBuckets(monthly: Colaborador[]): WeekBucket[] {
  const buckets: WeekBucket[] = [
    { label: 'Sem 1', count: 0 },
    { label: 'Sem 2', count: 0 },
    { label: 'Sem 3', count: 0 },
    { label: 'Sem 4', count: 0 },
  ];
  for (const c of monthly) {
    if (!c.data_nascimento) continue;
    const [, , dayStr] = c.data_nascimento.split('-');
    const day = parseInt(dayStr, 10);
    const week = Math.min(weekOfMonth(day), 4) - 1;
    buckets[week].count++;
  }
  return buckets;
}

function formatCurrentDate(): string {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function greetingByHour(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

// ─── Page Component ──────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [hoje, setHoje] = useState<Colaborador[]>([]);
  const [upcoming, setUpcoming] = useState<Colaborador[]>([]);
  const [mesAtual, setMesAtual] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);

  // E-mail settings state
  const [destinatarios, setDestinatarios] = useState<Destinatario[]>([]);
  const [novoEmail, setNovoEmail] = useState('');
  const [emailFeedback, setEmailFeedback] = useState<{ type: 'ok' | 'erro'; msg: string } | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [resumoSemanal, setResumoSemanal] = useState(true);

  const loadDestinatarios = useCallback(async () => {
    const res = await fetch('/aniversariantes/api/destinatarios');
    if (res.ok) {
      const data = await res.json();
      setDestinatarios(data.destinatarios ?? []);
    }
  }, []);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [resHoje, resSemana, resTodos, resDestinatarios] = await Promise.all([
          fetch('/aniversariantes/api/aniversariantes/hoje'),
          fetch('/aniversariantes/api/aniversariantes/semana'),
          fetch('/aniversariantes/api/aniversariantes/todos'),
          fetch('/aniversariantes/api/destinatarios'),
        ]);

        const dataHoje: Colaborador[] = resHoje.ok ? await resHoje.json() : [];
        const dataSemana: Colaborador[] = resSemana.ok ? await resSemana.json() : [];
        const dataTodos: Colaborador[] = resTodos.ok ? await resTodos.json() : [];

        setHoje(dataHoje);

        // "Próximos Dias" = esta semana excluindo hoje, limitado a 5
        const hojeIds = new Set(dataHoje.map((c) => c.id));
        setUpcoming(dataSemana.filter((c) => !hojeIds.has(c.id)).slice(0, 5));

        // Mês atual
        const currentMonth = new Date().getMonth() + 1;
        const doMes = dataTodos
          .filter((c) => {
            if (!c.data_nascimento) return false;
            const [, m] = c.data_nascimento.split('-');
            return parseInt(m, 10) === currentMonth;
          })
          .sort((a, b) => {
            const [, , da] = a.data_nascimento.split('-');
            const [, , db] = b.data_nascimento.split('-');
            return parseInt(da, 10) - parseInt(db, 10);
          });
        setMesAtual(doMes);

        if (resDestinatarios.ok) {
          const data = await resDestinatarios.json();
          setDestinatarios(data.destinatarios ?? []);
        }
      } catch (err) {
        console.error('fetchAll error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const weekBuckets = buildWeekBuckets(mesAtual);
  const maxBucketCount = Math.max(...weekBuckets.map((b) => b.count), 1);

  const currentMonthName = new Date().toLocaleDateString('pt-BR', { month: 'long' });

  // ── E-mail handlers ────────────────────────────────────────────────────────

  async function adicionarEmail() {
    const email = novoEmail.trim();
    if (!email) return;
    setEmailLoading(true);
    setEmailFeedback(null);
    try {
      const res = await fetch('/aniversariantes/api/destinatarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmailFeedback({ type: 'ok', msg: 'E-mail adicionado com sucesso!' });
        setNovoEmail('');
        await loadDestinatarios();
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
      const res = await fetch(`/aniversariantes/api/destinatarios?id=${id}`, { method: 'DELETE' });
      if (res.ok) setDestinatarios((prev) => prev.filter((d) => d.id !== id));
    } catch {
      // silently fail
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <main className={styles.canvas}>
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.dateLabel}>{formatCurrentDate()}</p>
          <h1 className={styles.greeting}>
            {greetingByHour()},{' '}
            <span className="brand-gradient-text">Equipe Hubon</span>
          </h1>
        </div>
        <div className={styles.searchWrap}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-on-surface-variant)', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} aria-hidden="true">
            search
          </span>
          <input
            id="busca-colaborador"
            type="text"
            placeholder="Buscar colaborador..."
            className={`field-input ${styles.searchInput}`}
            style={{ paddingLeft: '40px' }}
          />
        </div>
      </header>

      {loading ? (
        <div className="spinner" role="status" aria-label="Carregando..." />
      ) : (
        <div className={`${styles.bentoGrid} animate-fade-in`}>

          {/* ── Seção: Hoje ──────────────────────────────────────────── */}
          <section className={styles.sectionToday} aria-labelledby="hoje-titulo">
            <div className={styles.sectionHeader}>
              <h2 id="hoje-titulo" className={styles.sectionTitle}>
                Hoje
                {hoje.length > 0 && <span className="pulse-dot" aria-hidden="true" />}
              </h2>
              <span className={styles.sectionMeta}>
                {hoje.length} aniversariante{hoje.length !== 1 ? 's' : ''}
              </span>
            </div>

            {hoje.length === 0 ? (
              <div className={`glass-panel ${styles.emptyCard}`}>
                <div className="empty-state">
                  <span className="material-symbols-outlined empty-state__icon" style={{ fontSize: '32px' }} aria-hidden="true">celebration</span>
                  <p className="empty-state__title">Ninguém hoje!</p>
                  <p className="empty-state__desc">Nenhum aniversariante para o dia de hoje.</p>
                </div>
              </div>
            ) : (
              <div className={styles.todayGrid}>
                {hoje.map((person) => (
                  <article key={person.id} className={`glass-panel ${styles.birthdayCard} ${styles.birthdayCardActive}`}>
                    <div className={styles.cardHeader}>
                      <div className={`avatar avatar-lg ${styles.avatarActive}`}>
                        {getInitials(person.nome)}
                      </div>
                      <div className={styles.cardInfo}>
                        <h3 className={styles.cardName}>{person.nome}</h3>
                        <p className={styles.cardRole}>{person.cargo_principal || 'Colaborador'}</p>
                      </div>
                    </div>
                    <div className={styles.cardDate}>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }} aria-hidden="true">cake</span>
                      {formatDayMonth(person.data_nascimento)}
                    </div>
                    <div className={styles.cardActions}>
                      <button
                        className={`outline-btn ${styles.copyBtn}`}
                        title="Copiar dados"
                        onClick={() => {
                          navigator.clipboard.writeText(`${person.nome} — ${person.cargo_principal || ''} — ${formatDayMonth(person.data_nascimento)}`);
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '15px' }} aria-hidden="true">content_copy</span>
                        Copiar Dados
                      </button>
                      <button className="brand-btn" style={{ padding: '8px' }} title="Celebrar" aria-label={`Celebrar aniversário de ${person.nome}`}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }} aria-hidden="true">celebration</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* ── Seção: Próximos Dias ─────────────────────────────────── */}
          <section className={styles.sectionUpcoming} aria-labelledby="proximos-titulo">
            <div className={styles.sectionHeader}>
              <h2 id="proximos-titulo" className={styles.sectionTitle}>Próximos Dias</h2>
              <a href="#" className={styles.sectionLink}>Ver todos</a>
            </div>

            <div className="glass-panel" style={{ overflow: 'hidden' }}>
              {upcoming.length === 0 ? (
                <div className="empty-state">
                  <span className="material-symbols-outlined empty-state__icon" style={{ fontSize: '28px' }} aria-hidden="true">event_available</span>
                  <p className="empty-state__desc" style={{ padding: 0 }}>Nenhum aniversariante esta semana.</p>
                </div>
              ) : (
                <ul className={styles.upcomingList} role="list">
                  {upcoming.map((person) => (
                    <li key={person.id} className={styles.upcomingItem}>
                      <div className={styles.upcomingLeft}>
                        <div className="avatar avatar-md">
                          {getInitials(person.nome)}
                        </div>
                        <div>
                          <p className={styles.upcomingName}>{person.nome}</p>
                          <p className={styles.upcomingDate}>
                            {formatDayMonthLong(person.data_nascimento)}
                          </p>
                        </div>
                      </div>
                      <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-on-surface-variant)', opacity: 0 }} aria-hidden="true">
                        chevron_right
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* ── Seção: Frequência Mensal (Gráfico) ────────────────────── */}
          <section className={styles.sectionChart} aria-labelledby="chart-titulo">
            <h2 id="chart-titulo" className={styles.sectionTitle}>Frequência Mensal</h2>
            <div className={`glass-panel ${styles.chartPanel}`}>
              <div className={styles.chartBars} role="img" aria-label={`Gráfico de aniversariantes por semana em ${currentMonthName}`}>
                {weekBuckets.map((bucket) => {
                  const heightPct = Math.round((bucket.count / maxBucketCount) * 100);
                  const isHighest = bucket.count === maxBucketCount && bucket.count > 0;
                  return (
                    <div key={bucket.label} className={styles.barColumn}>
                      <div className={styles.barTrack}>
                        <div
                          className={`${styles.bar} ${isHighest ? styles.barHighlight : ''}`}
                          style={{ height: `${Math.max(heightPct, bucket.count > 0 ? 8 : 4)}%` }}
                          title={`${bucket.label}: ${bucket.count} aniversariante${bucket.count !== 1 ? 's' : ''}`}
                        />
                      </div>
                      <span className={styles.barLabel}>{bucket.label}</span>
                    </div>
                  );
                })}
              </div>
              <div className={styles.chartFooter}>
                <p className={styles.chartTotal}>
                  Total de <strong>{mesAtual.length}</strong> aniversariante{mesAtual.length !== 1 ? 's' : ''} em{' '}
                  <span style={{ textTransform: 'capitalize' }}>{currentMonthName}</span>
                </p>
              </div>
            </div>
          </section>

          {/* ── Seção: Configurações de E-mail ────────────────────────── */}
          <section id="email-settings" className={styles.sectionEmail} aria-labelledby="email-titulo">
            <h2 id="email-titulo" className={styles.sectionTitle}>Configurações de E-mail</h2>
            <div className={`glass-panel ${styles.emailPanel}`}>

              {/* Add form */}
              <div className={styles.emailForm}>
                <input
                  id="input-novo-email"
                  type="email"
                  placeholder="nome@empresa.com"
                  value={novoEmail}
                  onChange={(e) => setNovoEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && adicionarEmail()}
                  className="field-input"
                />
                <button
                  id="btn-adicionar-email"
                  onClick={adicionarEmail}
                  disabled={emailLoading}
                  className="brand-btn"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {emailLoading ? 'Adicionando...' : 'Adicionar'}
                </button>
              </div>

              {/* Feedback */}
              {emailFeedback && (
                <p className={emailFeedback.type === 'ok' ? 'feedback-ok' : 'feedback-err'} role="alert">
                  {emailFeedback.msg}
                </p>
              )}

              {/* Recipients list */}
              <div className={styles.recipientList}>
                {destinatarios.length === 0 ? (
                  <div className="empty-state" style={{ padding: 'var(--space-6)' }}>
                    <span className="material-symbols-outlined empty-state__icon" style={{ fontSize: '24px' }} aria-hidden="true">mail_outline</span>
                    <p className="empty-state__desc" style={{ padding: 0 }}>Nenhum destinatário cadastrado.</p>
                  </div>
                ) : (
                  <ul role="list" style={{ listStyle: 'none' }}>
                    {destinatarios.map((d) => (
                      <li key={d.id} className={styles.recipientItem}>
                        <div className={styles.recipientLeft}>
                          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-on-surface-variant)' }} aria-hidden="true">
                            alternate_email
                          </span>
                          <span className={styles.recipientEmail}>{d.email}</span>
                        </div>
                        <button
                          id={`btn-remover-email-${d.id}`}
                          onClick={() => removerEmail(d.id)}
                          className="ghost-btn"
                          style={{ color: 'var(--color-error)', padding: '6px' }}
                          title={`Remover ${d.email}`}
                          aria-label={`Remover destinatário ${d.email}`}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }} aria-hidden="true">delete</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Weekly digest toggle */}
              <div className={styles.digestToggle}>
                <input
                  type="checkbox"
                  id="resumo-semanal"
                  checked={resumoSemanal}
                  onChange={(e) => setResumoSemanal(e.target.checked)}
                  className={styles.toggleCheck}
                />
                <label htmlFor="resumo-semanal" className={styles.digestLabel}>
                  Enviar resumo semanal automaticamente
                </label>
              </div>

            </div>
          </section>

        </div>
      )}
    </main>
  );
}
