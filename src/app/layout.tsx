// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Reddi – Administra tu Negocio',
  description: 'Aplicación para la gestión de micronegocios y tiendas de abarrotes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="font-sans bg-gray-50 min-h-screen">
        <AuthProvider>
          <main className="relative">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
