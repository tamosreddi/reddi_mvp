'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockUser, mockStore, mockProducts, mockInventory, mockClients, mockTransactions } from '../demo/mockData';

interface DemoContextType {
  isDemoMode: boolean;
  user: typeof mockUser;
  store: typeof mockStore;
  products: typeof mockProducts;
  inventory: typeof mockInventory;
  clients: typeof mockClients;
  transactions: typeof mockTransactions;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Check if we're in demo mode based on environment variable
    setIsDemoMode(process.env.NEXT_PUBLIC_DEMO_MODE === 'true');
  }, []);

  const value = {
    isDemoMode,
    user: mockUser,
    store: mockStore,
    products: mockProducts,
    inventory: mockInventory,
    clients: mockClients,
    transactions: mockTransactions,
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
} 