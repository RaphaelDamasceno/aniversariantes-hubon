"""
DB-API: proxy REST para MariaDB.

Permite que aplicações cliente acessem o banco sem ter credenciais
diretas. Todas as queries usam parametrização do driver pra prevenir
SQL injection. Controle de permissão é feito via GRANT no MariaDB,
não no código da aplicação.

Endpoints:
    POST /query    - leitura (SELECT, SHOW, DESCRIBE, EXPLAIN)
    POST /execute  - escrita (INSERT, UPDATE, DELETE) e batch
    GET  /health   - verifica se a API e o banco estão no ar

Autenticação:
    Todo request (exceto /health) precisa do header X-API-Key
    com o valor definido no .env.

Execução:
    uvicorn main:app --host 10.0.3.2 --port 8000 --workers 4

Dependências:
    fastapi, uvicorn[standard], aiomysql, python-dotenv
"""

import logging
import os
import time
from contextlib import asynccontextmanager
from typing import AsyncGenerator, List, Optional

import aiomysql
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

load_dotenv()

# Configuração

DB_CONFIG = {
    "host":       os.getenv("DB_HOST", "127.0.0.1"),
    "port":       int(os.getenv("DB_PORT", "3306")),
    "user":       os.getenv("DB_USER"),
    "password":   os.getenv("DB_PASSWORD"),
    "db":         os.getenv("DB_NAME"),
    "minsize":    2,
    "maxsize":    int(os.getenv("DB_POOL_SIZE", "10")),
    "autocommit": False,
    "charset":    "utf8mb4",
}

API_KEY = os.getenv("API_KEY", "")

# Logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("db-api")

# Pool de conexões

pool = None


@asynccontextmanager
async def lifespan(_app):
    """Cria o pool ao subir a API e fecha ao desligar."""
    global pool
    pool = await aiomysql.create_pool(**DB_CONFIG)
    log.info("Pool pronto (%s-%s conex\u00f5es)", DB_CONFIG["minsize"], DB_CONFIG["maxsize"])
    yield
    pool.close()
    await pool.wait_closed()
    log.info("Pool fechado")


# Aplicação

app = FastAPI(
    title="DB-API",
    version="1.0.0",
    lifespan=lifespan,
)


# Autenticação

async def require_api_key(x_api_key: str = Header(default=None)):
    """Rejeita o request se a API key estiver ausente ou errada."""
    if API_KEY and x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="API key inválida ou ausente")


# Modelos de request

class QueryIn(BaseModel):
    sql: str
    params: list = []

    class Config:
        schema_extra = {
            "example": {
                "sql": "SELECT id, nome FROM usuarios WHERE ativo = %s LIMIT %s",
                "params": [1, 50],
            }
        }


class ExecuteIn(BaseModel):
    sql: str
    params: list = []
    batch: Optional[List[list]] = None

    class Config:
        schema_extra = {
            "example": {
                "sql": "INSERT INTO usuarios (nome, email) VALUES (%s, %s)",
                "params": ["João", "joao@email.com"],
            }
        }


# Middleware de tempo de resposta

@app.middleware("http")
async def add_response_timing(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    elapsed_ms = (time.perf_counter() - start) * 1_000
    response.headers["X-Time-Ms"] = f"{elapsed_ms:.1f}"
    log.info("%s %s  %s  %.1fms", request.method, request.url.path, response.status_code, elapsed_ms)
    return response


# Handler global de exceção

@app.exception_handler(Exception)
async def unhandled_exception(request: Request, exc: Exception):
    log.exception("Erro não tratado em %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"ok": False, "detail": "Erro interno"})


# Endpoints

@app.post("/query", dependencies=[Depends(require_api_key)])
async def run_query(body: QueryIn):
    """Executa SELECT e retorna o resultado."""
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute(body.sql, body.params or None)
            rows = await cur.fetchall()
            return {
                "ok": True,
                "rows": rows,
                "count": len(rows),
                "columns": [col[0] for col in cur.description] if cur.description else [],
            }


@app.post("/execute", dependencies=[Depends(require_api_key)])
async def run_execute(body: ExecuteIn):
    """Executa INSERT, UPDATE ou DELETE. Suporta batch."""
    async with pool.acquire() as conn:
        try:
            async with conn.cursor() as cur:
                if body.batch:
                    await cur.executemany(body.sql, body.batch)
                else:
                    await cur.execute(body.sql, body.params or None)
                affected = cur.rowcount
                last_id = cur.lastrowid
            await conn.commit()
            return {"ok": True, "affected": affected, "last_id": last_id}
        except Exception as exc:
            await conn.rollback()
            raise HTTPException(status_code=500, detail=str(exc))


@app.get("/health")
async def healthcheck():
    """Verifica se a API e o banco estão funcionando."""
    try:
        async with pool.acquire() as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT 1")
        return {"ok": True, "pool_size": pool.size, "pool_free": pool.freesize}
    except Exception as exc:
        raise HTTPException(status_code=503, detail=str(exc))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, workers=1)
