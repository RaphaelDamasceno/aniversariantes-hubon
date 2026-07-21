# Módulos, Critérios de Aceitação e Prompts — Projeto Aniversariantes

Este arquivo complementa o `PRD-Aniversariantes.md`. Ele quebra o projeto em módulos independentes, cada um pensado para virar **uma tarefa/chat separado no Antigravity**. Use o PRD como contexto de negócio e este arquivo como guia de execução técnica.

---

## Regras gerais do projeto (colocar em `.agent/skills/` ou `GEMINI.md` na raiz)

Cole isso uma vez como regra de projeto, para não precisar repetir em cada chat:

```
Este projeto lê dados de um banco de colaboradores acessível somente via VPN.
Nunca hardcode credenciais, hosts ou tokens — sempre usar variáveis de ambiente (.env),
e criar um .env.example com os nomes das variáveis (sem valores reais).
O painel é somente leitura (read-only) — não implementar edição de colaboradores.
Dados de aniversário/data de nascimento são dados pessoais (LGPD) — nunca expor
endpoints sem autenticação, nunca logar esses dados em texto plano em logs persistentes.
Sempre gerar testes básicos para regras de data (aniversariantes do dia/semana),
incluindo casos de borda: virada de mês, virada de ano, 29 de fevereiro.
Referência de negócio completa: docs/PRD.md
```

---

## Módulo 0 — Validação e Preparação (não é código)

**Objetivo:** eliminar as incertezas do PRD antes de qualquer linha de código.

**Critérios de aceitação:**
- [x] Confirmado se o banco de colaboradores tem campo de gestor/supervisor direto.
- [x] Confirmado como identificar C-level (campo no banco, planilha à parte, ou lista fixa).
- [x] Confirmado valor e regra do benefício (sempre R$100? alguma exceção?).
- [x] Definida a lista de distribuição inicial do e-mail semanal.
- [x] Definido quem/onde vai rodar o job de sync (máquina com acesso à VPN).
- [x] Números de WhatsApp do DP e política de C-level/supervisor levantados.

> Este módulo não usa o Antigravity — é levantamento com o time/solicitante.

---

## Módulo 1 — Sync DB → Base intermediária

**Objetivo:** replicar periodicamente os dados mínimos necessários (nome, data de nascimento, área, gestor) do banco de colaboradores (via VPN) para uma base intermediária acessível pela aplicação.

**Critérios de aceitação:**
- [x] Script/job conecta ao banco de colaboradores via VPN e lê apenas os campos necessários.
- [x] Dados são gravados numa base intermediária (ex: Postgres/SQLite) com schema simples e documentado.
- [x] Job roda de forma agendada (ex: 1x/dia) sem intervenção manual.
- [x] Falhas de conexão (VPN indisponível, etc.) são logadas e não derrubam o processo.
- [x] Nenhuma credencial fica hardcoded — tudo via `.env`.
- [x] Existe um modo "dry-run" para testar sem gravar nada.

**Prompt sugerido (colar num chat novo do Antigravity):**
```
Contexto: leia docs/PRD.md e as regras do projeto antes de começar.

Crie um script de sincronização em [linguagem de sua preferência, ex: Python/Node]
que:
1. Conecta a um banco de colaboradores (schema: ver docs/PRD.md, seção 7 —
   pedir para eu colar o schema real das tabelas relevantes).
2. Lê apenas: nome, data de nascimento, área/cargo, gestor direto (se existir).
3. Grava esses dados numa base intermediária local (Postgres) com uma tabela
   "colaboradores" simples.
4. Roda via variável de ambiente para host/usuário/senha do banco de origem
   (nunca hardcode).
5. Gere um .env.example com os nomes das variáveis necessárias.
6. Adicione um modo --dry-run que só imprime o que seria sincronizado.
7. Gere testes cobrindo: colaborador sem gestor definido, datas inválidas,
   e reprocessamento (não duplicar registros ao rodar de novo).

Não implemente autenticação nem interface aqui — só o job de sync.
```

---

## Módulo 2 — API + Painel Web

**Objetivo:** expor os dados da base intermediária via API e um painel web de leitura, mostrando aniversariantes do dia e da semana.

**Critérios de aceitação:**
- [x] Endpoint retorna aniversariantes do dia atual.
- [x] Endpoint retorna aniversariantes da semana atual (considerando virada de mês/ano).
- [x] Painel exige login — não é acessível sem autenticação.
- [x] Painel mostra nome + data de nascimento (e área/cargo, se disponível) de forma clara.
- [x] Cálculo de "aniversariante da semana" tem teste automatizado cobrindo virada de ano e 29/fev.
- [x] Painel funciona corretamente mesmo com lista vazia (sem aniversariantes na semana).

**Prompt sugerido:**
```
Contexto: leia docs/PRD.md e as regras do projeto.

A base intermediária de colaboradores já existe (tabela "colaboradores" com
nome, data_nascimento, area, gestor). Crie:

1. Uma API REST com dois endpoints:
   - GET /aniversariantes/hoje
   - GET /aniversariantes/semana
   Ambos devem considerar apenas dia e mês do aniversário (idade não importa).

2. Um painel web simples (read-only) que consome essa API e mostra:
   - lista de aniversariantes de hoje, em destaque
   - lista de aniversariantes da semana
   - nome + data de nascimento (dia/mês) + área, se disponível

3. Autenticação básica obrigatória para acessar o painel (não expor publicamente).

4. Testes cobrindo: virada de mês, virada de ano, colaborador nascido em 29/fev,
   e o caso de nenhum aniversariante na semana.

Stack sugerida: [preencher se tiver preferência, ex: Node/Express + React,
ou deixe o agente sugerir].
```

---

## Módulo 3 — E-mail semanal (n8n)

**Objetivo:** disparar toda segunda-feira um e-mail com os aniversariantes da semana para a lista de distribuição.

**Critérios de aceitação:**
- [ ] Workflow n8n dispara automaticamente toda segunda-feira, em horário definido.
- [ ] Corpo do e-mail lista nome + data de cada aniversariante da semana.
- [ ] Lista de destinatários é configurável (não hardcoded direto no workflow).
- [ ] Se não houver aniversariantes na semana, o e-mail avisa isso (não falha silenciosamente).
- [ ] Workflow trata erro de falha no envio (ex: retry ou notificação de falha).

> Esse módulo tende a ser mais rápido montar direto na interface do n8n do que pedir pro Antigravity gerar código. Use o Antigravity só se precisar de alguma lógica custom (ex: formatação do e-mail) que o n8n não resolve nativamente.

---

## Módulo 4 — WhatsApp via n8n + Evolution API

**Objetivo:** no dia do aniversário, notificar automaticamente colaborador, DP, C-level e supervisor direto.

**Critérios de aceitação:**
- [ ] Workflow identifica corretamente os aniversariantes do dia (consumindo o endpoint `/aniversariantes/hoje` do Módulo 2).
- [ ] Mensagem de parabéns é enviada ao colaborador.
- [ ] Mensagem é enviada ao número do DP, citando nome do colaborador e valor do benefício.
- [ ] Mensagem é enviada ao(s) C-level(s) e ao supervisor direto do colaborador (requer o dado de gestor mapeado no Módulo 1).
- [ ] Se o colaborador não tiver supervisor/gestor mapeado, o workflow não quebra — apenas pula esse envio e loga o caso.
- [ ] Números de telefone e templates de mensagem são configuráveis, não hardcoded.

> Também tende a ser mais rápido montar direto no n8n. Peça ajuda ao Antigravity só se precisar de um endpoint auxiliar (ex: `/aniversariantes/hoje/detalhado` retornando também o gestor e C-level responsável) para o n8n consumir.

---

## Ordem recomendada de execução

1. Módulo 0 (validação — sem Antigravity)
2. Módulo 1 (sync)
3. Módulo 2 (API + painel)
4. Módulo 3 e 4 podem rodar em paralelo depois que o Módulo 2 estiver de pé, já que ambos dependem do endpoint de aniversariantes do dia/semana.
