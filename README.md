# Aniversariantes HubOn (Antigravity)

Este projeto é um painel e sistema de notificações automatizadas para aniversariantes da empresa. O objetivo é centralizar a informação de aniversariantes para os departamentos de Marketing e Financeiro/DP, automatizando alertas por e-mail.

## Estrutura do Projeto

- `painel-web/`: Aplicação web construída com Next.js, fornecendo o painel de leitura, relatórios e rotas de envio de e-mails através de cron jobs.
- `db-api/` e `db-api-slim/`: Proxies FastAPI para consultar a base de dados via rede interna (Mariadb) através da VPN.
- `sync-job/`: Rotina de sincronização de dados do banco de dados principal para o banco SQLite usado pela aplicação web.
- `docs/`: Documentação, PRDs e Decisões de arquitetura.

## Tecnologias e Funcionalidades

- **Frontend/Backend Web:** Next.js (React), TailwindCSS.
- **Banco de Dados Intermediário:** SQLite (acessado via `better-sqlite3`).
- **Automações:** Envio de E-mails (Nodemailer via API routes no Next).
- **Segurança:** Autenticação no painel web, proteção de cron jobs com `CRON_SECRET` e proxy interno para acesso a dados protegidos.

## Configuração

1. Copie o arquivo `.env.example` para `.env` na raiz do projeto (não versione o `.env`).
2. Preencha as chaves:
   - `CRON_SECRET`, `ADMIN_USER`, `ADMIN_PASS`, senhas de banco, credenciais SMTP, etc.
3. Consulte as documentações no diretório `docs/` para instruções de deploy (VPS, Hostinger).

## Deploy e BasePath
- O projeto Next.js no `painel-web/` está configurado para utilizar um `basePath` no ambiente de produção (ex: subdiretório `/aniversariantes`), facilitando o proxy reverso.

## LGPD e Segurança
- O arquivo `.env` não é versionado.
- Nenhuma senha ou token de API deve ser hardcoded no projeto.
- O acesso a informações dos colaboradores é protegido e requer autenticação.
