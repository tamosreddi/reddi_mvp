"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/supabaseClient";
import { useAuth } from "@/lib/contexts/AuthContext";

// Aqui debe de tener todos los datos de la tienda tal y como en la base de datos Supabase
export interface Store {
  store_id: string;
  user_id: string;
  store_name: string;
  store_address?: string;
  store_category?: string;
  store_phone?: string;
  store_email?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface StoreContextType {
  stores: Store[];
  selectedStore: Store | null;
  setSelectedStore: (store: Store) => void;
  loading: boolean;
  refetchStores: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  // Refactoriza fetchStores para poder llamarla desde fuera
  const fetchStores = async () => {
    if (!user) {
      setStores([]);
      setSelectedStore(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("stores")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) {
      setStores([]);
      setSelectedStore(null);
    } else {
      setStores(data || []);
      setSelectedStore((prev) => {
        if (prev && data?.find((s) => s.store_id === prev.store_id)) return prev;
        return data && data.length > 0 ? data[0] : null;
      });
    }
    setLoading(false);
  };

  // Llama fetchStores en el useEffect inicial
  useEffect(() => {
    fetchStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Expón refetchStores en el contexto
  const refetchStores = fetchStores;

  return (
    <StoreContext.Provider value={{ stores, selectedStore, setSelectedStore, loading, refetchStores }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}