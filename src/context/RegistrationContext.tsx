'use client';

import { createContext, useContext, ReactNode, useState, useCallback } from 'react';

export interface Registration {
  id: string;
  registrationNumber: string;
  nisn: string;
  status: 'incomplete' | 'submitted' | 'verified' | 'rejected';
  selectionStatus: 'pending' | 'accepted' | 'rejected' | 'waitlist';
  currentRank?: number;
  totalScore?: number;
}

interface RegistrationContextType {
  registrations: Registration[];
  currentRegistration: Registration | null;
  setCurrentRegistration: (reg: Registration | null) => void;
  addRegistration: (reg: Registration) => void;
  updateRegistration: (id: string, updates: Partial<Registration>) => void;
  clearRegistrations: () => void;
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(
  undefined
);

export function RegistrationProvider({ children }: { children: ReactNode }) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [currentRegistration, setCurrentRegistration] = useState<Registration | null>(
    null
  );

  const addRegistration = useCallback((reg: Registration) => {
    setRegistrations((prev) => [...prev, reg]);
  }, []);

  const updateRegistration = useCallback(
    (id: string, updates: Partial<Registration>) => {
      setRegistrations((prev) =>
        prev.map((reg) => (reg.id === id ? { ...reg, ...updates } : reg))
      );
      if (currentRegistration?.id === id) {
        setCurrentRegistration({ ...currentRegistration, ...updates });
      }
    },
    [currentRegistration]
  );

  const clearRegistrations = useCallback(() => {
    setRegistrations([]);
    setCurrentRegistration(null);
  }, []);

  return (
    <RegistrationContext.Provider
      value={{
        registrations,
        currentRegistration,
        setCurrentRegistration,
        addRegistration,
        updateRegistration,
        clearRegistrations,
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
}

export function useRegistration() {
  const context = useContext(RegistrationContext);
  if (context === undefined) {
    throw new Error('useRegistration must be used within RegistrationProvider');
  }
  return context;
}
