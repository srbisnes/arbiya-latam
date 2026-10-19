"use client";

import { useEffect, useState } from "react";

type Opp = {
  pair: string;
  buy_exchange: string;
  sell_exchange: string;
  buy_price: number;
  sell_price: number;
  spread_pct: number;
  profit_pct_est: number;
};

export default function Home() {
  const [opps, setOpps] = useState<Opp[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const scan = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/scan");
      const data = await res.json();
      setOpps(data.opportunities || []);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scan();
    const id = setInterval(scan, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="max-w-6xl mx-auto p-6">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            ArbiYa
          </h1>
          <p className="text-slate-400">Experto en Arbitrajes · Powered by CriptoYa · Elcryptoboy</p>
        </div>
        <button
          onClick={scan}
          disabled={loading}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? "Escaneando..." : "Escanear ahora"}
        </button>
      </header>

      <p className="text-sm text-slate-500 mb-4">
        Última actualización: {lastUpdate || "—"} · Umbral mínimo 0.3%
      </p>

      {opps.length === 0 && !loading && (
        <div className="text-center py-20 text-slate-500">
          No hay oportunidades por encima del umbral en este momento.
        </div>
      )}

      <div className="grid gap-4">
        {opps.map((o, i) => (
          <div
            key={i}
            className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div>
              <span className="text-2xl font-semibold">{o.pair}</span>
              <div className="text-sm text-slate-400 mt-1">
                Compra en <span className="text-emerald-400 font-medium">{o.buy_exchange}</span> @{" "}
                <span className="font-mono">{o.buy_price.toFixed(2)}</span>
              </div>
              <div className="text-sm text-slate-400">
                Vende en <span className="text-rose-400 font-medium">{o.sell_exchange}</span> @{" "}
                <span className="font-mono">{o.sell_price.toFixed(2)}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-emerald-400">
                +{o.profit_pct_est.toFixed(2)}%
              </div>
              <div className="text-xs text-slate-500">Spread bruto {o.spread_pct.toFixed(2)}%</div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
