import { useState } from 'react';
import { api } from '../lib/api';
import type { UserMetric } from '../types/database';

export function useMetricsApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createMetric = async (name: string, value: number) => {
    try {
      setLoading(true);
      setError(null);
      return await api.metrics.create({
        metric_name: name,
        metric_value: value,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create metric'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getMetricsByName = async (name: string) => {
    try {
      setLoading(true);
      setError(null);
      return await api.metrics.getMetricsByName(name);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch metrics'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getLatestMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      return await api.metrics.getLatestMetrics();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch latest metrics'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createMetric,
    getMetricsByName,
    getLatestMetrics,
    loading,
    error,
  };
}