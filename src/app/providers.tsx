'use client';

import { AuthProvider } from '@/context/AuthContext';
import { RegistrationProvider } from '@/context/RegistrationContext';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <RegistrationProvider>
        {children}
      </RegistrationProvider>
    </AuthProvider>
  );
}
