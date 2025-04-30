import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { showError, showSuccess } from '../lib/toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Error checking auth session:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Convert email to lowercase for case-insensitive comparison
      const normalizedEmail = email.toLowerCase();
      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password
      });
      if (error) throw error;
      showSuccess('Successfully signed in');
    } catch (error) {
      console.error('Sign in error:', error);
      showError(error instanceof Error ? error.message : 'Failed to sign in');
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      // Convert email to lowercase for case-insensitive comparison
      const normalizedEmail = email.toLowerCase();

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', normalizedEmail)
        .single();

      if (existingUser) {
        showError('An account with this email already exists');
        throw new Error('Account already exists');
      }

      const { error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
      showSuccess('Account created successfully');
    } catch (error) {
      console.error('Sign up error:', error);
      showError(error instanceof Error ? error.message : 'Failed to create account');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      showSuccess('Successfully signed out');
    } catch (error) {
      console.error('Sign out error:', error);
      showError(error instanceof Error ? error.message : 'Failed to sign out');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}