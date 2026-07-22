"use client";

import { useEffect, useState } from 'react';
import { Colaborador } from '@/lib/db';
import styles from './calendario.module.css';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

function getInitials(nome: string): string {
  const parts = nome.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDay(dateString: string): string {
  if (!dateString) return '';
  const [, , day] = dateString.split('-');
  return parseInt(day, 10).toString();
}

export default function CalendarioPage() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [mesAtivo, setMesAtivo] = useState(new Date().getMonth());

  useEffect(() => {
    async function fetchTodos() {
      try {
        const res = await fetch('/aniversariantes/api/aniversariantes/todos');
        if (res.ok) {
          const data = await res.json();
          setColaboradores(data);
        }
      } catch (err) {
        console.error('Erro ao carregar aniversariantes:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTodos();
  }, []);

  // Filter and sort for the active month
  const aniversariantesMes = colaboradores
    .filter((c) => {
      if (!c.data_nascimento) return false;
      const [, m] = c.data_nascimento.split('-');
      return parseInt(m, 10) === mesAtivo + 1;
    })
    .sort((a, b) => {
      const [, , da] = a.data_nascimento.split('-');
      const [, , db] = b.data_nascimento.split('-');
      return parseInt(da, 10) - parseInt(db, 10);
    });

  return (
    <main className={styles.canvas}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.dateLabel}>Visão Anual</p>
          <h1 className={styles.pageTitle}>Calendário de Aniversários</h1>
        </div>
      </header>

      <div className={styles.layout}>
        {/* Month Selector */}
        <nav className={`glass-panel ${styles.monthNav}`} aria-label="Seletor de meses">
          {MESES.map((mes, index) => (
            <button
              key={mes}
              className={`${styles.monthBtn} ${index === mesAtivo ? styles.monthBtnActive : ''}`}
              onClick={() => setMesAtivo(index)}
            >
              {mes}
            </button>
          ))}
        </nav>

        {/* List of Birthdays */}
        <section className={styles.contentArea}>
          {loading ? (
            <div className="spinner" role="status" aria-label="Carregando..." />
          ) : aniversariantesMes.length === 0 ? (
            <div className={`glass-panel ${styles.emptyState}`}>
              <span className="material-symbols-outlined empty-state__icon" style={{ fontSize: '32px' }} aria-hidden="true">
                event_busy
              </span>
              <p className="empty-state__title">Nenhum aniversário</p>
              <p className="empty-state__desc">Não temos aniversariantes no mês de {MESES[mesAtivo].toLowerCase()}.</p>
            </div>
          ) : (
            <div className={styles.listGrid}>
              {aniversariantesMes.map((person) => (
                <article key={person.id} className={`glass-panel ${styles.personCard}`}>
                  <div className={styles.cardHeader}>
                    <div className="avatar avatar-lg">
                      {getInitials(person.nome)}
                    </div>
                    <div className={styles.cardInfo}>
                      <h3 className={styles.cardName}>{person.nome}</h3>
                      <p className={styles.cardRole}>{person.cargo_principal || 'Colaborador'}</p>
                    </div>
                  </div>
                  <div className={styles.cardDate}>
                    <div className={styles.dateBox}>
                      <span className={styles.dateDay}>{formatDay(person.data_nascimento)}</span>
                      <span className={styles.dateMonth}>{MESES[mesAtivo].slice(0, 3)}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
