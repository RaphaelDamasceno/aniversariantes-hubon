import axios from 'axios';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DB_API_URL = process.env.DB_API_URL;
const DB_API_KEY = process.env.DB_API_KEY;

const isDryRun = process.argv.includes('--dry-run');

export interface ColaboradorDB {
    id: number;
    nome: string;
    data_nascimento: string;
    cargo_principal: string;
    is_clevel: number;
}

export async function fetchColaboradores(): Promise<ColaboradorDB[]> {
    if (!DB_API_URL || !DB_API_KEY) {
        throw new Error('DB_API_URL or DB_API_KEY is not defined in .env');
    }

    const query = `
        SELECT 
            id_corretor AS id,
            nome,
            datanascimento AS data_nascimento,
            cargo_principal,
            (socio_ativo = 1 AND cargo_principal IN ('COO', 'CPO', 'Sócio')) AS is_clevel
        FROM 
            corpstek_corretores
        WHERE 
            administrativo_ativo = 1 
            AND (data_exclusao IS NULL OR data_exclusao = '1970-01-01 00:00:01')
    `;

    try {
        const response = await axios.post(
            `${DB_API_URL}/query`,
            { sql: query, params: [] },
            {
                headers: { 'X-API-Key': DB_API_KEY, 'Content-Type': 'application/json' }
            }
        );

        if (!response.data || !response.data.ok) {
            throw new Error(`Failed to fetch: ${JSON.stringify(response.data)}`);
        }

        return response.data.rows;
    } catch (error) {
        console.error('Error fetching colaboradores from DB-API:', error);
        throw error;
    }
}

export async function initDb() {
    const db = await open({
        filename: path.resolve(__dirname, 'database.sqlite'),
        driver: sqlite3.Database
    });

    const schemaPath = path.resolve(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await db.exec(schema);

    return db;
}

export async function syncColaboradores(colaboradores: ColaboradorDB[]) {
    const db = await initDb();
    
    try {
        await db.run('BEGIN TRANSACTION');
        
        await db.run('DELETE FROM colaboradores');
        
        const stmt = await db.prepare(`
            INSERT INTO colaboradores (id, nome, data_nascimento, cargo_principal, is_clevel)
            VALUES (?, ?, ?, ?, ?)
        `);
        
        for (const colab of colaboradores) {
            await stmt.run(
                colab.id,
                colab.nome,
                colab.data_nascimento,
                colab.cargo_principal,
                colab.is_clevel ? 1 : 0
            );
        }
        
        await stmt.finalize();
        await db.run('COMMIT');
        
        console.log(`Successfully synced ${colaboradores.length} colaboradores to local database.`);
    } catch (error) {
        await db.run('ROLLBACK');
        console.error('Failed to sync to local database:', error);
        throw error;
    } finally {
        await db.close();
    }
}

async function main() {
    try {
        console.log(`Starting sync job...${isDryRun ? ' (DRY RUN)' : ''}`);
        
        const colaboradores = await fetchColaboradores();
        
        if (isDryRun) {
            console.log('DRY RUN Results:');
            console.log(JSON.stringify(colaboradores, null, 2));
            console.log(`Total records fetched: ${colaboradores.length}`);
            return;
        }

        await syncColaboradores(colaboradores);
        console.log('Sync job completed successfully.');
    } catch (error) {
        console.error('Sync job failed:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}
