/**
 * db-config.ts
 *
 * Conexão de leitura/escrita ao banco SQLite local, usada exclusivamente
 * para dados de configuração da aplicação (ex: destinatários de e-mail).
 *
 * NÃO use esta conexão para ler dados de colaboradores — use lib/db.ts
 * (readonly) para isso, em conformidade com as regras de LGPD do projeto.
 */
import Database from 'better-sqlite3';
import path from 'path';

const defaultDbPath = path.resolve(process.cwd(), '../sync-job/database.sqlite');
const dbPath = process.env.DATABASE_PATH || defaultDbPath;

const dbConfig = new Database(dbPath, { readonly: false });

// Garante que a tabela de configuração existe ao iniciar a aplicação
dbConfig.exec(`
  CREATE TABLE IF NOT EXISTS email_destinatarios (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    criado_em TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

/**
 * Seed: se a tabela estiver vazia e EMAIL_TO estiver no .env,
 * importa os endereços para não perder a configuração existente.
 */
const count = (dbConfig.prepare('SELECT COUNT(*) as n FROM email_destinatarios').get() as { n: number }).n;

if (count === 0 && process.env.EMAIL_TO) {
  const emails = process.env.EMAIL_TO.split(',').map(e => e.trim()).filter(Boolean);
  const insert = dbConfig.prepare('INSERT OR IGNORE INTO email_destinatarios (email) VALUES (?)');
  const insertMany = dbConfig.transaction((list: string[]) => {
    for (const email of list) insert.run(email);
  });
  insertMany(emails);
}

export interface EmailDestinatario {
  id: number;
  email: string;
  criado_em: string;
}

export default dbConfig;
