'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/supabaseClient';
import FormWrapper from '@/components/ui/FormWrapper';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/button';
import Image from 'next/image';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  // Verificar si el usuario tiene una sesión válida
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Sesión actual:', session);
      if (!session) {
        setError('Tu sesión de recuperación no es válida o ha expirado. Solicita un nuevo enlace.');
        // Opcional: redirige después de mostrar el error
        // setTimeout(() => router.push('/auth/login'), 3000);
      }
    };
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    // Validar longitud mínima de contraseña
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Tu sesión de recuperación no es válida o ha expirado. Solicita un nuevo enlace.');
        setIsLoading(false);
        return;
      }
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (error) throw error;

      setSuccess(true);
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 3000);
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar la contraseña');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen sm:h-[100svh] flex items-center justify-center bg-gray-50 py-2 sm:py-8 px-4">
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
          <h2 className="text-3xl font-bold text-center mt-2">Actualizar contraseña</h2>
          <p className="text-center text-gray-600 mb-4">
            Ingresa tu nueva contraseña
          </p>
        </div>

        {success ? (
          <div className="text-center">
            <p className="text-green-600 mb-4">
              ¡Contraseña actualizada con éxito! Serás redirigido al inicio de sesión.
            </p>
          </div>
        ) : (
          <>
            <Input
              label="Nueva contraseña"
              type="password"
              placeholder="Ingresa tu nueva contraseña"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
            <Input
              label="Confirmar contraseña"
              type="password"
              placeholder="Confirma tu nueva contraseña"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              required
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
            >
              Actualizar contraseña
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