import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { showError, showSuccess } from '../lib/toast';
import type { Customer } from '../types/database';

export function useCustomers() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    loadCustomers();
  }, [user]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setCustomers(data || []);
    } catch (err) {
      console.error('Error loading customers:', err);
      setError('Failed to load customers');
      showError('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async (email: string, name: string, source: string = 'manual') => {
    try {
      const { data, error: insertError } = await supabase
        .from('customers')
        .insert({
          email,
          name,
          source,
          user_id: user?.id,
          status: 'lead'
        })
        .select()
        .single();

      if (insertError) throw insertError;
      setCustomers(prev => [data, ...prev]);
      showSuccess('Customer added successfully');
      return data;
    } catch (err) {
      console.error('Error adding customer:', err);
      showError('Failed to add customer');
      throw err;
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (updateError) throw updateError;
      setCustomers(prev => prev.map(c => c.id === id ? data : c));
      showSuccess('Customer updated successfully');
      return data;
    } catch (err) {
      console.error('Error updating customer:', err);
      showError('Failed to update customer');
      throw err;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (deleteError) throw deleteError;
      setCustomers(prev => prev.filter(c => c.id !== id));
      showSuccess('Customer deleted successfully');
    } catch (err) {
      console.error('Error deleting customer:', err);
      showError('Failed to delete customer');
      throw err;
    }
  };

  return {
    customers,
    loading,
    error,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    refresh: loadCustomers
  };
}