'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { supabase } from '@/lib/supabase/supabaseClient';
import FormWrapper from '@/components/ui/FormWrapper';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/button';

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
      if (userError || !user) throw userError || new Error('No user found');

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
      setError(err?.message || 'Invalid email or password');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <FormWrapper
        title="Welcome back"
        description="Enter your credentials to access your account"
        onSubmit={handleSubmit}
      >
        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
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
          Sign in
        </Button>
        <p className="text-center text-sm text-gray-600">
          ¿No tienes una cuenta?{' '}
          <Link
            href="/auth/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign up
          </Link>
        </p>
      </FormWrapper>
    </div>
  );
}
