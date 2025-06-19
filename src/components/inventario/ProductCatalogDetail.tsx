// este es el MODAL que muestra info del produto en inventario en seccion "productots"

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/supabaseClient';

interface ProductCatalogDetailProps {
  productId: string;
  onClose?: () => void;
}

export default function ProductCatalogDetail({ productId, onClose }: ProductCatalogDetailProps) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('products')
        .select('name, description, image, category')
        .eq('product_id', productId)
        .single();
      if (error || !data) {
        setError('No se pudo cargar el producto');
        setProduct(null);
      } else {
        setProduct(data);
      }
      setLoading(false);
    };
    if (productId) fetchProduct();
  }, [productId]);

  if (loading) return <div className="p-8 text-center">Cargando producto...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!product) return null;

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6 flex flex-col items-center">
      <div className="w-32 h-32 mb-4 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
        <Image
          src={product.image || "/Groserybasket.png"}
          alt={product.name}
          width={128}
          height={128}
          className="object-cover w-full h-full"
        />
      </div>
      <h2 className="text-xl font-bold mb-2 text-center">{product.name}</h2>
      <p className="text-gray-600 mb-2 text-center">{product.category}</p>
      <p className="text-gray-700 text-center mb-4">{product.description || 'Sin descripción.'}</p>
      {onClose && (
        <button
          className="mt-2 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
          onClick={onClose}
        >
          Cerrar
        </button>
      )}
    </div>
  );
} 