# Setup WireGuard — VPS (179.197.64.244) - ETAPA FINAL

> Os passos 1 a 5 (instalação, geração de chaves, firewall e liberação de rede) já foram **concluídos com sucesso!**
> Para finalizar a conexão, execute apenas os comandos abaixo na sua VPS:

---

## Passo Único Restante — Inserir configuração final

Este bloco já contém a sua `PrivateKey` real e a `PublicKey` que o administrador do servidor interno nos enviou.
Copie e cole o bloco **inteiro** no terminal da VPS:

```bash
cat > /etc/wireguard/wg0.conf << 'EOF'
[Interface]
Address = 10.8.0.3/24
ListenPort = 51820
PrivateKey = YEn5Z/ZD/oi3bQm9Sma6RDggjqchoIBhMUVXgdH31m0=

[Peer]
PublicKey = Rg2vut9p1ol9wAYsGxBQC5uj7udNKXoHRYYjcTQhBXg=
AllowedIPs = 10.8.0.2/32, 10.0.3.0/24
EOF
```

---

## Teste e Validação

Agora, ative o túnel e verifique a conexão com o banco de dados interno:

```bash
systemctl enable wg-quick@wg0
systemctl restart wg-quick@wg0
wg show
```

Se o `wg show` exibir os dados do "peer" com um *latest handshake*, o túnel subiu.

Para a prova definitiva de que a VPS consegue acessar a API interna, rode o teste HTTP:

```bash
curl -s -o /dev/null -w "%{http_code}" http://10.0.3.2:8000/health
```

Se o terminal retornar apenas `200`, **a infraestrutura está 100% pronta.**
