import { useState } from 'react';
import { api } from '../lib/api';
import type { DashboardPreferences } from '../types/database';

export function usePreferencesApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getPreferences = async () => {
    try {
      setLoading(true);
      setError(null);
      return await api.preferences.get();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch preferences'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (preferences: Partial<DashboardPreferences>) => {
    try {
      setLoading(true);
      setError(null);
      return await api.preferences.upsert(preferences);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update preferences'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    getPreferences,
    updatePreferences,
    loading,
    error,
  };
}