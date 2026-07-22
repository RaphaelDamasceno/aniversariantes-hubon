CREATE TABLE IF NOT EXISTS colaboradores (
    id INTEGER PRIMARY KEY,
    nome TEXT NOT NULL,
    data_nascimento DATE,
    cargo_principal TEXT,
    synced_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
