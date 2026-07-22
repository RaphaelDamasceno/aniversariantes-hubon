import { syncColaboradores, ColaboradorDB } from './index';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

// Mock console.log and console.error
beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
    jest.restoreAllMocks();
});

describe('syncColaboradores', () => {
    let db: Database<sqlite3.Database, sqlite3.Statement>;

    beforeEach(async () => {
        db = await open({
            filename: path.resolve(__dirname, 'database.sqlite'),
            driver: sqlite3.Database
        });
        const schemaPath = path.resolve(__dirname, 'schema.sql');
        const fs = require('fs');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await db.exec(schema);
        await db.run('DELETE FROM colaboradores');
    });

    afterAll(async () => {
        if (db) {
            await db.close();
        }
    });

    it('should successfully sync given colaboradores', async () => {
        const mockColaboradores: ColaboradorDB[] = [
            {
                id: 1,
                nome: 'João Silva',
                data_nascimento: '1990-01-01',
                cargo_principal: 'Assistente'
            },
            {
                id: 2,
                nome: 'Maria Souza',
                data_nascimento: '1985-05-15',
                cargo_principal: 'COO'
            }
        ];

        await syncColaboradores(mockColaboradores);

        const rows = await db.all('SELECT * FROM colaboradores ORDER BY id ASC');
        
        expect(rows).toHaveLength(2);
        expect(rows[0].nome).toBe('João Silva');
        expect(rows[1].nome).toBe('Maria Souza');
    });

    it('should not duplicate when running multiple times', async () => {
        const mockColaboradores: ColaboradorDB[] = [
            {
                id: 3,
                nome: 'Carlos Costa',
                data_nascimento: '1992-10-20',
                cargo_principal: 'Analista'
            }
        ];

        // First sync
        await syncColaboradores(mockColaboradores);
        
        // Change data and sync again
        mockColaboradores[0].nome = 'Carlos Costa Atualizado';
        await syncColaboradores(mockColaboradores);

        const rows = await db.all('SELECT * FROM colaboradores');
        
        expect(rows).toHaveLength(1);
        expect(rows[0].nome).toBe('Carlos Costa Atualizado');
    });

    it('should handle missing data_nascimento gracefully', async () => {
        const mockColaboradores: ColaboradorDB[] = [
            {
                id: 4,
                nome: 'Sem Data',
                data_nascimento: null as any,
                cargo_principal: 'Recepcionista'
            }
        ];

        await syncColaboradores(mockColaboradores);

        const rows = await db.all('SELECT * FROM colaboradores');
        
        expect(rows).toHaveLength(1);
        expect(rows[0].nome).toBe('Sem Data');
        expect(rows[0].data_nascimento).toBeNull();
    });

    it('should handle invalid data_nascimento gracefully', async () => {
        const mockColaboradores: ColaboradorDB[] = [
            {
                id: 5,
                nome: 'Data Invalida',
                data_nascimento: '0000-00-00',
                cargo_principal: 'Outro'
            }
        ];

        await syncColaboradores(mockColaboradores);

        const rows = await db.all('SELECT * FROM colaboradores WHERE id = 5');
        
        expect(rows).toHaveLength(1);
        expect(rows[0].data_nascimento).toBe('0000-00-00');
    });
});
