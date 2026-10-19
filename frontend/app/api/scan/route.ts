import { NextResponse } from "next/server";

const BASE = "https://criptoya.com/api";
const PAIRS = [
  ["USDT", "ARS"],
  ["USDC", "ARS"],
  ["BTC", "ARS"],
  ["ETH", "ARS"],
  ["USDT", "BRL"],
  ["BTC", "BRL"],
  ["USDT", "CLP"],
  ["USDT", "MXN"],
  ["DAI", "ARS"],
];

async function fetchPrices(coin: string, fiat: string) {
  try {
    const res = await fetch(`${BASE}/${coin}/${fiat}/1000`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    const text = await res.text();
    if (text.includes("Invalid")) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function GET() {
  const opportunities: any[] = [];

  for (const [coin, fiat] of PAIRS) {
    const prices = await fetchPrices(coin, fiat);
    if (!prices) continue;

    let bestBuy: [string, number] | null = null;
    let bestSell: [string, number] | null = null;

    for (const [ex, data] of Object.entries(prices) as any) {
      const ask = data.totalAsk ?? data.ask;
      const bid = data.totalBid ?? data.bid;
      if (!ask || !bid || ask <= 0 || bid <= 0) continue;

      if (!bestBuy || ask < bestBuy[1]) bestBuy = [ex, ask];
      if (!bestSell || bid > bestSell[1]) bestSell = [ex, bid];
    }

    if (bestBuy && bestSell && bestBuy[0] !== bestSell[0] && bestSell[1] > bestBuy[1]) {
      const spread = ((bestSell[1] - bestBuy[1]) / bestBuy[1]) * 100;
      const profit = Math.max(0, spread - 0.5);
      if (profit >= 0.3) {
        opportunities.push({
          pair: `${coin}/${fiat}`,
          buy_exchange: bestBuy[0],
          sell_exchange: bestSell[0],
          buy_price: bestBuy[1],
          sell_price: bestSell[1],
          spread_pct: +spread.toFixed(3),
          profit_pct_est: +profit.toFixed(3),
        });
      }
    }
  }

  opportunities.sort((a, b) => b.profit_pct_est - a.profit_pct_est);

  return NextResponse.json({ opportunities, count: opportunities.length, ts: Date.now() });
}
