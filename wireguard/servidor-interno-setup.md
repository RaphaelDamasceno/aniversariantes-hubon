# Setup WireGuard — Servidor Interno (10.0.3.2)

> Este guia foi preparado pelo time de TI para configurar um túnel VPN WireGuard
> entre este servidor e a VPS da empresa (IP: `179.197.64.244`).
> O objetivo é permitir que a VPS acesse a DB-API que roda neste servidor,
> sem expor o banco de dados diretamente para a internet.

---

## O que será feito

- Instalar o WireGuard neste servidor
- Criar um túnel criptografado ponto-a-ponto com a VPS
- Este servidor **inicia** a conexão para fora (porta UDP 51820 → `179.197.64.244`)
- Nenhuma porta nova precisa ser aberta no firewall de entrada deste servidor

**IPs do túnel:**
| Máquina | IP real | IP no túnel |
|---------|---------|-------------|
| Este servidor | 10.0.3.2 | 10.8.0.2 |
| VPS | 179.197.64.244 | 10.8.0.1 |

---

## Informações necessárias antes de começar

Você precisa receber do responsável pela VPS:
- **Chave pública da VPS**: `wHDPozj7yBnCwBmC7nxk3klFBLlym521q16y6WYozS4=`

---

## Passo 1 — Instalar WireGuard

**Ubuntu/Debian:**
```bash
apt update && apt install -y wireguard
```

**CentOS/Rocky/AlmaLinux:**
```bash
dnf install -y epel-release
dnf install -y wireguard-tools
```

---

## Passo 2 — Gerar o par de chaves deste servidor

```bash
cd /etc/wireguard
wg genkey | tee servidor-private.key | wg pubkey > servidor-public.key
chmod 600 servidor-private.key
cat servidor-private.key   # → SERVIDOR_PRIVATE_KEY (use abaixo)
cat servidor-public.key    # → envie este valor de volta para o responsável pela VPS
```

---

## Passo 3 — Criar a config do WireGuard

Substitua:
- `SERVIDOR_PRIVATE_KEY` → valor gerado acima no arquivo `servidor-private.key`

```bash
cat > /etc/wireguard/wg0.conf << 'EOF'
[Interface]
Address = 10.8.0.2/24
PrivateKey = SERVIDOR_PRIVATE_KEY

[Peer]
PublicKey = wHDPozj7yBnCwBmC7nxk3klFBLlym521q16y6WYozS4=
Endpoint = 179.197.64.244:51820
AllowedIPs = 10.8.0.1/32
PersistentKeepalive = 25
EOF

chmod 600 /etc/wireguard/wg0.conf
```

> `PersistentKeepalive = 25` garante que o túnel se mantém ativo mesmo sem tráfego,
> e permite que a VPS inicie comunicação mesmo que este servidor esteja atrás de NAT.

---

## Passo 4 — Iniciar o WireGuard

```bash
systemctl enable wg-quick@wg0
systemctl start wg-quick@wg0
systemctl status wg-quick@wg0
```

---

## Passo 5 — Verificar o túnel

```bash
wg show          # deve mostrar o peer VPS com "latest handshake" recente
ping 10.8.0.1    # deve responder (VPS no túnel)
```

---

## Passo 6 — Confirmar que a DB-API está acessível pela VPS

A DB-API deve continuar escutando em `0.0.0.0` ou no IP do túnel (`10.8.0.2`).
Verifique:

```bash
ss -tlnp | grep 8000
```

Se mostrar `127.0.0.1:8000`, a API está restrita ao localhost e **não será acessível pelo túnel**.
Nesse caso, edite a config de execução da DB-API para escutar em `0.0.0.0:8000`:

```bash
# Exemplo para serviço systemd:
# Edite o ExecStart e troque --host 127.0.0.1 por --host 0.0.0.0
systemctl edit db-api  # ou edite o .service diretamente
systemctl restart db-api
```

---

## Resumo do que devolver para o responsável pela VPS

1. **Chave pública deste servidor:** `cat /etc/wireguard/servidor-public.key`
2. Confirmação de que o WireGuard está rodando (`systemctl status wg-quick@wg0`)
3. Confirmação do resultado de `ss -tlnp | grep 8000`
