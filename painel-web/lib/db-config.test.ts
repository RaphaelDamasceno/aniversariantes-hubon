import dbConfig, { EmailDestinatario } from './db-config';

describe('dbConfig - Gestão de Destinatários de E-mail', () => {
  const testEmail = `test_${Date.now()}@exemplo.com`;
  let createdId: number;

  it('deve garantir que a tabela email_destinatarios existe', () => {
    const tableCheck = dbConfig
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='email_destinatarios'")
      .get();
    expect(tableCheck).toBeDefined();
  });

  it('deve inserir um novo e-mail com sucesso', () => {
    const info = dbConfig.prepare('INSERT INTO email_destinatarios (email) VALUES (?)').run(testEmail);
    expect(info.changes).toBe(1);
    createdId = info.lastInsertRowid as number;
    expect(createdId).toBeGreaterThan(0);
  });

  it('deve consultar o e-mail recém-inserido', () => {
    const row = dbConfig
      .prepare('SELECT * FROM email_destinatarios WHERE id = ?')
      .get(createdId) as EmailDestinatario;
    expect(row).toBeDefined();
    expect(row.email).toBe(testEmail);
  });

  it('não deve permitir e-mails duplicados (UNIQUE constraint)', () => {
    expect(() => {
      dbConfig.prepare('INSERT INTO email_destinatarios (email) VALUES (?)').run(testEmail);
    }).toThrow();
  });

  it('deve deletar o e-mail de teste', () => {
    const info = dbConfig.prepare('DELETE FROM email_destinatarios WHERE id = ?').run(createdId);
    expect(info.changes).toBe(1);

    const check = dbConfig
      .prepare('SELECT * FROM email_destinatarios WHERE id = ?')
      .get(createdId);
    expect(check).toBeUndefined();
  });
});
