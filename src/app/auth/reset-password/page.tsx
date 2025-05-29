'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/supabaseClient';
import FormWrapper from '@/components/ui/FormWrapper';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/button';
import Image from 'next/image';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) throw error;

      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Error al enviar el email de recuperación');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <FormWrapper
        title=""
        description=""
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col items-center mb-6">
          <Image
            src="/reddiapplogo.png"
            alt="Logo Reddi"
            width={140}
            height={140}
            priority
            unoptimized
            className="object-contain drop-shadow-md mb-2"
          />
          <h2 className="text-3xl font-bold text-center mt-2">Recuperar contraseña</h2>
          <p className="text-center text-gray-600 mb-4">
            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
          </p>
        </div>

        {success ? (
          <div className="text-center">
            <p className="text-green-600 mb-4">
              ¡Email enviado! Revisa tu bandeja de entrada para restablecer tu contraseña.
            </p>
            <Link
              href="/auth/login"
              className="text-blue-600 hover:text-blue-500"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <>
            <Input
              label="Email"
              type="email"
              placeholder="Ingresa tu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
            >
              Enviar enlace de recuperación
            </Button>
            <p className="text-center text-sm text-gray-500 mt-4">
              <Link
                href="/auth/login"
                className="font-medium text-gray-500 hover:text-blue-500"
              >
                Volver al inicio de sesión
              </Link>
            </p>
          </>
        )}
      </FormWrapper>
    </div>
  );
}