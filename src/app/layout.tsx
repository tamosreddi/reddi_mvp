// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter, Merriweather } from 'next/font/google';
import { AuthProvider } from '@/lib/contexts/AuthContext';
import { DemoProvider } from '@/lib/contexts/DemoContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });
const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['400', '700'], // O los pesos que necesites
  variable: '--font-merriweather',
});

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
    <html lang="es" className={`${merriweather.variable}`}>
      <body className="font-sans bg-reddi-background min-h-screen"> {/* bg-gray-50 es el color de fondo de la página */}
        <DemoProvider>
          <AuthProvider>
            <main className="relative">
              {children}
            </main>
          </AuthProvider>
        </DemoProvider>
      </body>
    </html>
  );
}
