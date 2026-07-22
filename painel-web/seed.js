/* eslint-disable @typescript-eslint/no-require-imports */
const db = require('better-sqlite3')('../sync-job/database.sqlite');
db.exec(`
  INSERT INTO colaboradores (id, nome, data_nascimento, cargo_principal) VALUES 
  (101, 'João da Silva (Teste)', '1990-07-21', 'Desenvolvedor'),
  (102, 'Maria Oliveira (Teste)', '1985-07-23', 'Gerente'),
  (103, 'Carlos Souza (Teste)', '1988-12-29', 'COO'),
  (104, 'Ana Costa (Teste)', '1996-02-29', 'Analista'),
  (105, 'Marcos Paulo (Teste)', '1992-08-15', 'Designer');
`);
console.log('Mock data inserted.');
