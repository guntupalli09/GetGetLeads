import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { retryOperation } from '../lib/supabase';

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  // Wrap auth operations with retry logic
  const enhancedContext = {
    ...context,
    signIn: async (email: string, password: string) => {
      return retryOperation(() => context.signIn(email, password));
    },
    signUp: async (email: string, password: string) => {
      return retryOperation(() => context.signUp(email, password));
    }
  };

  return enhancedContext;
}