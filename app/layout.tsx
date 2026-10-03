import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Conexão Jovem — Na Mesa",
  description: "O caminho até a mesa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}