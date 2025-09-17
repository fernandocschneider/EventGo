import { Inter } from 'next/font/google';
import { ApolloProviderWrapper } from '@/components/providers/apollo-provider';
import { Header } from '@/components/layout/header';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'GroupTravel - Organize viagens em grupo',
  description: 'Plataforma para organizar viagens em grupo para eventos, festivais e shows.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <ApolloProviderWrapper>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main>{children}</main>
          </div>
        </ApolloProviderWrapper>
      </body>
    </html>
  );
}