# WireGuard — Setup Completo

Dois arquivos nesta pasta:
- `VPS-setup.md` → você executa via SSH na VPS (`179.197.64.244`)
- `servidor-interno-setup.md` → passa para o admin do servidor `10.0.3.2`

**Topologia:**
```
Servidor interno (10.0.3.2)  ──── túnel WireGuard ────  VPS (179.197.64.244)
   WG IP: 10.8.0.2                                         WG IP: 10.8.0.1
   (inicia a conexão p/ fora)                              (escuta na porta 51820)
```

Depois que o túnel estiver de pé, a VPS consegue chamar `http://10.8.0.2:8000` (o DB-API)
e o Módulo 1 pode ser desenvolvido normalmente.
