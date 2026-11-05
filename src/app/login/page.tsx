'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { VIPAuthModal } from '@/components/auth/VIPAuthModal';
import { AuthResponse } from '@/app/actions/authActions';

export default function LoginPage() {
  const router = useRouter();

  const handleAuthSuccess = (user: NonNullable<AuthResponse['user']>) => {
    router.push('/');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-radial from-[#131b2c] via-[#090d16] to-[#04060a] p-4">
      <VIPAuthModal
        isOpen={true}
        isMandatory={true}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}

