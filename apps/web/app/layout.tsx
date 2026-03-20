import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { APP_NAME } from '@plantao/shared';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: APP_NAME,
  description: 'Plataforma para encontrar e gerenciar plantões médicos em hospitais de todo o Brasil',
  keywords: ['plantão médico', 'plantões', 'hospitais', 'vagas médicas', 'turnos médicos'],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <footer className="border-t border-gray-200 bg-white py-4 mt-auto">
          <div className="container mx-auto px-6 text-center text-xs text-gray-500">
            <a href="/privacidade" className="hover:text-gray-700 hover:underline">
              Politica de Privacidade
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
