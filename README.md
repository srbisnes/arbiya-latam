# ArbiYa LATAM - Experto Omnichaín en Arbitrajes

**Inventado y construido por Elcryptoboy**  
Dashboard + Scanner de oportunidades de arbitraje alimentado en tiempo real por la API pública de [CriptoYa](https://criptoya.com/api).

## Problema & Solución

Los traders LATAM pierden spreads entre exchanges locales (Lemon, Belo, Ripio, Binance P2P, etc.) porque no hay una herramienta unificada que calcule el spread real después de fees y muestre el mejor camino de compra/venta.

**ArbiYa** resuelve esto:
- Escanea múltiples pares (USDT/ARS, BTC/ARS, USDT/BRL...) cada ciclo
- Detecta el mejor exchange para comprar (min ask) y vender (max bid)
- Estima profit neto
- Dashboard Next.js listo para producción
- Base para extensión omnichaín (LayerZero / Chainlink CCIP para settlement futuro)

## Arquitectura

```
┌─────────────────┐     ┌───────────────────┐     ┌─────────────────┐
│  CriptoYa API   │────▶│  ArbiYa Scanner  │────▶│  Next.js Frontend│
│  (CEX/P2P LATAM)│     │  (Python / Node) │     │  Live Board     │
└─────────────────┘     └───────────────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌───────────────────┐
                        │  Smart Contract  │
                        │  (Future DEX/CCIP│
                        │   Settlement)    │
                        └────────────────────┘
```

## Tech Stack

- **Data**: CriptoYa Public API (sin key)
- **Scanner**: Python 3 (urllib, zero deps)
- **Frontend**: Next.js 15 + TypeScript + Tailwind
- **Contracts**: Foundry (placeholder omnichaín)
- **Deploy**: Vercel

## Setup Local

### Scanner
```bash
cd scripts
python3 arb_scanner.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Variables de Entorno

Ver `.env.example`. No se requieren keys para el scanner básico.

## Seguridad

- Solo lectura de API pública
- Rate limiting respetado
- No se almacenan fondos ni keys en el scanner base
- Para ejecución real: simular siempre antes de operar

## Roadmap

- [ ] Integración fees exactas por exchange
- [ ] Cross-chain basis (USDT ARS vs USDT BRL via bridge)
- [ ] Alertas Telegram / Discord
- [ ] Auto-execute con flash loans + CCIP
- [ ] AI ranking de liquidez y riesgo

---

**Elcryptoboy** — Arquitecto Web3 Omnichaín
