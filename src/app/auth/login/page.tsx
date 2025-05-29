'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { supabase } from '@/lib/supabase/supabaseClient';
import FormWrapper from '@/components/ui/FormWrapper';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/button';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 1. Login
      await signIn(formData.email, formData.password);

      // 2. Espera a que el usuario esté disponible
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw userError || new Error('No se encontró el usuario');

      // 3. Consultar si el usuario ya tiene tienda
      const { data: stores, error: storeError } = await supabase
        .from('stores')
        .select('store_id')
        .eq('user_id', user.id)
        .limit(1);

      if (storeError) throw storeError;

      if (stores && stores.length > 0) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    } catch (err: any) {
      setError(err?.message || 'Email o contraseña inválidos');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen sm:h-[100svh] flex items-center justify-center bg-gray-50 py-8 px-4">
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
          <h2 className="text-3xl font-bold text-center mt-2">Bienvenido de nuevo</h2>
          <p className="text-center text-gray-600 mb-4">Ingresa tus credenciales para acceder a tu cuenta</p>
        </div>
        <Input
          label="Email"
          type="email"
          placeholder="Ingresa tu email"
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="Ingresa tu contraseña"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
        >
          Iniciar sesión
        </Button>
        <p className="text-center text-sm text-gray-500 mb-2">
          <Link
            href="/auth/reset-password"
            className="font-medium text-gray-500 hover:text-blue-500"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </p>
        <p className="text-center text-sm text-gray-600">
          ¿No tienes una cuenta?{' '}
          <Link
            href="/auth/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Registrarse
          </Link>
        </p>
      </FormWrapper>
    </div>
  );
}
