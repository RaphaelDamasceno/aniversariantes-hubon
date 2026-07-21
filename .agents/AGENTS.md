# Regras gerais do projeto Aniversariantes

Este projeto lê dados de um banco de colaboradores acessível somente via VPN.
Nunca hardcode credenciais, hosts ou tokens — sempre usar variáveis de ambiente (.env),
e criar um .env.example com os nomes das variáveis (sem valores reais).
O painel é somente leitura (read-only) — não implementar edição de colaboradores.
Dados de aniversário/data de nascimento são dados pessoais (LGPD) — nunca expor
endpoints sem autenticação, nunca logar esses dados em texto plano em logs persistentes.
Sempre gerar testes básicos para regras de data (aniversariantes do dia/semana),
incluindo casos de borda: virada de mês, virada de ano, 29 de fevereiro.
Referência de negócio completa: docs/PRD.md
