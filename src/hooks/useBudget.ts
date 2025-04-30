import { useState, useEffect } from 'react';
import { supabase, retryOperation } from '../lib/supabase';
import { useAuth } from './useAuth';
import { showError, showSuccess } from '../lib/toast';

interface Budget {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  period: string;
  period_start: string;
  period_end: string;
  created_at: string;
}

interface Expense {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  created_at: string;
}

export function useBudget() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [budgetsData, expensesData] = await Promise.all([
        retryOperation(() =>
          supabase
            .from('marketing_budgets')
            .select('*')
            .eq('user_id', user?.id)
            .order('created_at', { ascending: false })
        ),
        retryOperation(() =>
          supabase
            .from('marketing_expenses')
            .select('*')
            .eq('user_id', user?.id)
            .order('date', { ascending: false })
        )
      ]);

      if (budgetsData.error) throw budgetsData.error;
      if (expensesData.error) throw expensesData.error;

      setBudgets(budgetsData.data || []);
      setExpenses(expensesData.data || []);
    } catch (err) {
      console.error('Error loading budget data:', err);
      setError('Failed to load budget data');
      showError('Failed to load budget data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculatePeriodDates = (period: string) => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1); // Start of current month
    const end = new Date(start);

    switch (period) {
      case 'monthly':
        end.setMonth(end.getMonth() + 1);
        break;
      case 'quarterly':
        end.setMonth(end.getMonth() + 3);
        break;
      case 'yearly':
        end.setFullYear(end.getFullYear() + 1);
        break;
      default:
        throw new Error('Invalid period');
    }
    end.setDate(end.getDate() - 1); // Last day of the period

    return {
      period_start: start.toISOString().split('T')[0],
      period_end: end.toISOString().split('T')[0]
    };
  };

  const addBudget = async (
    category: string,
    amount: number,
    period: string
  ) => {
    try {
      const { period_start, period_end } = calculatePeriodDates(period);

      const { data, error } = await retryOperation(() =>
        supabase
          .from('marketing_budgets')
          .insert({
            category,
            amount,
            period,
            period_start,
            period_end,
            user_id: user?.id
          })
          .select()
          .single()
      );

      if (error) throw error;
      setBudgets(prev => [data, ...prev]);
      showSuccess('Budget added successfully');
      return data;
    } catch (err) {
      console.error('Error adding budget:', err);
      showError('Failed to add budget. Please try again.');
      throw err;
    }
  };

  const addExpense = async (
    category: string,
    amount: number,
    description: string,
    date: Date
  ) => {
    try {
      const { data, error } = await retryOperation(() =>
        supabase
          .from('marketing_expenses')
          .insert({
            category,
            amount,
            description,
            date: date.toISOString().split('T')[0],
            user_id: user?.id
          })
          .select()
          .single()
      );

      if (error) throw error;
      setExpenses(prev => [data, ...prev]);
      showSuccess('Expense added successfully');
      return data;
    } catch (err) {
      console.error('Error adding expense:', err);
      showError('Failed to add expense. Please try again.');
      throw err;
    }
  };

  return {
    budgets,
    expenses,
    loading,
    error,
    addBudget,
    addExpense,
    refresh: loadData
  };
}