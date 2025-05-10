'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import Button from '@/components/ui/Button';

export default function DashboardPage() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to your Dashboard
          </h1>
          <p className="text-gray-600 mb-4">
            You are signed in as: {user?.email}
          </p>
          <Button
            variant="outline"
            onClick={() => signOut()}
          >
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
} 