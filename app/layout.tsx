import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daily Tracker - Seguimiento de Hábitos",
  description: "Aplicación moderna para el seguimiento de hábitos diarios, semanales y mensuales",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

