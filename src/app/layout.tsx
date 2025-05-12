import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import BottomNavigation from "@/components/shared/bottom-navigation";
import { AuthProvider } from '@/lib/contexts/AuthContext';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Mi Tiendita - Gestión de Negocios',
  description: 'Aplicación para la gestión de micronegocios y tiendas de abarrotes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <AuthProvider>
          <main className="relative">
            {children}
            <BottomNavigation />
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
