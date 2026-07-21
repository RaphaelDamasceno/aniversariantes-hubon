# Documentação de Infraestrutura e Conectividade (Módulo 0)

Este documento registra como foi configurada a infraestrutura de rede para que a aplicação na VPS Hostinger consiga se comunicar com o banco de dados interno da empresa, além de servir como guia de "troubleshooting" (solução de problemas) para o futuro.

## 1. Visão Geral da Arquitetura

O banco de dados (MariaDB) fica em uma rede privada inacessível pela internet. Para permitir que a VPS (onde roda nossa aplicação) leia os dados de forma segura, adotamos a seguinte topologia:

```text
[VPS Hostinger]  <==== Túnel WireGuard ====>  [Servidor Interno]  <---->  [Banco de Dados]
 IP Pub: 179.197.64.244                        IP Priv: 10.0.3.2
 IP WG:  10.8.0.3                              IP WG:   10.8.0.2
```

- **WireGuard (WG):** Escolhido por ser leve e rodar via UDP. A VPS atua como o servidor/gateway da VPN, enquanto o servidor interno atua como cliente (inicia a conexão).
- **DB-API:** Em vez de expor o MariaDB cru no túnel, o servidor interno roda um proxy REST (DB-API) na porta `8000`. A VPS consome os dados via HTTP (`http://10.0.3.2:8000`).

## 2. Configurações Finais (WireGuard)

As configurações ficam no arquivo `/etc/wireguard/wg0.conf` em ambas as máquinas.

### Na VPS (Hostinger)
```ini
[Interface]
Address = 10.8.0.3/24
ListenPort = 51820
PrivateKey = (mantida no servidor)

[Peer]
PublicKey = Rg2vut9p1ol9wAYsGxBQC5uj7udNKXoHRYYjcTQhBXg=
AllowedIPs = 10.8.0.2/32, 10.0.3.0/24
```
*Nota: O `AllowedIPs = 10.0.3.0/24` diz à VPS que qualquer tráfego para a rede interna `10.0.3.x` deve ser empurrado para dentro do túnel.*

### No Servidor Interno
```ini
[Interface]
Address = 10.8.0.2/24
PrivateKey = (mantida no servidor)

[Peer]
PublicKey = wHDPozj7yBnCwBmC7nxk3klFBLlym521q16y6WYozS4=
Endpoint = 179.197.64.244:51820
AllowedIPs = 10.8.0.3/32
PersistentKeepalive = 25
```
*Nota: O `PersistentKeepalive` é obrigatório para evitar que o NAT feche a conexão por inatividade, garantindo que a VPS saiba sempre a rota de volta para o servidor interno.*

---

## 3. Comandos Úteis no Dia a Dia

Se a conexão cair, use estes comandos para diagnóstico (como usuário `root`):

- **Ver o status do túnel:** `wg show` (deve mostrar "latest handshake" se a conexão estiver viva).
- **Reiniciar o serviço:** `systemctl restart wg-quick@wg0`
- **Testar conectividade (da VPS):** `curl -s -o /dev/null -w "%{http_code}" http://10.0.3.2:8000/health` (O esperado é retornar `200`).

---

## 4. Histórico de Problemas (Troubleshooting)

Durante o setup inicial, esbarramos em 3 problemas clássicos. Se o túnel parar de funcionar no futuro, cheque estas opções na ordem:

### Problema 1: VPS não consegue alcançar o servidor interno (Timeouts / 000)
- **Causa Comum:** O painel externo da Hostinger (hPanel) possui um firewall próprio que sobrepõe o `ufw` do Linux.
- **Solução:** Entrar no painel da Hostinger > Firewall e garantir que existe uma regra permitindo **Inbound**, protocolo **UDP**, porta **51820**.

### Problema 2: Servidor interno pinga a VPS e dá 100% Packet Loss
- **Causa Comum:** Firewall ativo dentro da VM interna cortando tráfego de saída na porta 51820 UDP, ou cortando a interface virtual `wg0`.
- **Solução:** Liberar explicitamente a interface `wg0` e tráfego na porta 51820 UDP no firewall local da VM interna.

### Problema 3: "Required key not available" ao tentar dar ping
- **Causa Comum:** O arquivo `wg0.conf` está apontando para um IP que não foi declarado no campo `AllowedIPs` do `[Peer]`.
- **Solução:** O IP que você tenta pingar obrigatoriamente precisa fazer parte do bloco `AllowedIPs` da máquina que disparou o ping.

### Problema 4: A VPS não "lembra" a rota do Servidor Interno
- **Causa Comum:** Como o servidor interno está numa rede privada, a VPS só conhece a rota após receber o primeiro pacote.
- **Solução:** O servidor interno deve sempre manter o `PersistentKeepalive = 25`. Se mesmo assim falhar, basta dar um `ping 10.8.0.3` a partir do servidor interno para "acordar" o túnel e a VPS registrar o IP.

---
*Documento gerado após a conclusão e homologação da infraestrutura (Módulo 0).*
