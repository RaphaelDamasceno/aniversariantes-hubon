import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['300', '400', '500', '600', '700']
});

export const metadata: Metadata = {
  title: 'Aniversariantes Hub',
  description: 'Painel de aniversariantes da empresa',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${outfit.variable} font-sans`}>
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        {children}
      </body>
    </html>
  );
}
