#!/usr/bin/env python3
"""
ArbiYa Scanner - Experto en Arbitrajes alimentado por CriptoYa API
Detecta oportunidades de arbitraje entre exchanges LATAM en tiempo real.
"""

import json
import time
import urllib.request
import urllib.error
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime

BASE_URL = "https://criptoya.com/api"
MIN_PROFIT_PCT = 0.3  # % mínimo para considerar oportunidad
VOLUME = 1000  # volumen de referencia en fiat

# Pares prioritarios LATAM
PAIRS = [
    ("USDT", "ARS"),
    ("USDC", "ARS"),
    ("BTC", "ARS"),
    ("ETH", "ARS"),
    ("USDT", "BRL"),
    ("BTC", "BRL"),
    ("USDT", "CLP"),
    ("USDT", "COP"),
    ("USDT", "MXN"),
    ("DAI", "ARS"),
]

@dataclass
class Opportunity:
    pair: str
    buy_exchange: str
    sell_exchange: str
    buy_price: float
    sell_price: float
    spread_pct: float
    profit_pct_est: float
    volume: float
    timestamp: int

def fetch_json(url: str) -> Optional[Dict]:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "ArbiYa/1.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read().decode()
            if data.strip() == "Invalid pair":
                return None
            return json.loads(data)
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def get_all_prices(coin: str, fiat: str, vol: float = VOLUME) -> Dict[str, Any]:
    url = f"{BASE_URL}/{coin}/{fiat}/{vol}"
    return fetch_json(url) or {}

def get_fees() -> Dict:
    return fetch_json(f"{BASE_URL}/fees") or {}

def analyze_pair(coin: str, fiat: str) -> List[Opportunity]:
    prices = get_all_prices(coin, fiat)
    if not prices:
        return []

    opportunities = []

    # Buscar mejor ask (comprar barato) y mejor bid (vender caro)
    best_buy = None  # min totalAsk
    best_sell = None  # max totalBid

    for ex, data in prices.items():
        if not isinstance(data, dict):
            continue
        ask = data.get("totalAsk") or data.get("ask")
        bid = data.get("totalBid") or data.get("bid")
        if ask is None or bid is None or ask <= 0 or bid <= 0:
            continue

        if best_buy is None or ask < best_buy[1]:
            best_buy = (ex, ask)
        if best_sell is None or bid > best_sell[1]:
            best_sell = (ex, bid)

    if best_buy and best_sell and best_buy[0] != best_sell[0]:
        buy_ex, buy_price = best_buy
        sell_ex, sell_price = best_sell
        if sell_price > buy_price:
            spread = ((sell_price - buy_price) / buy_price) * 100
            # Estimación simple: restar ~0.5% fees promedio
            profit_est = max(0, spread - 0.5)
            if profit_est >= MIN_PROFIT_PCT:
                opportunities.append(Opportunity(
                    pair=f"{coin}/{fiat}",
                    buy_exchange=buy_ex,
                    sell_exchange=sell_ex,
                    buy_price=buy_price,
                    sell_price=sell_price,
                    spread_pct=round(spread, 3),
                    profit_pct_est=round(profit_est, 3),
                    volume=VOLUME,
                    timestamp=int(time.time())
                ))

    return opportunities

def scan_all() -> List[Opportunity]:
    all_opps = []
    print(f"[{datetime.now().isoformat()}] Escaneando {len(PAIRS)} pares...")
    for coin, fiat in PAIRS:
        opps = analyze_pair(coin, fiat)
        all_opps.extend(opps)
        time.sleep(0.4)  # rate limit friendly (~120/min)
    all_opps.sort(key=lambda o: o.profit_pct_est, reverse=True)
    return all_opps

def print_opportunities(opps: List[Opportunity]):
    if not opps:
        print("No se encontraron oportunidades por encima del umbral.")
        return
    print(f"\n{'='*80}")
    print(f"OPORTUNIDADES DE ARBITRAJE - {len(opps)} encontradas")
    print(f"{'='*80}")
    for i, o in enumerate(opps[:15], 1):
        print(f"{i:2}. {o.pair:12} | Compra en {o.buy_exchange:18} @ {o.buy_price:>12.2f}")
        print(f"    Vende en  {o.sell_exchange:18} @ {o.sell_price:>12.2f} | Spread {o.spread_pct:5.2f}% | Profit est. {o.profit_pct_est:5.2f}%")
        print()

def main():
    print("=== ArbiYa Scanner | Experto en Arbitrajes CriptoYa ===")
    print("Fuente: https://criptoya.com/api")
    opps = scan_all()
    print_opportunities(opps)
    # Guardar JSON
    with open("/tmp/arbiya_opps.json", "w") as f:
        json.dump([o.__dict__ for o in opps], f, indent=2)
    print(f"Resultados guardados en /tmp/arbiya_opps.json")

if __name__ == "__main__":
    main()
