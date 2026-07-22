# Decisões e Escopo — Projeto Aniversariantes

Registro vivo das decisões tomadas e funcionalidades deixadas de fora.
Atualizar sempre que uma nova decisão for tomada ou algo for descartado.

> [!CAUTION]
> **Regra de conduta do agente:** Antes de qualquer ação irreversível ou de alto impacto (deploy, alteração de banco, envio de mensagens em produção, remoção de dados), o agente DEVE exibir um alerta explícito e aguardar confirmação — nunca silenciar decisões importantes em meio a um fluxo de `Accept All`.

---

## Funcionalidades fora do escopo

| # | Funcionalidade | Motivo | Data |
|---|----------------|--------|------|
| 1 | WhatsApp | Módulo completamente removido do escopo do projeto, todas as notificações serão via e-mail. | 2026-07-22 |

---

## Decisões de negócio

| # | Decisão | Detalhe | Data |
|---|---------|---------|------|
| 1 | Valor do benefício | R$ 100,00 fixo para todos os elegíveis, sem exceções por tempo de casa ou cargo. | 2026-07-21 |
| 2 | Elegibilidade para o benefício | Apenas **funcionários administrativos** — critério: `administrativo_ativo = 1`. Corretores autônomos estão fora. | 2026-07-21 |
| 3 | Destinatários do e-mail semanal (fase 1) | `dp@hubnogueira.com.br` e `raphaelferreira@hubnogueira.com.br`. Lista gerenciável via interface — não hardcoded. | 2026-07-21 |
| 4 | Infraestrutura | Aplicação roda em **VPS Hostinger** — Ubuntu 24.04, IP púблico `179.197.64.244`. Acesso via SSH + API da Hostinger. | 2026-07-21 |
| 5 | Credenciais de acesso VPS | Token da API Hostinger armazenado em `.env` na raiz do projeto. Nunca expor em código, logs ou mensagens. `.env` está no `.gitignore`. | 2026-07-21 |

---

## Decisões técnicas

| # | Decisão | Detalhe | Data |
|---|---------|---------|------|
| 1 | Acesso ao banco | Via **DB-API** (proxy REST FastAPI em `10.0.3.2:8000`) — nunca conexão direta ao MariaDB. Autenticação por `X-API-Key`. | 2026-07-21 |
| 2 | Critério de "ativo" no banco | Funcionário ativo = `data_exclusao IS NULL OR data_exclusao = '1970-01-01 00:00:01'`. A sentinela `1970-01-01` significa "não desligado" no sistema de origem. | 2026-07-21 |
| 3 | Hierarquia via join | O campo `nome_gerente` está 100% vazio no banco. Qualquer consulta de gestor deve fazer JOIN de `id_corret_gerente` com `id_corretor` da mesma tabela. | 2026-07-21 |
| 4 | Credenciais | Nunca hardcoded. Sempre via variáveis de ambiente (`.env`). Um `.env.example` com os nomes das variáveis (sem valores) deve acompanhar o código. | 2026-07-21 |
| 5 | Envio de e-mails (SMTP) | Será utilizado um e-mail pessoal provisoriamente para o envio dos alertas do Módulo 3, visto que a configuração de DNS corporativo é demorada e o objetivo é não bloquear a entrega do projeto. | 2026-07-21 |

---

## Alertas de qualidade de dados (banco de origem)

| # | Problema | Impacto | Status |
|---|----------|---------|--------|
| 1 | `data_exclusao` com sentinela `1970-01-01 00:00:01` em 889 registros | Tratado no sync — esse valor é interpretado como "ativo". | Mitigado no código |
| 2 | 57 colaboradores sem `datanascimento` | Esses colaboradores **não aparecem** no painel de aniversariantes. Aceito como limitação. | Aceito |
| 4 | `nome_gerente`, `nome_coordenador`, `nome_mentoring` 100% vazios | Join obrigatório via ID. Ver decisão técnica #3. | Mitigado no código |
| 5 | `administrativo_ativo` e `administrador_ativo` com valores idênticos | Duplicidade de schema confirmada. Usamos exclusivamente `administrativo_ativo`. Campo `administrador_ativo` ignorado. | Encerrado |

---

## Log de perguntas respondidas

| Pergunta (Módulo 0) | Resposta | Data |
|---------------------|----------|------|
| Funcionários têm supervisor mapeado no banco? | Não. `id_corret_gerente` é NULL para todos os 90 funcionários admin ativos. | 2026-07-21 |
| 57 colaboradores sem nascimento ficam de fora? | Sim, aceito como limitação. | 2026-07-21 |
| Critério de "é funcionário" = `administrativo_ativo = 1`? | Sim, confirmado. | 2026-07-21 |
| Duplicidade `administrativo_ativo` vs `administrador_ativo`? | Usar `administrativo_ativo`. Campo `administrador_ativo` ignorado. | 2026-07-21 |
