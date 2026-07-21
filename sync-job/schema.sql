CREATE TABLE IF NOT EXISTS colaboradores (
    id INTEGER PRIMARY KEY,
    nome TEXT NOT NULL,
    data_nascimento DATE,
    cargo_principal TEXT,
    is_clevel BOOLEAN DEFAULT 0,
    synced_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
