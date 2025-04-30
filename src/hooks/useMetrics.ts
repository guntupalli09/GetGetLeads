import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { UserMetric } from '../types/database';

export function useMetrics() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<UserMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function loadMetrics() {
      const { data, error } = await supabase
        .from('user_metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false });

      if (error) {
        console.error('Error loading metrics:', error);
        return;
      }

      setMetrics(data || []);
      setLoading(false);
    }

    loadMetrics();
  }, [user]);

  const addMetric = async (metricName: string, value: number) => {
    if (!user) return;

    const { error, data } = await supabase
      .from('user_metrics')
      .insert({
        user_id: user.id,
        metric_name: metricName,
        metric_value: value,
      })
      .select()
      .single();

    if (error) throw error;
    if (data) setMetrics(prev => [data, ...prev]);
  };

  return { metrics, loading, addMetric };
}