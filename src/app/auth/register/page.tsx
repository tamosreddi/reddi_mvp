'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/supabaseClient';
import FormWrapper from '@/components/ui/FormWrapper';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/button';
import Image from 'next/image';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoadingForm(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoadingForm(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });
      if (error) throw error;

      // (Opcional) Guarda el user id en localStorage para el onboarding
      const userId = data.user?.id;
      if (userId) {
        localStorage.setItem('onboarding_user_id', userId);
      }
      // Redirige a la página de verificación
      router.push('/auth/verify');
    } catch (err: any) {
      setError(err?.message || 'Failed to create account');
      console.error(err);
    } finally {
      setIsLoadingForm(false);
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
          <h2 className="text-3xl font-bold text-center mt-2">Crear una cuenta</h2>
          <p className="text-center text-gray-600 mb-4">Ingresa tus datos para crear tu cuenta</p>
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
          label="Contraseña"
          type="password"
          placeholder="Crea una contraseña"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
        />
        <Input
          label="Confirmar contraseña"
          type="password"
          placeholder="Confirma tu contraseña"
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
          isLoading={isLoadingForm}
        >
          Crear cuenta
        </Button>
        <p className="text-center text-sm text-gray-600">
          ¿Ya tienes una cuenta?{' '}
          <Link
            href="/auth/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Inicia sesión
          </Link>
        </p>
      </FormWrapper>
    </div>
  );
}
