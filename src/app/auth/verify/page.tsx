'use client';

import Link from 'next/link';

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">¡Revisa tu correo!</h1>
        <p className="mb-4">
          Te hemos enviado un correo de confirmación. Por favor, haz clic en el enlace para activar tu cuenta.
        </p>
        <p className="mb-4">
          Una vez confirmada, <b>inicia sesión</b> para continuar con tu registro y completar tu información.
        </p>
        <Link href="/auth/login" className="text-blue-600 hover:underline">
          Ir a iniciar sesión
        </Link>
      </div>
    </div>
  );
}