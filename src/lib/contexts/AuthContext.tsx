"use client";

import React, { createContext, useEffect, useState, useContext } from "react";
import { supabase } from "../supabase/supabaseClient";
import { User, Session } from "@supabase/supabase-js";
import { useDemo } from "./DemoContext";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isDemoMode, user: demoUser } = useDemo();

  useEffect(() => {
    if (isDemoMode) {
      // In demo mode, set a mock session and user
      setUser(demoUser as unknown as User);
      setSession({ user: demoUser as unknown as User } as Session);
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [isDemoMode, demoUser]);

  const signIn = async (email: string, password: string) => {
    if (isDemoMode) {
      // In demo mode, simulate successful login
      setUser(demoUser as unknown as User);
      setSession({ user: demoUser as unknown as User } as Session);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    await supabase.auth.getSession();
    setIsLoading(false);
  };

  const signUp = async (email: string, password: string) => {
    if (isDemoMode) {
      // In demo mode, simulate successful signup
      setUser(demoUser as unknown as User);
      setSession({ user: demoUser as unknown as User } as Session);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    if (isDemoMode) {
      // In demo mode, just clear the session
      setUser(null);
      setSession(null);
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext };

export type { AuthContextType };