import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bingo Prestige | Club de Bingo Online • 75 Bolas',
  description:
    'Experiencia de Bingo 75 bolas de máximo nivel. Audio nítido, tómbola 3D interactiva, seguridad estricta y plataforma de entretenimiento móvil y escritorio.',
  keywords: ['Bingo Prestige', 'Bingo Online', 'Bingo 75 Bolas', 'Juego de Bingo Online', 'Entretenimiento VIP'],
  authors: [{ name: 'Prestige Gaming International' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#06080d',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark bg-[#06080d]">
      <body className="min-h-screen bg-[#06080d] text-slate-100 antialiased selection:bg-amber-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
