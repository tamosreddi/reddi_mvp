"use client";

import { useAuth } from '../lib/hooks/useAuth';
import Image from 'next/image';

export default function SignInWithGoogle() {
  const auth = useAuth();

  // Handler temporal para Google Sign-In (no implementado en el contexto actual)
  const handleGoogleSignIn = () => {
    alert('Google Sign-In no está implementado en este proyecto.');
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      className="flex items-center justify-center bg-white text-gray-700 font-semibold py-2 px-4 rounded-full border border-gray-300 hover:bg-gray-100 transition duration-300 ease-in-out"
    >
      <Image 
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
        alt="Google logo" 
        width={24} 
        height={24} 
        className="mr-2" 
      />
      Sign in with Google
    </button>
  );
}
