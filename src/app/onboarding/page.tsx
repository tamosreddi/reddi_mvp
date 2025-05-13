'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import FormWrapper from '@/components/ui/FormWrapper';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase/supabaseClient';

const categories = [
  'Abarrotes',
  'Papeleria',
  'Ferreteria',
  'Restaurante',
  'Otro',
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    owner_name: '',
    owner_lastname: '',
    store_name: '',
    store_category: categories[0],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirige si el usuario ya tiene tienda
  useEffect(() => {
    const checkStore = async () => {
      if (user?.id) {
        const { data, error } = await supabase
          .from('stores')
          .select('store_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (data && data.store_id) {
          router.push('/dashboard');
        }
      }
    };
    checkStore();
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 1. Actualiza el nombre y apellido del usuario en la tabla "user"
      const { error: userError } = await supabase
        .from('user')
        .update({ 
          name: formData.owner_name,
          last_name: formData.owner_lastname
        })
        .eq('user_id', user?.id);

      if (userError) throw userError;

      // 2. Inserta la tienda en la tabla "stores"
      const { error: storeError } = await supabase
        .from('stores')
        .insert([
          {
            user_id: user?.id,
            store_name: formData.store_name,
            store_category: formData.store_category,
          }
        ]);

      if (storeError) throw storeError;

      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Error saving info');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Si el usuario no está autenticado, no muestres el formulario
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-600">
          Debes iniciar sesión para completar tu información.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <FormWrapper
        title="¡Bienvenido a Reddi!"
        description="Cuéntanos sobre ti y sobre tu tienda para continuar."
        onSubmit={handleSubmit}
      >
        <Input
          label="Nombre"
          placeholder="Ejemplo: Juan"
          value={formData.owner_name}
          onChange={e => setFormData({ ...formData, owner_name: e.target.value })}
          required
        />
        <Input
          label="Apellido"
          placeholder="Ejemplo: Pérez"
          value={formData.owner_lastname}
          onChange={e => setFormData({ ...formData, owner_lastname: e.target.value })}
          required
        />
        <Input
          label="Nombre de la tienda"
          placeholder="Ejemplo: Super Abarrotes Don Pepe"
          value={formData.store_name}
          onChange={e => setFormData({ ...formData, store_name: e.target.value })}
          required
        />
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Categoría</label>
          <select
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.store_category}
            onChange={e => setFormData({ ...formData, store_category: e.target.value })}
            required
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" fullWidth isLoading={isLoading}>
          Guardar y continuar
        </Button>
      </FormWrapper>
    </div>
  );
} 