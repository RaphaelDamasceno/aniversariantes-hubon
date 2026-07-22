# TO-DO List: Status do Projeto Aniversariantes

## Status do Desenvolvimento: 100% Finalizado 🚀
Todos os módulos da Fase 1 foram concluídos com sucesso:
- **Módulo 1:** Sync DB → Base intermediária (Completo)
- **Módulo 2:** API + Painel Web (Completo)
- **Módulo 3:** E-mail de Aniversariantes (Backend Interno) (Completo)


---

## Pendências Restantes: Deploy e Infraestrutura (A Fazer)

A única etapa restante agora é a preparação do ambiente de produção e o deploy da aplicação.

- [ ] **Decisão e Implementação da Interface de Gestão de E-mails:**
  - Decidir se a lista de destinatários será estática (via `.env`) ou gerenciada dinamicamente via painel e banco de dados.

- [ ] **Deploy e Automação (VPS):**
  - Preparar a infraestrutura da VPS (Node, PM2, Nginx, etc.).
  - Realizar o deploy do Backend (API).
  - Realizar o deploy do Frontend (Painel Web).
  - Configurar Cron Jobs no servidor:
    - Sincronização de dados (DB → Base local) rodando diariamente.
    - Disparo de e-mails (diário, semanal ou mensal) chamando o respectivo endpoint.
