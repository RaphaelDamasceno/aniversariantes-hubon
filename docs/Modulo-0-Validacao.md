# Módulo 0 — Validação e Preparação

Status: em andamento
Fonte analisada: `corpstek_corretores_202607211130.csv` (4.439 registros, 94 colunas)

---

## 1. Decisões já confirmadas por você

| Item | Definição |
|---|---|
| Valor do benefício | R$ 100,00 |
| Elegibilidade | Apenas **funcionários** (não corretores) |
| E-mail semanal — destinatários (fase 1) | `dp@hubnogueira.com.br`, `raphaelferreira@hubnogueira.com.br` |
| E-mail — gestão dos destinatários | Precisa de **interface na aplicação** para adicionar/remover (não pode ficar hardcoded) |
| Infraestrutura | **Não vai ser local.** Sai do esquema "roda no seu PC" e vai para uma **VPS na Hostinger** |

---

## 2. Impacto da mudança de infraestrutura (local → VPS)

Isso muda o desenho do Módulo 1 que estava no PRD original. Antes a ideia era um job rodando numa máquina já dentro da rede com VPN. Agora:

- A aplicação (sync, API, painel, workflows) roda na **VPS Hostinger**.
- A VPS precisa conseguir alcançar o banco de colaboradores, que só é acessível via VPN.
- Isso só funciona se a VPS conseguir **se conectar como cliente da VPN** (rodando o cliente VPN direto na VPS) ou se existir uma forma de **liberar o IP da VPS** no servidor da VPN/firewall.

**Preciso que você confirme para seguir com o Módulo 1:**
- [ ] Qual o tipo de VPN usada hoje (OpenVPN, WireGuard, VPN de fabricante tipo FortiClient/Cisco AnyConnect, etc.)?
- [ ] Existe um arquivo de configuração de cliente (`.ovpn`, `.conf`) que possa ser instalado na VPS, ou é uma VPN atrelada a usuário/dispositivo autorizado manualmente?
- [ ] A VPS Hostinger que você tem é uma VPS comum (Ubuntu/Debian, acesso root via SSH)? Se sim, dá pra instalar cliente VPN nela normalmente — só precisamos da config de acesso.

> Se a VPN for do tipo "aprova dispositivo manualmente", pode ser necessário pedir liberação do IP da VPS para quem administra a VPN — vale já avisar essa pessoa em paralelo.

---

## 3. Mapeamento dos dados do CSV (para o Módulo 1 — sync)

Campos relevantes identificados na tabela de origem, para replicar na base intermediária:

| Campo no CSV | Uso no projeto |
|---|---|
| `id_corretor` | Identificador único do colaborador |
| `nome` | Nome completo |
| `datanascimento` | Base do cálculo de aniversariante |
| `cargo_principal` | Exibição no painel / critério de elegibilidade |
| `administrativo_ativo` | Candidato a critério de "é funcionário" (ver seção 4) |
| `email` / `email_contato` | Contato, se necessário futuramente |
| `id_corret_gerente` | Vínculo com o gestor direto (ver seção 5 — hierarquia) |
| `data_exclusao` | Indica se o colaborador foi desligado (ver alerta na seção 6) |

---

## 4. Critério de elegibilidade "funcionário" — precisa da sua confirmação

O CSV **não tem um campo único e claro "é funcionário CLT"**. O mais próximo é `administrativo_ativo` (marcado como `1` em 159 registros), que cobre majoritariamente cargos como Auxiliar Administrativo, Recepcionista, Analista de Marketing, Assistente Administrativo, RH, TI, Financeiro etc. — o perfil que bate com "funcionário administrativo", diferente de corretor autônomo.

Porém, esse mesmo campo também aparece marcado em **2 Superintendentes e 1 Diretor** — o que pode ser certo (diretor que também é considerado quadro administrativo) ou pode ser exceção que não deveria contar.

**Pergunta:** o critério "é funcionário" para o benefício = `administrativo_ativo = 1`? Ou existe outra régua (ex: tipo de contrato, algo que não está nesse CSV)?

> Achado extra: as colunas `administrativo_ativo` e `administrador_ativo` (mais para o início da tabela) têm **exatamente os mesmos valores, linha a linha** — parecem ser a mesma informação duplicada. Vale perguntar pra quem administra o banco se isso é esperado ou é um bug de schema (podem ter sido pensadas pra coisas diferentes e nunca preenchidas corretamente).

---

## 5. Hierarquia (supervisor / C-level)

**Boa notícia:** a tabela já tem o vínculo de gestor via `id_corret_gerente` (preenchido em 4.028 dos 4.439 registros) — isso resolve a dúvida do PRD sobre existir hierarquia.

**Porém:** os campos de nome do gestor (`nome_gerente`, `nome_coordenador`, `nome_mentoring`) estão **100% vazios** no CSV, mesmo com os IDs preenchidos. Ou seja: o sync vai precisar **buscar o nome do gestor fazendo join** de `id_corret_gerente` com o `id_corretor` de outro registro — não dá pra confiar nesses campos de texto.

---

## 6. Problemas de qualidade de dados encontrados (recomendo corrigir na origem)

| Problema | Detalhe | Impacto |
|---|---|---|
| `data_exclusao` com data-sentinela | 889 registros têm `1970-01-01 00:00:01.000` em vez de campo vazio, para indicar "não desligado" | O sync precisa tratar essa data como "ativo", não como um desligamento real em 1970 — mas seria mais limpo esse campo vir `NULL` |
| `datanascimento` ausente | 57 colaboradores sem data de nascimento | Esses colaboradores nunca vão aparecer no painel de aniversariantes — confirmar se é aceitável ou se dá pra completar |
| Colunas duplicadas | `administrativo_ativo` e `administrador_ativo` idênticas | Ver seção 4 — confirmar com quem mantém o banco |

---

## 7. Interface para gerenciar destinatários de e-mail

Isso passa a ser um pequeno módulo próprio dentro do painel (Módulo 2), não é só configuração de arquivo:

**Critérios de aceitação:**
- [ ] Tela dentro do painel para listar, adicionar e remover e-mails da lista de distribuição do resumo semanal.
- [ ] Lista inicial já vem populada com `dp@hubnogueira.com.br` e `raphaelferreira@hubnogueira.com.br`.
- [ ] O workflow de e-mail semanal (n8n) consulta essa lista via API em vez de ter os e-mails fixos no workflow.
- [ ] Alteração na lista reflete no próximo disparo, sem precisar mexer no n8n.

---

## 8. Resumo do que ainda falta sua confirmação antes de eu seguir pro Módulo 1

- [ ] Tipo de VPN e forma de a VPS acessá-la (seção 2)
- [ ] Critério final de "é funcionário" para o benefício (seção 4)
- [ ] Se a duplicidade `administrativo_ativo` / `administrador_ativo` é esperada (seção 4)
- [ ] Aceitável os 57 colaboradores sem data de nascimento ficarem de fora? (seção 6)
