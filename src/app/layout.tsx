import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Montesino Gestionale",
  description: "Sistema gestionale integrato per advisory M&A — Montesino SpA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
