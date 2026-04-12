import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Deportes POS",
  description: "Punto de Venta para artículos deportivos",
  viewport: "width=device-width, initial-scale=1",
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
