# Pendências do Projeto - Aniversariantes

O projeto encerra-se no Módulo 3. 
Abaixo está a lista atualizada e definitiva de pendências técnicas para concluir o projeto:

## 1. Interface de Gestão de E-mails
Como o disparo de e-mails é a única notificação restante, precisamos decidir: a lista de distribuição (destinatários) será gerenciada de forma estática via variáveis de ambiente (`.env`), ou criaremos uma interface simples no Painel Web para gerenciar essa lista dinamicamente via banco de dados?
- [x] Decidir a abordagem (estática vs. dinâmica).
- [x] (Se dinâmica) Criar interface de gestão de e-mails no painel.

## 2. Deploy e Automação (Cron Jobs) na VPS
Todo o sistema (Frontend e Backend) deve ser publicado em um servidor, juntamente com a configuração dos agendadores de tarefas.
- [x] Preparar infraestrutura da VPS.
- [x] Realizar o deploy do Painel e da API.
- [x] Configurar o Cron Job para rodar o Sync de dados (DB -> Base local) diariamente.
- [x] Configurar o Cron Job para chamar o endpoint de disparo de e-mails (diário, semanal ou mensal).
