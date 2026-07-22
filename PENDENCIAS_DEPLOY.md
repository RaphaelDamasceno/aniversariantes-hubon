# Pendências de Deploy - MVP Finalizado

Todo o escopo de código do projeto (Fase 1 / Módulo 1 ao 3) está concluído, auditado e enviado para o GitHub. A Fase 2 foi formalmente cancelada do escopo.

Para colocar o sistema definitivamente no ar, restam apenas os passos operacionais abaixo na infraestrutura:

## 1. Acesso à VPS
- [ ] Recuperar a senha de `root` da VPS (Hostinger) para prosseguir com o deploy.

## 2. Configuração de Domínio e Subdiretório
- [ ] **DNS:** Criar o Apontamento A no painel da Hostinger para a VPS.
- [x] **Next.js:** Fazer a configuração do `basePath: '/aniversariantes'` no projeto Next.js e atualizar os links do front (para que o painel funcione no link `hubon.tech/aniversariantes`).
- [ ] **Nginx (Proxy Reverso):** Instalar e configurar o Nginx na VPS criando um bloco `location /aniversariantes` que aponte para a porta 3000 do PM2.
- [ ] **HTTPS:** Rodar o Certbot para aplicar certificado SSL no domínio principal.

## 3. Credenciais e Variáveis de Ambiente
- [ ] Criar o arquivo `.env` definitivo no servidor.
- [ ] Preencher as credenciais de SMTP do provedor de e-mail que você já utiliza atualmente.
- [ ] Definir a senha do Painel Web (`ADMIN_USER` e `ADMIN_PASS`) e a chave secreta dos Crons (`CRON_SECRET`).

## 4. Deploy e Automação Final
- [ ] Fazer o `git pull` do repositório no servidor.
- [ ] Iniciar a aplicação utilizando PM2 (`pm2 start ecosystem.config.js`).
- [ ] Configurar o Agendador de Tarefas do Sistema Operacional (Crontab/Windows Task Scheduler) para chamar o arquivo `trigger-cron.js` que dispara os e-mails e o sincronismo.
- [ ] Validar a conexão da VPN da máquina com o banco de RH para permitir o Sync.

---
**Status do Projeto:** Aguardando liberação de acesso (Root VPS) para execução.
