# PRD — Painel de Aniversariantes

**Status:** Rascunho v1
**Autor:** (preencher)
**Solicitante original:** Marketing / Financeiro (via chamado)
**Data:** 21/07/2026

---

## 1. Contexto

Marketing e Financeiro precisam saber quem são os aniversariantes da empresa para:
- **Marketing:** produzir cards de parabéns.
- **Financeiro/DP:** processar o pagamento de R$ 100,00 referente ao aniversário do colaborador.

Hoje esse processo aparentemente é manual/informal, gerando esquecimentos e atraso. O chamado pede uma solução central para consultar aniversariantes, com bônus de automações (e-mail semanal e WhatsApp).

## 2. Problema

Não existe uma fonte única e automatizada de consulta de aniversariantes, o que causa:
- Esquecimento de pagamentos do benefício de aniversário.
- Atraso na produção de materiais de marketing.
- Dependência de checagem manual em planilha/sistema de RH.

## 3. Objetivo

Criar uma solução que centralize e distribua a informação de aniversariantes de forma automática e confiável, reduzindo trabalho manual e esquecimentos.

## 4. Usuários / Stakeholders

| Perfil | Necessidade |
|---|---|
| Marketing | Ver aniversariantes do dia/semana para criar cards |
| Financeiro / DP | Ser notificado para processar os R$100 do aniversário |
| C-level e Supervisor do colaborador | Receber aviso do aniversário do liderado (via WhatsApp) |
| Colaborador (corretor ou administrativo) | Ser lembrado de retirar o valor com o DP |
| Solicitante do chamado | Painel + relatório consolidado |

## 5. Escopo — Fase 1 (MVP)

### 5.1 Painel web (fonte da verdade)
- Lista de aniversariantes **do dia** e **da semana**.
- Campos: nome, data de nascimento (ou só dia/mês, ver seção 9), área/cargo (útil para o Marketing segmentar).
- Atualização automática a partir do banco de colaboradores (sync periódico, não precisa ser "real time" no sentido literal — ver seção 8).
- Acesso via login interno (não pode ser público, ver seção 9 — LGPD).

### 5.2 E-mail semanal
- Disparo toda segunda-feira de manhã.
- Lista os aniversariantes da semana.
- Enviado para uma lista de distribuição configurável (Marketing + Financeiro + quem mais for adicionado).

### 5.3 WhatsApp automatizado (via n8n + Evolution API)
No dia do aniversário, disparar:
- Mensagem institucional de parabéns para o colaborador.
- Mensagem para o **número do DP**, pedindo para liberar os R$100 do colaborador X.
- Mensagem para o(s) **C-level** e para o **Supervisor direto** do colaborador, avisando do aniversário.

> ⚠️ Este item depende de mapear a **hierarquia** (quem é supervisor de quem, quem são os C-levels) — isso pode não estar disponível no banco de colaboradores atual. Precisa validar (ver seção 9).

## 6. Fora de escopo (Fase 1)

- Confirmação automática de que o pagamento foi realmente feito pelo DP (fica só como lembrete/aviso).
- Integração com folha de pagamento.
- Edição de dados de colaboradores pelo painel (o painel é só leitura).
- Segmentação avançada de marketing (ex: geração automática do card em si).

## 7. Fonte de dados

- Banco de dados local de colaboradores (corretores + administrativo), acessível **somente via VPN**.
- Contém: nome, data de nascimento, e (a confirmar) cargo/área/gestor.

## 8. Arquitetura proposta (visão de alto nível)

```
[DB local via VPN] --(sync agendado, ex: 1x/dia)--> [Base intermediária / cache]
                                                            |
                                     +----------------------+----------------------+
                                     |                                             |
                              [API/Backend]                                [n8n workflows]
                                     |                                             |
                              [Painel Web]                          [E-mail semanal] [WhatsApp/Evolution]
```

**Por que um "meio de campo" (base intermediária) e não consultar o DB direto:**
- O DB só é acessível via VPN — a aplicação web e o n8n provavelmente não vão rodar dentro dessa rede o tempo todo.
- Um job de sincronização (rodando numa máquina/servidor que tem acesso à VPN) replica periodicamente só os campos necessários (nome, data nascimento, área, gestor) para uma base separada, mais leve e sem dados sensíveis demais.
- Isso também evita expor a base de RH inteira para o painel e pro n8n — só replica o mínimo necessário.

Esse ponto é o mais crítico tecnicamente e o que mais vai definir prazo — ver seção 9.

## 9. Riscos, dependências e perguntas em aberto

1. **VPN + automação:** quem/o quê vai rodar o sync de dentro da rede com VPN? Precisa de uma máquina/servidor com acesso permanente, ou um job agendado que sobe a VPN, sincroniza e desce.
2. **Hierarquia (supervisor/C-level):** o banco de colaboradores tem campo de "gestor direto"? Se não tiver, é um levantamento manual/planilha à parte que vai precisar ser mantida.
3. **LGPD / dado sensível:** data de nascimento é dado pessoal. Definir quem pode acessar o painel (login obrigatório, sem exposição pública) e não expor isso em canais amplos.
4. **Número de WhatsApp:** já existe um número de DP e uma lista de C-level/supervisores mapeada para o Evolution API, ou isso precisa ser cadastrado?
5. **Regra dos R$100:** é sempre R$100 fixo pra todo mundo (corretor e administrativo)? Tem alguma condição (tempo de casa, etc.)?
6. **Lista de distribuição do e-mail semanal:** quem entra nela hoje, e como isso é mantido (manual ou automático por área)?

## 10. Critérios de aceite (MVP)

- [ ] Painel mostra corretamente aniversariantes do dia e da semana, batendo com o banco de colaboradores.
- [ ] E-mail semanal é disparado toda segunda-feira, sem falha, para a lista configurada.
- [ ] Mensagem de WhatsApp para o colaborador, DP, C-level e supervisor é disparada no dia certo, para o número certo.
- [ ] Acesso ao painel exige autenticação.
- [ ] Sync com o banco de colaboradores roda sem exigir intervenção manual diária.

## 11. Fases sugeridas

| Fase | Entrega |
|---|---|
| 0 | Validar perguntas da seção 9 (principalmente hierarquia e infra da VPN) |
| 1 | Job de sync do DB → base intermediária |
| 2 | Painel web (leitura) |
| 3 | E-mail semanal via n8n |
| 4 | WhatsApp via n8n + Evolution API |

