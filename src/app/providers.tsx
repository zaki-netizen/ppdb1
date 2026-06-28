'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/context/AuthContext';
import { RegistrationProvider } from '@/context/RegistrationContext';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <RegistrationProvider>
          {children}
        </RegistrationProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
