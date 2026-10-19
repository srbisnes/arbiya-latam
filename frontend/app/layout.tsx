import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ArbiYa | Arbitraje LATAM CriptoYa",
  description: "Experto en arbitrajes alimentado por CriptoYa API - Elcryptoboy",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-slate-950 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
