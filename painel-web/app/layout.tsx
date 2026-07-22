import type { Metadata } from 'next';
import { Outfit, Inter } from 'next/font/google';
import './globals.css';
import Sidebar from './components/Sidebar';
import MobileHeader from './components/MobileHeader';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Aniversariantes Hub | Hubon',
  description: 'Painel centralizado de aniversariantes — celebre os momentos especiais da equipe Hubon.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${outfit.variable} ${inter.variable}`}>
        <Sidebar />
        <MobileHeader />
        {children}
      </body>
    </html>
  );
}
