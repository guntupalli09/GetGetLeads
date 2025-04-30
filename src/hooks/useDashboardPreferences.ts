import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { DashboardPreferences } from '../types/database';

export function useDashboardPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<DashboardPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function loadPreferences() {
      const { data, error } = await supabase
        .from('dashboard_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading preferences:', error);
        return;
      }

      setPreferences(data);
      setLoading(false);
    }

    loadPreferences();
  }, [user]);

  const updatePreferences = async (updates: Partial<DashboardPreferences>) => {
    if (!user) return;

    const { error } = await supabase
      .from('dashboard_preferences')
      .upsert({
        user_id: user.id,
        ...updates,
      });

    if (error) throw error;

    setPreferences(prev => prev ? { ...prev, ...updates } : null);
  };

  return { preferences, loading, updatePreferences };
}