import Database from 'better-sqlite3';
import path from 'path';

// By default, it will look one level up into sync-job
const defaultDbPath = path.resolve(process.cwd(), '../sync-job/database.sqlite');
const dbPath = process.env.DATABASE_PATH || defaultDbPath;

const db = new Database(dbPath, { readonly: true });

export interface Colaborador {
  id: number;
  nome: string;
  data_nascimento: string;
  cargo_principal: string | null;
  synced_at: string;
}

export default db;
