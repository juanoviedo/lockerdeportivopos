import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Deportes POS",
  description: "Punto de Venta para artículos deportivos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}
